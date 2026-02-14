import { useState } from "react";
import { Link, useNavigate } from "@remix-run/react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import TwoColumns from "~/components/shared/two-columns";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Eye, EyeOff } from "lucide-react";
import loginImg from "~/assets/images/login-cover.png";
import { confirmEmailApi, loginApi } from "~/services/rest-services/auth-api";
import { LoginResponse } from "~/lib/types";
import { setCookie } from "typescript-cookie";
import { toast } from "~/components/ui/use-toast";
import { handleError } from "~/services/axios-instance";
import { jwtDecode } from "jwt-decode";

const schema = z.object({
  email: z
    .string()
    .min(1, { message: "Email is required" })
    .email({ message: "Invalid email address" }),
  password: z.string().min(1, { message: "Password is required" }),
  general: z.string().optional(),
});

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const onSubmit = async (data: { email: string; password: string }) => {
    setIsSubmitting(true);
    try {
      const res = await loginApi(data.email, data.password);
      if (!res?.email_verified) {
        try {
          const result = await confirmEmailApi(res.idToken);
          if (result) {
            toast({
              description: "Plese verify your email to continue",
              variant: "default",
            });
            return navigate("/verify?email=" + data.email);
          } else {
            throw new Error("Invalid response data");
          }
        } catch (error) {
          return toast({
            description: handleError(error),
            variant: "destructive",
            duration: 5000,
          });
        }
      }
      if (res && res.idToken && res.refreshToken) {
        const { idToken, refreshToken }: LoginResponse = res;
        setCookie("idToken", `${idToken}, refreshToken ${refreshToken}`);
        toast({
          description: "Login successful!",
        });
        const decodedToken = jwtDecode<{ "super-admin": boolean }>(res.idToken);
        if (decodedToken["super-admin"]) {
          navigate("/super-admin/home");
        } else {
          navigate("/home");
        }
      } else {
        throw new Error("Invalid response data");
      }
    } catch (error) {
      toast({
        description: handleError(error),
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setIsSubmitting(false);
      reset();
    }
  };

  return (
    <div className="h-screen w-full bg-white">
      <TwoColumns image={loginImg}>
        <div className="w-full grid h-full place-items-center p-5">
          <div className="flex w-full max-w-[449px] flex-col gap-y-5">
            <div className="text-center">
              <h1 className="text-3xl md:text-4xl lg:text-[40px] font-bold text-Black">
                Hey, Welcome Back!
              </h1>
              <h3 className="text-base font-medium text-darkGray mt-3">
                Enter your Credentials to access your Account
              </h3>
            </div>
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="flex w-full flex-col items-start gap-1"
            >
              <div className="my-5 space-y-3 w-full">
                <Input
                  placeholder="Business Email"
                  {...register("email")}
                  className={errors?.email ? "border-red-500" : ""}
                  disabled={isSubmitting}
                />
                {errors?.email && (
                  <p className="text-red-500">
                    {errors.email.message as string}
                  </p>
                )}

                <div className="relative">
                  <Input
                    placeholder="Password"
                    type={showPassword ? "text" : "password"}
                    {...register("password")}
                    className={errors?.password ? "border-red-500" : ""}
                    disabled={isSubmitting}
                  />
                  <div className="absolute right-5 top-[50%] -translate-y-[50%] text-darkGray">
                    {showPassword ? (
                      <EyeOff
                        onClick={() => setShowPassword(false)}
                        className="cursor-pointer"
                      />
                    ) : (
                      <Eye
                        onClick={() => setShowPassword(true)}
                        className="cursor-pointer"
                      />
                    )}
                  </div>
                </div>
                {errors?.password && (
                  <p className="text-red-500">
                    {errors.password.message as string}
                  </p>
                )}
              </div>

              {errors?.general && (
                <p className="text-red-500">
                  {errors.general.message as string}
                </p>
              )}

              <div className="flex justify-end w-full">
                <Button
                  variant={"primary"}
                  size={"primary"}
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Signing In..." : "Sign In"}
                </Button>
              </div>
            </form>

            <Button variant={"secondary"} className="flex items-center gap-x-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 text-primary/80 group-hover:text-primary"
                viewBox="0 0 48 48"
              >
                <path
                  fill="#EA4335"
                  d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                ></path>
                <path
                  fill="#4285F4"
                  d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                ></path>
                <path
                  fill="#FBBC05"
                  d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                ></path>
                <path
                  fill="#34A853"
                  d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                ></path>
                <path fill="none" d="M0 0h48v48H0z"></path>
              </svg>
              Sign In with Google
            </Button>

            <p className="text-center text-lg text-darkGray">
              Don&apos;t have an account?{" "}
              <Link to={"/signup"} className="font-medium text-Blue">
                Register
              </Link>
            </p>
          </div>
        </div>
      </TwoColumns>
    </div>
  );
};

export default Login;
