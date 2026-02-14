import { useEffect, useState } from "react";
import { MetaFunction } from "@remix-run/react";

import { LoaderFunctionArgs, json, redirect } from "@remix-run/node";

import { getUserRole } from "~/services/rest-services/auth-api";
import { jwtDecode } from "jwt-decode";
import SubscriptionCard from "~/components/admin/subscription-card";
import { getDocs, collection, query, orderBy } from "firebase/firestore";
import { db } from "~/services/firebase";
import Loader from "~/components/shared/loader";

interface LoaderData {
  userName: string;
  userRole: string;
}

export const meta: MetaFunction = () => {
  return [
    {
      title: "Subscription | Kastor",
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

const Subscription = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  // Fetch subscriptions from Firestore
  const fetchSubscriptions = async () => {
    try {
      setIsLoading(true);
      const querySnapshot = await getDocs(
        query(collection(db, "subscriptions"), orderBy("price", "asc"))
      );
      const subscriptionsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setSubscriptions(subscriptionsData);
      console.log("subscription data", subscriptionsData);
    } catch (error) {
      console.error("Error fetching subscriptions:", error);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="my-5">
      {isLoading ? (
        <div className="h-[80vh] grid place-items-center">
          <Loader />
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {subscriptions.map((subscription) => (
            <SubscriptionCard
              key={subscription.id}
              subscription={subscription}
              isActive={subscription.id === 3}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Subscription;
