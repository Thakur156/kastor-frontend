import { Link } from "react-router-dom";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import * as z from "zod";
import TwoColumns from "~/components/shared/two-columns";
import { useNavigate } from "@remix-run/react";
import signupImg from "~/assets/images/signup-cover.png";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signupApi } from "~/services/rest-services/auth-api";
import { toast } from "~/components/ui/use-toast";
import { useState } from "react";
import { handleError } from "~/services/axios-instance";

const SignupSchema = z.object({
  email: z.string().email("Invalid email"),
  org: z.string().min(1, {
    message: "Company Name is required",
  }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long" }),
});

const Signup = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(SignupSchema),
  });

  const onSubmit = async (data: z.infer<typeof SignupSchema>) => {
    try {
      setLoading(true);
      const response = await signupApi(data.email, data.password, data.org);
      if (response?.idToken) {
        toast({
          description: "Signup successful, Verify your email to continue",
          variant: "default",
        });
        navigate("/verify?email=" + data.email);
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
      setLoading(false);
      reset();
    }
  };

  return (
    <div className="h-screen w-full bg-white">
      <TwoColumns image={signupImg}>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="w-full grid h-full place-items-center overflow-y-auto p-5"
        >
          <div className="flex w-full max-w-[449px] flex-col gap-y-5">
            <div className="text-center">
              <h1 className="text-3xl md:text-4xl lg:text-[40px] font-bold text-Black">
                Create your Account
              </h1>
              <h3 className="text-base font-medium text-darkGray mt-3">
                Enter all required information to join{" "}
                <span className="text-Blue">Kastor</span>
              </h3>
            </div>

            <div className="my-5 space-y-3">
              <Input
                placeholder="Company Name"
                {...register("org")}
                errorMsg={errors.org?.message?.toString() || ""}
                isInvalid={!!errors.org}
              />
              <Input
                placeholder="Business Email"
                {...register("email")}
                errorMsg={errors.email?.message?.toString() || ""}
                isInvalid={!!errors.email}
              />
              <Input
                type="password"
                placeholder="Password"
                {...register("password")}
                errorMsg={errors.password?.message?.toString() || ""}
                isInvalid={!!errors.password}
              />
            </div>

            <div className="flex justify-end">
              <Button
                variant={"primary"}
                size={"primary"}
                type="submit"
                disabled={loading}
              >
                {loading ? "Signing Up..." : "Sign Up"}{" "}
              </Button>
            </div>

            {/* <Button
              type={"button"}
              variant={"secondary"}
              className="flex items-center gap-x-2"
              disabled={loading} // Disable button when loading
            >
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
            </Button> */}

            <p className="text-center text-lg text-darkGray">
              Already have an account?{" "}
              <Link to={"/login"} className="font-medium text-Blue">
                Sign In
              </Link>
            </p>
          </div>
        </form>
      </TwoColumns>
    </div>
  );
};

export default Signup;
