import { getCookie, removeCookie } from "typescript-cookie";
import axios, {
  AxiosError,
  InternalAxiosRequestConfig,
  AxiosResponse,
  isAxiosError,
} from "axios";
import { toast } from "~/components/ui/use-toast";

const baseURL =
  typeof window !== "undefined"
    ? window.ENV.BASE_API_URL
    : process.env.BASE_API_URL;

const axiosInstance = axios.create({
  withCredentials: true,
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const handleError = (error: unknown): string => {
  if (isAxiosError(error) && error.response) {
    return error.response.data.detail || "An unexpected error occurred!";
  }
  return "Network error";
};

axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    if (typeof window !== "undefined") {
      const idToken = getCookie("idToken");
      if (idToken) {
        config.headers.Authorization = `Bearer ${idToken}`;
      }
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response: AxiosResponse): AxiosResponse => response,
  async (error: AxiosError): Promise<AxiosResponse | void> => {
    if (error.response?.status === 401) {
      removeCookie("idToken");
      toast({
        description: "Session expired, please log in again.",
        variant: "destructive",
      });
      await new Promise((resolve) => setTimeout(resolve, 2000));
      window.location.href = "/login";
      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
