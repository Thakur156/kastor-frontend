import { MetaFunction } from "@remix-run/react";

import { LoaderFunctionArgs, json, redirect } from "@remix-run/node";

import { getUserRole } from "~/services/rest-services/auth-api";
import { jwtDecode } from "jwt-decode";

import { Button } from "~/components/ui/button";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import CustomTable from "~/components/shared/tables/custom-table";

import { Crown, Download } from "lucide-react";
import masterCards from "~/assets/images/mastercards.svg";

interface LoaderData {
  userName: string;
  userRole: string;
}

const COLUMNS = [
  {
    key: "transactionId",
    title: "Transaction ID",
  },
  {
    key: "date",
    title: "Date",
  },
  {
    key: "type",
    title: "Type",
  },
  {
    key: "price",
    title: "Price",
  },
];

const DATA = [
  {
    transactionId: "#BF123973OD",
    date: "10th Aug, 2024",
    type: "Pro Subscription (1 Years)",
    price: "$499 USD",
  },
];

export const meta: MetaFunction = () => {
  return [
    {
      title: "Billing | Kastor",
    },
  ];
};

export async function loader({ request }: LoaderFunctionArgs) {
  const cookieHeader = request.headers.get("Cookie");
  const cookies = cookieHeader?.split(";").reduce((acc, cookie) => {
    const [name, ...rest] = cookie.trim().split("=");
    acc[name] = rest.join("=");
    return acc;
  }, {} as Record<string, string>);

  const idToken = cookies?.idToken;
  // return { userName: "test", userRole: "test" };

  if (!idToken) {
    return redirect("/", {
      headers: {
        "Set-Cookie": "idToken=; Path=/; HttpOnly; Max-Age=0",
      },
    });
  }

  const token = decodeURIComponent(idToken);

  try {
    // Decode the JWT to get the user's email
    const decodedToken = jwtDecode<{ email: string }>(token);
    const email = decodedToken.email;

    // Extract username from email (substring before the @)
    const userName = email.split("@")[0];

    // Fetch the role from the API
    const userRole = await getUserRole(token);

    if (userRole === "admin") {
      return json<LoaderData>({ userName, userRole });
    } else if (userRole === "non-admin") {
      return redirect("/home");
    } else if (userRole === "super-admin") {
      return redirect("/super-admin/home");
    } else {
      return redirect("/", {
        headers: {
          "Set-Cookie": "idToken=; Path=/; HttpOnly; Max-Age=0",
        },
      });
    }
  } catch (error) {
    console.log("error", error);
    return redirect("/", {
      headers: {
        "Set-Cookie": "idToken=; Path=/; HttpOnly; Max-Age=0",
      },
    });
  }
}

const Billing = () => {
  return (
    <div className="my-5">
      <div className="bg-Gray border border-Stroke p-[30px] rounded-[20px] space-y-[30px]">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-5">
          <div className="space-y-[14px]">
            <h3 className="text-sm font-medium text-darkGray uppercase">
              Current Plan
            </h3>
            <h1 className="text-3xl sm:text-4xl lg:text-[50px] font-extrabold text-Black">
              Premium
            </h1>
            <p className="text-base font-medium text-darkGray">
              Unlimited access to the essentails tools for datalake in Kastor
            </p>
          </div>

          <div className="flex flex-col gap-y-5">
            <Button
              variant={"secondary"}
              className="space-x-3 w-[238px] bg-Blue text-white hover:bg-Blue/50"
            >
              <Crown className="mr-3" />
              Upgrade Plan
            </Button>
            <Button variant={"secondary"} className="w-[238px]">
              Cancel Subscription
            </Button>
          </div>
        </div>

        <RadioGroup defaultValue="default" className="space-y-5">
          <PaymentItem name="default" />
          <PaymentItem name="other" />
        </RadioGroup>

        <Button variant={"secondary"} className="w-fit">
          Add Payment Method
        </Button>
      </div>

      <div className="flex items-center justify-between my-10">
        <h2 className="text-xl sm:text-2xl font-bold text-Black">
          Transaction History
        </h2>
        <Button
          variant={"secondary"}
          className="w-fit sm:w-[238px] bg-Blue text-white hover:bg-Blue/50"
        >
          <Download className="sm:mr-3" />
          <span className="hidden sm:block">Download Invoice</span>
        </Button>
      </div>
      <CustomTable columns={COLUMNS} data={DATA} />
    </div>
  );
};

export default Billing;

const PaymentItem = ({ name }: { name: string }) => {
  return (
    <div className="bg-white p-[30px] rounded-[20px] flex flex-wrap items-center justify-between gap-5">
      <div className="flex items-center gap-x-[30px]">
        <RadioGroupItem
          value={name}
          className="text-[#4A90E2] border-[#4A90E2]"
        />
        <div className="space-y-4">
          <h3 className="text-base font-medium text-darkGray">
            Payment Method
          </h3>
          <h3 className="text-2xl font-extrabold text-Black flex items-center gap-x-4">
            <img src={masterCards} alt="masterCards" />
            **** 8256
          </h3>
        </div>
      </div>
      <Button variant={"secondary"} className="w-fit">
        Remove
      </Button>
    </div>
  );
};
