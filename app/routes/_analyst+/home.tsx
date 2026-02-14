import Home from "~/components/analyst/home";
import { MetaFunction } from "@remix-run/react";

export const meta: MetaFunction = () => {
  return [
    {
      title: "Home | Kastor",
    },
  ];
};

const HomePage = () => {
  return <Home />;
};

export default HomePage;
