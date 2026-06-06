import { http } from "./config";

export const reviewService = {
  getAll: () => {
    return http.get("/review/getAll");
  },
  create: (data) => {
    return http.post("/review/create", data);
  },
  update: (id, data) => {
    return http.put(`/review/update/${id}`, data);
  },
  visibility: (id, is_visible) => {
    return http.patch(`/review/visibility/${id}`, { is_visible });
  },
  delete: (id) => {
    return http.delete(`/review/delete/${id}`);
  },
};
