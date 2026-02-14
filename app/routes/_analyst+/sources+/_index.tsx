import { MetaFunction } from "@remix-run/react";
import { Button } from "~/components/ui/button";
import { collection, getDocs } from "firebase/firestore";
import { useState, useEffect } from "react";
import { db as firestore } from "~/services/firebase";
import Loader from "~/components/shared/loader";
import CsvComponent from "../../../components/analyst/connectors/csv";
import DatabaseComponent from "~/components/analyst/connectors/database";

export const meta: MetaFunction = () => {
  return [
    {
      title: "Sources | Kastor",
    },
  ];
};

const Sources = () => {
  const [connectionData, setConnectionData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedConnection, setSelectedConnection] = useState(null); // Track the selected connection

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

  useEffect(() => {
    fetchConnections();
  }, []);

  const handleConnection = (connection) => {
    setSelectedConnection(connection);
  };

  return (
    <div className="my-5">
      <h2 className="text-2xl font-semibold text-Black my-5">
        Add a Connection
      </h2>
      {loading ? (
        <div className="flex justify-center mt-20">
          <Loader />
        </div>
      ) : selectedConnection ? (
        // Dynamically render the component based on connection type
        selectedConnection.type === "csv" ? (
          <CsvComponent />
        ) : (
          <DatabaseComponent connection={selectedConnection} />
        )
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {connectionData.map((connection) => (
            <div
              key={connection.name}
              className="flex flex-col items-center gap-y-5 p-7 border border-Stroke rounded-[20px] bg-Gray"
            >
              <img
                src={connection.imageUrl}
                alt={connection.name}
                loading="lazy"
              />
              <h3 className="text-2xl font-semibold text-Black">
                {connection.name}
              </h3>
              <Button
                variant={"secondary"}
                className="w-fit bg-white"
                onClick={() => handleConnection(connection)}
              >
                Add Connection
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Sources;
