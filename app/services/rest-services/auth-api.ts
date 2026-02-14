import axiosInstance from "../axios-instance";
export const loginApi = async (email: string, password: string) => {
  const response = await axiosInstance.post("/login", {
    email,
    password,
    username: "string",
    sub: "string",
  });
  return response.data;
};

// Get user role
export const getUserRole = async (token: string) => {
  try {
    const response = await axiosInstance.get("/getRole", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("error", error);
    return null;
  }
};

export const signupApi = async (
  email: string,
  password: string,
  org: string
) => {
  const response = await axiosInstance.post("/sign_up", {
    email,
    password,
    org,
  });
  return response.data;
};

export const confirmEmailApi = async (idToken: string) => {
  const response = await axiosInstance.post(
    `resend_confirm_email?idToken=${idToken}`
  );
  return response.data;
};
