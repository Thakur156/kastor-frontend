import { useState, useEffect } from "react";
import AddSubscription from "~/components/super-admin/add-subscription";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Loader2, Trash2 } from "lucide-react";

import { db } from "~/services/firebase";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  query,
  orderBy,
} from "firebase/firestore";
import { toast } from "~/components/ui/use-toast";

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

  const handleDeletePlan = async (id: string) => {
    try {
      setIsLoading(true);
      await deleteDoc(doc(db, "subscriptions", id));
      toast({
        description: "Subscription plan deleted successfully!",
        variant: "default",
      });
      fetchSubscriptions();
    } catch (error) {
      console.error("Error deleting subscription:", error);
      toast({
        description: "Error deleting subscription plan. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="pb-10">
      <div className="flex flex-col xs:flex-row items-center justify-between my-5">
        <div className="space-y-2">
          <h1 className="text-2xl md:text-3xl font-semibold text-Black">
            Subscription Management
          </h1>
        </div>
        <AddSubscription fetchSubscriptions={fetchSubscriptions} />
      </div>
      <div className="w-full">
        <div className={"border border-Stroke rounded-[20px] overflow-hidden"}>
          <Table className={""}>
            <TableHeader className="bg-Gray whitespace-nowrap">
              <TableRow className="w-full">
                {["Logo", "Title", "Price", "Features", "Actions"].map(
                  (column, index) => (
                    <TableHead
                      key={index}
                      className="text-sm font-medium text-Black px-5"
                    >
                      {column}
                    </TableHead>
                  )
                )}
              </TableRow>
            </TableHeader>
            {isLoading ? (
              <TableBody>
                <TableRow>
                  <TableCell colSpan={5} className="h-32">
                    <div className="w-full h-full flex justify-center items-center">
                      <Loader2 className="animate-spin text-Blue w-6 h-6" />
                    </div>
                  </TableCell>
                </TableRow>
              </TableBody>
            ) : subscriptions.length > 0 ? (
              <TableBody className="whitespace-nowrap">
                {subscriptions.map((row, index) => (
                  <TableRow key={index}>
                    <TableCell
                      key={index}
                      className="text-sm text-[#475467] p-5"
                    >
                      <img
                        src={row.imageUrl}
                        alt={"logo"}
                        className="w-10 h-10 object-cover"
                      />
                    </TableCell>
                    <TableCell
                      key={index}
                      className="text-base text-[#475467] p-5"
                    >
                      {row.planName}
                    </TableCell>
                    <TableCell
                      key={index}
                      className="text-base text-[#475467] p-5"
                    >
                      ${row.price}
                    </TableCell>
                    <TableCell
                      key={index}
                      className="text-sm text-[#475467] p-5"
                    >
                      <ul>
                        {row.features.length > 0 &&
                          row.features.map((feature, index) => (
                            <li key={index}>{feature}</li>
                          ))}
                      </ul>
                    </TableCell>
                    <TableCell className="text-sm text-[#475467] p-5 ">
                      <div className="flex items-center gap-x-2">
                        <AddSubscription
                          type="edit"
                          defaultData={row}
                          fetchSubscriptions={fetchSubscriptions}
                        />
                        <Trash2
                          className="cursor-pointer text-Red"
                          onClick={() => handleDeletePlan(row.id)}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            ) : (
              <TableBody>
                <TableRow>
                  <TableCell colSpan={5} className="h-32">
                    <div className="flex justify-center items-center h-32">
                      <h1>No Subscription Available</h1>
                    </div>
                  </TableCell>
                </TableRow>
              </TableBody>
            )}
          </Table>
        </div>
        {/* {SUBSCRIPTIONS.map((subscription) => (
              <SubscriptionCard
                key={subscription.id}
                subscription={subscription}
              />
            ))} */}
      </div>
    </div>
  );
};

export default Subscription;
