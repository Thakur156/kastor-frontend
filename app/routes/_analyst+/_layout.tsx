import { LoaderFunctionArgs, json, redirect } from "@remix-run/node";
import { Outlet, useLoaderData } from "@remix-run/react";
import Sidebar from "~/components/shared/Sidebar";
import Header from "~/components/shared/Header";
import { getUserRole } from "~/services/rest-services/auth-api";
import { jwtDecode } from "jwt-decode";
import CustomChat from "~/components/analyst/chat-agent/custom-chat";
import { useLocation } from "@remix-run/react";

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

    if (userRole === "super-admin") {
      return redirect("/super-admin/home");
    } else if (userRole === "admin" || userRole === "non-admin") {
      return json<LoaderData>({ userName, userRole });
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

export default function Analyst() {
  const { userName, userRole } = useLoaderData<LoaderData>();
  const location = useLocation();

  return (
    <div className="flex relative h-screen overflow-hidden">
      <Sidebar role={userRole} />
      <div className="flex-1 px-5 overflow-y-auto">
        <Header userName={userName} role={userRole} />
        <Outlet />
      </div>
      {location.pathname !== "/chat" && (
        <div className="fixed bottom-4 right-4 z-10">
          <CustomChat isChatpage={false} />
        </div>
      )}
    </div>
  );
}
