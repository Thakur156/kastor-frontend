import { Outlet, useLoaderData } from "@remix-run/react";
import Sidebar from "~/components/shared/Sidebar";
import Header from "~/components/shared/Header";

import { LoaderFunctionArgs, json, redirect } from "@remix-run/node";
import { getUserRole } from "~/services/rest-services/auth-api";
import { jwtDecode } from "jwt-decode";

interface LoaderData {
  userName: string;
  userRole: string;
}

export async function loader({ request }: LoaderFunctionArgs) {
  const cookieHeader = request.headers.get("Cookie");
  const cookies = cookieHeader?.split(";").reduce((acc, cookie) => {
    const [name, ...rest] = cookie.trim().split("=");
    acc[name] = rest.join("=");
    return acc;
  }, {} as Record<string, string>);

  const idToken = cookies?.idToken;

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

    if (userRole === "super-admin") {
      return json<LoaderData>({ userName, userRole });
    } else if (userRole === "admin") {
      return redirect("/home");
    } else if (userRole === "non-admin") {
      return redirect("/home");
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

const SuperAdminLayout = () => {
  const { userName, userRole } = useLoaderData<LoaderData>();
  return (
    <div className="flex relative h-screen overflow-hidden">
      <Sidebar isSuperAdmin role={userRole} />
      <div className="flex-1 px-5 overflow-y-auto">
        <Header isSuperAdmin userName={userName} role={userRole} />
        <Outlet />
      </div>
    </div>
  );
};

export default SuperAdminLayout;
