import { MetaFunction } from "@remix-run/react";

import { LoaderFunctionArgs, json, redirect } from "@remix-run/node";

import { getUserRole } from "~/services/rest-services/auth-api";
import { jwtDecode } from "jwt-decode";

import InviteUser from "~/components/admin/invite-user";
import CustomTable from "~/components/shared/tables/custom-table";

interface LoaderData {
  userName: string;
  userRole: string;
}

export const meta: MetaFunction = () => {
  return [
    {
      title: "Users | Kastor",
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

function Users() {
  const COLUMNS = [
    {
      key: "id",
      title: "#",
    },
    {
      key: "name",
      title: "Name",
    },
    {
      key: "email",
      title: "Email",
    },
    {
      key: "role",
      title: "Role",
    },
    {
      key: "actions",
      title: "Actions",
    },
  ];
  const DATA = [
    {
      id: 1,
      name: "Connie Brandon",
      email: "connie.brandon@example.com",
      role: "Admin",
    },
    {
      id: 2,
      name: "Aubrey Pat",
      email: "aubrey.pat@example.com",
      role: "Admin",
    },
    {
      id: 3,
      name: "Jane Soham",
      email: "jane.soham@example.com",
      role: "Analyst",
    },
    {
      id: 4,
      name: "Jane Soham",
      email: "jane.soham@example.com",
      role: "Admin",
    },
    {
      id: 5,
      name: "Priscilla Dustin",
      email: "priscilla.dustin@example.com",
      role: "Analyst",
    },
    {
      id: 6,
      name: "Michael Smith",
      email: "michael.smith@example.com",
      role: "Admin",
    },
    {
      id: 7,
      name: "Laura Johnson",
      email: "laura.johnson@example.com",
      role: "Analyst",
    },
  ];

  return (
    <section className="border rounded-3xl">
      <div className="flex items-center w-full justify-between sm:px-4 px-3 my-3">
        <h1 className="text-base sm:text-lg font-semibold">
          User&apos;s Management
        </h1>
        <InviteUser />
      </div>
      <CustomTable columns={COLUMNS} data={DATA} />
    </section>
  );
}

export default Users;
