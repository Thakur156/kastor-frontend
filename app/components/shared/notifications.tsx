import { useState, useCallback } from "react";
import {
  // UserNotificationsApi,
  // OrgNotificationsApi,
  ReadNotification,
} from "~/services/rest-services/notification-api";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "~/components/ui/tabs";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "~/components/ui/popover";
import { Bell, BellDot } from "lucide-react";
import { Button } from "../ui/button";

type Notification = {
  id: string;
  notification_task: string;
  message: string;
  created_at: string;
  read_status: boolean;
};

const Notifications = () => {
  const [userNotifications, setUserNotifications] = useState<Notification[]>(
    []
  );
  const [orgNotifications, setOrgNotifications] = useState<Notification[]>([]);
  const [activeTab, setActiveTab] = useState<"user" | "org">("user");

  // Function to fetch notifications
  // const fetchNotifications = useCallback(async () => {
  //   try {
  //     const [userResponse, orgResponse] = await Promise.all([
  //       UserNotificationsApi(),
  //       OrgNotificationsApi(),
  //     ]);

  //     setUserNotifications(userResponse);
  //     setOrgNotifications(orgResponse);
  //   } catch (error) {
  //     console.error("Failed to fetch notifications:", error);
  //   }
  // }, []);

  // useEffect(() => {
  //   fetchNotifications();

  //   const intervalId = setInterval(fetchNotifications, 30000);

  //   return () => {
  //     clearInterval(intervalId);
  //   };
  // }, [fetchNotifications]);

  // Handle read status update
  const handleReadStatus = useCallback(
    async (type: "user" | "org", id: string) => {
      try {
        await ReadNotification({ notification_id: id });

        if (type === "user") {
          setUserNotifications((prevState) =>
            prevState.map((notification) =>
              notification.id === id
                ? { ...notification, read_status: true }
                : notification
            )
          );
        } else if (type === "org") {
          setOrgNotifications((prevState) =>
            prevState.map((notification) =>
              notification.id === id
                ? { ...notification, read_status: true }
                : notification
            )
          );
        }
      } catch (error) {
        console.error("Failed to update read status:", error);
      }
    },
    []
  );

  // Render Notification Cards
  const renderNotifications = useCallback(
    (notifications: Notification[], type: "user" | "org") => (
      <>
        {notifications.length === 0 ? (
          <p className="text-center text-gray-500">
            No notifications available.
          </p>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-4 rounded-md shadow-sm border ${
                notification.read_status ? "bg-gray-50" : "bg-gray-200"
              }`}
            >
              <div className="flex justify-between items-start flex-wrap w-full">
                <div className="w-full break-words mb-2">
                  <p className="font-semibold text-lg text-gray-800 break-words">
                    {notification.notification_task}
                  </p>
                  <p className="text-base text-gray-600 break-words">
                    {notification.message}
                  </p>
                  <p className="text-xs text-gray-500 break-words">
                    {new Date(notification.created_at).toLocaleString()}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="link"
                  onClick={() => handleReadStatus(type, notification.id)}
                  disabled={notification.read_status}
                >
                  {notification.read_status ? "Read" : "Mark as Read"}
                </Button>
              </div>
            </div>
          ))
        )}
      </>
    ),
    [handleReadStatus]
  );

  const hasUnreadNotifications =
    userNotifications.some((notification) => !notification.read_status) ||
    orgNotifications.some((notification) => !notification.read_status);

  return (
    <div>
      {/* Popover for Notifications */}
      <Popover>
        <PopoverTrigger asChild>
          <div className="hidden xs:flex w-[60px] h-[60px] items-center justify-center border border-Stroke rounded-full cursor-pointer">
            {hasUnreadNotifications ? (
              <BellDot size={20} />
            ) : (
              <Bell size={20} />
            )}
          </div>
        </PopoverTrigger>
        <PopoverContent className="p-4 bg-white shadow-lg rounded-lg max-h-96 overflow-y-auto w-[450px]">
          {/* Tabs using shadcn inside Popover */}
          <Tabs
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as "user" | "org")}
          >
            <TabsList className="flex space-x-4 justify-center mb-4">
              <TabsTrigger
                value="user"
                className="px-3 py-1 rounded text-sm font-medium text-gray-800 border-b-2 border-transparent hover:border-blue-500"
              >
                User Notifications ({userNotifications.length})
              </TabsTrigger>
              <TabsTrigger
                value="org"
                className="px-3 py-1 rounded text-sm font-medium text-gray-800 border-b-2 border-transparent hover:border-blue-500"
              >
                Organization Notifications ({orgNotifications.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="user" className="space-y-4 h-fit">
              {renderNotifications(userNotifications, "user")}
            </TabsContent>

            <TabsContent value="org" className="space-y-4">
              {renderNotifications(orgNotifications, "org")}
            </TabsContent>
          </Tabs>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default Notifications;
