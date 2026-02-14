import { Check, Pause, Search, Trash2 } from "lucide-react";
import AddConnection from "~/components/super-admin/add-connection";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Switch } from "~/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";

const connectionData = [
  {
    id: 1,
    name: "Example of failing connection",
    source: "Datalog",
    frequency: "24 hours",
    lastSync: "2 days ago",
    isActive: false,
  },
  {
    id: 2,
    name: "Metabase",
    source: "Metabase",
    frequency: "24 hours",
    lastSync: "8 hours ago",
    isActive: true,
  },
  {
    id: 3,
    name: "Square (Connector builder)",
    source: "Square",
    frequency: "24 hours",
    lastSync: "8 hours ago",
    isActive: true,
  },
  {
    id: 4,
    name: "Typeform",
    source: "Typeform",
    frequency: "24 hours",
    lastSync: "8 hours ago",
    isActive: true,
  },
  {
    id: 5,
    name: "Zoom Snowflake",
    source: "Zoom",
    frequency: "24 hours",
    lastSync: "8 hours ago",
    isActive: true,
  },
];

const columns = [
  {
    key: "id",
    title: "#",
  },
  {
    key: "name",
    title: "Name",
  },
  {
    key: "source",
    title: "Source",
  },
  {
    key: "frequency",
    title: "Frequency",
  },
  {
    key: "lastSync",
    title: "Last Sync",
  },
  {
    key: "enabled",
    title: "Enabled",
  },
  {
    key: "actions",
    title: "actions",
  },
];

const Connections = () => {
  return (
    <div>
      <div className="flex flex-col xs:flex-row items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-2xl sm:3xl md:4xl lg:text-5xl font-extrabold text-Black">
            Manage Connections
          </h1>
        </div>
      </div>
      <div className="mt-10 flex flex-col md:flex-row items-center gap-5">
        <div className="relative w-full flex-1">
          <Search size={20} className="absolute inset-5" />
          <Input
            placeholder="Search"
            className="pl-12 bg-white border border-Stroke"
          />
        </div>
        <div className="flex items-center gap-5">
          <div>
            <Select defaultValue="all-connections">
              <SelectTrigger className="border-0 bg-Gray h-[60px] focus:ring-transparent rounded-full text-lg text-Black px-6 ">
                <SelectValue placeholder="Connections" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-connections">All Connections</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Select defaultValue="all-statues">
              <SelectTrigger className="border-0 bg-Gray h-[60px] focus:ring-transparent rounded-full text-lg text-Black px-6 ">
                <SelectValue placeholder="Schedule Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-statues">All Statuses</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Select defaultValue="all-sources">
              <SelectTrigger className="border-0 bg-Gray h-[60px] focus:ring-transparent rounded-full text-lg text-Black px-6 ">
                <SelectValue placeholder="Sources" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-sources">All Sources</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      <div className="my-10">
        <div className={"border border-Stroke rounded-[20px] overflow-hidden"}>
          <Table>
            <TableHeader className="bg-Gray whitespace-nowrap">
              <TableRow className="w-full">
                {columns.map((column, index) => (
                  <TableHead
                    key={index}
                    className="text-sm font-medium text-Black px-5"
                  >
                    {column.title}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody className="whitespace-nowrap">
              {connectionData.map((row, index) => (
                <TableRow key={index}>
                  <TableCell key={index} className="text-sm text-[#475467] p-5">
                    {index + 1}
                  </TableCell>
                  <TableCell className="text-sm text-[#475467] p-5 flex items-center gap-x-2">
                    {row.isActive ? (
                      <div className="bg-Blue h-8 w-8 rounded-full grid place-items-center">
                        <Check size={20} className="text-white" />
                      </div>
                    ) : (
                      <div className="bg-darkGray h-8 w-8 rounded-full grid place-items-center">
                        <Pause size={20} className="" />
                      </div>
                    )}
                    {row.name}
                  </TableCell>
                  <TableCell className="text-sm text-[#475467] p-5">
                    {row.source}
                  </TableCell>
                  <TableCell className="text-sm text-[#475467] p-5">
                    {row.frequency}
                  </TableCell>
                  <TableCell className="text-sm text-[#475467] p-5">
                    {row.lastSync}
                  </TableCell>
                  <TableCell className="text-sm text-[#475467] p-5">
                    <Switch defaultChecked={row.isActive} />
                  </TableCell>
                  <TableCell className="text-sm text-[#475467] p-5">
                    <div className="flex items-center gap-2">
                      <Trash2 size={20} />
                      <AddConnection type="edit" />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default Connections;
