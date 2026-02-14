import ProfileSettings from "~/components/shared/profile/profile-settings";

import { LoaderFunctionArgs, json, redirect } from "@remix-run/node";
import { getUserRole } from "~/services/rest-services/auth-api";
import { jwtDecode } from "jwt-decode";
import { useLoaderData } from "@remix-run/react";

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

    // Return user data
    return json<LoaderData>({ userName, userRole });
  } catch (error) {
    console.error("Error while loading user data:", error);
    return redirect("/", {
      headers: {
        "Set-Cookie": "idToken=; Path=/; HttpOnly; Max-Age=0",
      },
    });
  }
}

function ProfilePage() {
  const { userRole } = useLoaderData<LoaderData>();

  return <ProfileSettings hideBillingInfo={userRole === "non-admin"} />;
}

export default ProfilePage;
