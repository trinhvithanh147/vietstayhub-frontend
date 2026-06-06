import { http } from "./config";

export const userService = {
  getAll: () => {
    return http.get("/users/getAll");
  },
  create: (data) => {
    return http.post("/users/create", data);
  },
  login: (data) => {
    return http.post("/users/login", data);
  },
  refreshToken: () => {
    return http.post("/users/refresh-token");
  },
  logout: () => {
    return http.post("/users/logout");
  },
  requestPasswordReset: (data) => {
    return http.post("/users/request-password-reset", data);
  },
  verifyResetCode: (data) => {
    return http.post("/users/verify-reset-code", data);
  },
  resetPassword: (data) => {
    return http.post("/users/reset-password", data);
  },
  getById: (id) => {
    return http.get(`/users/getById/${id}`);
  },
  delete: (id) => {
    return http.delete(`/users/delete/${id}`);
  },
  update: (id, data) => {
    return http.patch(`/users/update/${id}`, data);
  },
  uploadCloud: (formData) => {
    return http.patch("/users/avatar/cloud", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
  uploadCloudById: (id, formData) => {
    return http.patch(`/users/avatar/cloud/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
};
