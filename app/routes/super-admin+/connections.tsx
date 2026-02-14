import { useEffect, useState } from "react";
import AddConnection from "~/components/super-admin/add-connection";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { db as firestore } from "~/services/firebase";
import { collection, doc, deleteDoc, getDocs } from "firebase/firestore";
import Loader from "~/components/shared/loader";
import DeleteModal from "~/components/shared/delete-modal";

const columns = [
  {
    key: "id",
    title: "#",
  },
  {
    key: "logo",
    title: "Logo",
  },
  {
    key: "name",
    title: "Name",
  },
  {
    key: "type",
    title: "Type",
  },
  {
    key: "actions",
    title: "Actions",
  },
];

const Connections = () => {
  const [connectionData, setConnectionData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch connections from Firestore
  const fetchConnections = async () => {
    try {
      const connectionsCollection = collection(firestore, "connections");
      const querySnapshot = await getDocs(connectionsCollection);
      const data = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setConnectionData(data);
    } catch (error) {
      console.error("Error fetching connections:", error);
    } finally {
      setLoading(false);
    }
  };

  // Delete a connection by ID
  const deleteConnection = async (id: string) => {
    try {
      setLoading(true);
      const connectionRef = doc(firestore, "connections", id);
      await deleteDoc(connectionRef);
      // Refetch data after deletion
      fetchConnections();
    } catch (error) {
      console.error("Error deleting connection:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConnections();
  }, []);

  return (
    <>
      <div className="flex flex-col xs:flex-row items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-2xl sm:3xl md:4xl lg:text-5xl font-extrabold text-Black">
            Manage Connections
          </h1>
        </div>
        <AddConnection fetchConnections={fetchConnections} />
      </div>

      {loading ? (
        <div className="flex justify-center mt-20">
          <Loader />
        </div>
      ) : (
        <div className="my-10">
          <div
            className={"border border-Stroke rounded-[20px] overflow-hidden"}
          >
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
                {connectionData.length > 0 ? (
                  connectionData.map((row, index) => (
                    <TableRow key={row.id}>
                      <TableCell className="text-sm text-[#475467] p-5">
                        {index + 1}
                      </TableCell>
                      <TableCell className="text-sm text-[#475467] p-5">
                        <img
                          src={row.imageUrl}
                          alt={row.name}
                          className="w-[50px]"
                        />
                      </TableCell>
                      <TableCell className="text-sm text-[#475467] p-5">
                        <div className="flex items-center gap-x-2">
                          {row.name}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-[#475467] p-5">
                        {row.type}
                      </TableCell>
                      <TableCell className="text-sm text-[#475467] p-5">
                        <div className="flex items-center gap-2">
                          <DeleteModal
                            onConfirm={() => deleteConnection(row.id)}
                          />
                          <AddConnection
                            type="edit"
                            initialValues={row}
                            fetchConnections={fetchConnections}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="text-center text-sm text-[#475467] p-5"
                    >
                      No connections available.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </>
  );
};

export default Connections;
