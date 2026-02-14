import { Link, useSearchParams, useNavigate } from "@remix-run/react";
import { useEffect } from "react";
import TwoColumns from "~/components/shared/two-columns";
import verifyImg from "~/assets/images/verify-cover.png";

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const email = searchParams.get("email");

  useEffect(() => {
    if (!email) {
      navigate("/");
    }
  }, [email, navigate]);

  if (!email) {
    return null;
  }

  return (
    <div className="h-screen w-full bg-white">
      <TwoColumns image={verifyImg}>
        <div className="w-full grid h-full place-items-center p-5">
          <div className="flex w-full max-w-[449px] flex-col gap-y-12">
            <div className="text-center">
              <h1 className="text-3xl md:text-4xl lg:text-[40px] font-bold text-Black">
                Verify your Email
              </h1>
              <h3 className="text-base font-medium text-darkGray mt-3">
                We have sent an email to:{" "}
                <span className="text-Blue">{email}</span>. Please verify your
                email.
              </h3>
            </div>

            <div className="text-center">
              <p className="text-base font-medium text-darkGray">
                If you have verified,{" "}
                <Link to={"/"} className="text-Blue font-medium">
                  please login here.
                </Link>
              </p>
            </div>
          </div>
        </div>
      </TwoColumns>
    </div>
  );
};

export default VerifyEmail;
