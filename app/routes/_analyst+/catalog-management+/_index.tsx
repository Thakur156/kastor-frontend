import React, { useEffect, useState } from "react";
import { MetaFunction } from "@remix-run/react";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "~/components/ui/table";
import {
  TableProperties,
  ChevronDown,
  ChevronUp,
  Database,
} from "lucide-react";
import EditCatalog from "~/components/admin/edit-catalog";
import {
  deleteTable,
  getNamespaces,
  getNameSpaceTables,
  deleteNamespace,
} from "~/services/rest-services/catalog-api";
import Loader from "~/components/shared/loader";
import DeleteModal from "~/components/shared/delete-modal";

import { LoaderFunctionArgs, json, redirect } from "@remix-run/node";

import { getUserRole } from "~/services/rest-services/auth-api";
import { jwtDecode } from "jwt-decode";
import { toast } from "~/components/ui/use-toast";

const columns = [
  {
    key: "no",
    title: "#",
  },
  {
    key: "name",
    title: "Namespace Name",
  },
  {
    key: "actions",
    title: "Actions",
  },
];

export const meta: MetaFunction = () => {
  return [
    {
      title: "Catalog | Kastor",
    },
  ];
};

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

const Catalog = () => {
  const [namespaces, setNamespaces] = useState<
    { name: string; databases: number }[]
  >([]);
  const [expandedNamespace, setExpandedNamespace] = useState<string | null>(
    null
  ); // Expanded namespace state
  const [tables, setTables] = useState<{ [key: string]: string[] }>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [tableLoading, setTableLoading] = useState<string | null>(null); // Track which namespace's tables are loading

  useEffect(() => {
    const fetchNamespaces = async () => {
      setLoading(true); // Start loading namespaces
      try {
        const result = await getNamespaces();
        const namespaceData = result?.namespaces.map((ns: string) => ({
          name: ns,
        }));
        setNamespaces(namespaceData || []);
      } catch (error) {
        console.error("Error fetching namespaces:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchNamespaces();
  }, []);

  const handleToggle = async (namespaceName: string) => {
    if (expandedNamespace === namespaceName) {
      setExpandedNamespace(null);
      setTableLoading(null);
    } else {
      setExpandedNamespace(namespaceName);
      if (!tables[namespaceName]) {
        setTableLoading(namespaceName);
        try {
          const tablesForNamespace = await getNameSpaceTables(namespaceName);
          setTables((prev) => ({
            ...prev,
            [namespaceName]: tablesForNamespace.tables,
          }));
        } catch (error) {
          console.error("Error fetching tables:", error);
        } finally {
          setTableLoading(null); // Stop loading when tables are fetched
        }
      }
    }
  };

  const handleDeleteTable = async (namespace: string, tableName: string) => {
    console.log("Delete table", namespace, tableName);
    try {
      const res = await deleteTable(namespace, tableName);
      console.log("response delete table", res);
      setTables((prev) => ({
        ...prev,
        [namespace]: prev[namespace].filter((table) => table !== tableName),
      }));
      toast({
        description: res.message,
      });
    } catch (error) {
      console.error("Error deleting table:", error.response.data);
      toast({
        description: error.response.data.detail || "Something went wrong",
        variant: "destructive",
      });
    }
  };

  const handleDeleteNamespace = async (namespace: string) => {
    console.log("delete Namespace", namespace);
    try {
      const res = await deleteNamespace(namespace);
      setNamespaces((prev) => prev.filter((ns) => ns.name !== namespace));
      toast({
        description: res?.message || "Namespace deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting namespace:", error.response.data);
      toast({
        description: error.response.data.detail || "Something went wrong",
        variant: "destructive",
      });
    }
  };

  return (
    <section className="border rounded-3xl overflow-hidden">
      <div className="flex items-center w-full justify-between sm:px-4 px-3 my-3">
        <h1 className="text-base sm:text-lg font-semibold">
          Namespace Management
        </h1>
      </div>
      <div className={"border border-Stroke rounded-b-[20px] overflow-hidden"}>
        {loading ? (
          <div className="flex justify-center p-5">
            <Loader size={24} />{" "}
          </div>
        ) : (
          <Table>
            <TableHeader className="bg-Gray">
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
            <TableBody>
              {namespaces.length > 0 ? (
                namespaces.map((row, index) => (
                  <React.Fragment key={index}>
                    <TableRow>
                      <TableCell className="text-sm text-[#475467] p-5">
                        {index + 1}
                      </TableCell>
                      <TableCell className="text-sm text-[#475467] p-5 flex items-center gap-x-3">
                        <Database size={20} className="text-Blue" />
                        {row.name}
                      </TableCell>
                      <TableCell className="text-sm text-[#475467] p-5">
                        <div className="flex items-center gap-x-2">
                          <button onClick={() => handleToggle(row.name)}>
                            {expandedNamespace === row.name ? (
                              <ChevronUp size={20} />
                            ) : (
                              <ChevronDown size={20} />
                            )}
                          </button>
                          <EditCatalog name={row.name} />
                          <DeleteModal
                            onConfirm={async () =>
                              handleDeleteNamespace(row.name)
                            }
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                    {expandedNamespace === row.name && (
                      <>
                        {tableLoading === row.name ? (
                          <TableRow>
                            <TableCell colSpan={3} className="p-5">
                              <div className="flex justify-center items-center">
                                <Loader size={24} />
                              </div>
                            </TableCell>
                          </TableRow>
                        ) : tables[row.name]?.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={3} className="text-center p-5">
                              No tables found for this namespace.
                            </TableCell>
                          </TableRow>
                        ) : (
                          tables[row.name]?.map((table, tableIndex) => (
                            <TableRow key={tableIndex}>
                              <TableCell className="text-sm p-5">
                                {tableIndex + 1}
                              </TableCell>
                              <TableCell className="text-sm p-5 flex items-center gap-x-3">
                                <TableProperties
                                  size={20}
                                  className="text-Green"
                                />
                                {table}
                              </TableCell>
                              <TableCell className="text-sm p-5">
                                <div className="flex items-center gap-x-3">
                                  <button className="text-sm text-blue-500">
                                    <EditCatalog
                                      name={table}
                                      isTable
                                      namespace={row.name}
                                    />
                                  </button>
                                  <DeleteModal
                                    onConfirm={async () =>
                                      handleDeleteTable(row.name, table)
                                    }
                                  />
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </>
                    )}
                  </React.Fragment>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-sm p-5">
                    No namespaces available.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </div>
    </section>
  );
};

export default Catalog;
