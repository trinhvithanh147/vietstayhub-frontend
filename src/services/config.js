import axios from "axios";

const apiBaseUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";

export const http = axios.create({
  baseURL: apiBaseUrl,
  timeout: 5000,
  withCredentials: true,
});

let isRefreshing = false;
let pendingRequests = [];

const resolvePendingRequests = (newToken) => {
  pendingRequests.forEach(({ resolve }) => resolve(newToken));
  pendingRequests = [];
};

const rejectPendingRequests = (error) => {
  pendingRequests.forEach(({ reject }) => reject(error));
  pendingRequests = [];
};

const clearAuthStorage = () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("user");
};

http.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

http.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error?.response?.status;
    const isRefreshRequest = originalRequest?.url?.includes("/users/refresh-token");
    const isLoginRequest = originalRequest?.url?.includes("/users/login");

    if (
      status !== 401 ||
      !originalRequest ||
      originalRequest._retry ||
      isRefreshRequest ||
      isLoginRequest
    ) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        pendingRequests.push({ resolve, reject });
      }).then((newToken) => {
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return http(originalRequest);
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const refreshRes = await axios.post(
        `${apiBaseUrl}/users/refresh-token`,
        {},
        {
          withCredentials: true,
        },
      );

      const newAccessToken = refreshRes?.data?.metaData?.accessToken;
      const refreshedUser = refreshRes?.data?.metaData?.user;

      if (!newAccessToken) {
        throw new Error("Không lấy được accessToken mới");
      }

      localStorage.setItem("accessToken", newAccessToken);
      if (refreshedUser) {
        localStorage.setItem("user", JSON.stringify(refreshedUser));
      }

      resolvePendingRequests(newAccessToken);
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      return http(originalRequest);
    } catch (refreshError) {
      clearAuthStorage();
      rejectPendingRequests(refreshError);
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);
