import { http } from "./config";

export const roomService = {
  getAll: () => {
    return http.get("/room/getAll");
  },
  getPropertyId: (propertyId) => {
    return http.get(`/room/${propertyId}`);
  },
  create: (data) => {
    return http.post("/room/create", data);
  },
  update: (id, data) => {
    return http.put(`/room/update/${id}`, data);
  },
  delete: (id) => {
    return http.delete(`/room/delete/${id}`);
  },
};
