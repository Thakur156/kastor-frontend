import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import graph1 from "~/assets/images/graph-1.svg";
import graph2 from "~/assets/images/graph-2.svg";
import graph3 from "~/assets/images/graph-3.svg";

const FILTERS = [
  {
    value: "today",
    label: "Today",
  },
  {
    value: "weekly",
    label: "Weekly",
  },
  {
    value: "yearly",
    label: "Yearly",
  },
];

const Home = () => {
  return (
    <div className="grid lg:grid-cols-2 gap-8 mb-10">
      <div className="lg:col-span-2">
        <div className="flex items-center justify-between">
          <h1 className="text-xl md:text-2xl xl:text-3xl font-semibold text-black">
            Performance Metrics
          </h1>

          <Select defaultValue="today">
            <SelectTrigger className="rounded-full px-5 w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FILTERS.map((filter) => (
                <SelectItem key={filter.value} value={filter.value}>
                  {filter.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <img src={graph1} alt="graph" className="w-full mt-10" />
      </div>
      <div>
        <div className="flex items-center justify-between">
          <h1 className="text-xl md:text-2xl xl:text-3xl font-semibold text-black">
            Subscription Metrics
          </h1>

          <Select defaultValue="today">
            <SelectTrigger className="rounded-full px-5 w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FILTERS.map((filter) => (
                <SelectItem key={filter.value} value={filter.value}>
                  {filter.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <img src={graph2} alt="graph" className="w-full mt-10" />
      </div>
      <div>
        <div className="flex items-center justify-between">
          <h1 className="text-xl md:text-2xl xl:text-3xl font-semibold text-black">
            User Activity
          </h1>

          <Select defaultValue="today">
            <SelectTrigger className="rounded-full px-5 w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FILTERS.map((filter) => (
                <SelectItem key={filter.value} value={filter.value}>
                  {filter.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <img src={graph3} alt="graph" className="w-full mt-10" />
      </div>
    </div>
  );
};

export default Home;
