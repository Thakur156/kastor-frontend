import { Plus } from "lucide-react";
import { Button } from "../ui/button";
import { Link } from "@remix-run/react";

function home() {
  return (
    <div className="flex flex-col gap-4 items-center justify-center h-[calc(90vh-100px)]">
      <h1 className="text-4xl font-bold">
        Welcome To <span className="text-primary">Kastor</span> 👋
      </h1>
      <Link to={"/sources"}>
        <Button size="secondary" className="rounded-full text-lg">
          <div className="p-2 bg-white rounded-full mr-2">
            <Plus className="text-black" />
          </div>
          Add Connection
        </Button>
      </Link>
    </div>
  );
}

export default home;
