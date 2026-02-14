import axiosInstance from "../axios-instance";

export const UserNotificationsApi = async () => {
  const response = await axiosInstance.get("/notifications/user-notifications");
  return response.data;
};

export const OrgNotificationsApi = async () => {
  const response = await axiosInstance.get("/notifications/org-notifications");
  return response.data;
};

export const ReadNotification = async ({ notification_id }) => {
  const response = await axiosInstance.get(
    `notifications/mark-as-read?notification_id=${notification_id}`
  );
  return response.data;
};
