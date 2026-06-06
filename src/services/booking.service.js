import { http } from "./config";

export const BookingService = {
  getAll: () => {
    return http.get("/booking/getAll");
  },
  create: (data) => {
    return http.post("/booking/create", data);
  },
  update: (bookingId, data) => {
    return http.put(`/booking/update/${bookingId}`, data);
  },
  delete: (bookingId) => {
    return http.delete(`/booking/delete/${bookingId}`);
  },
  getByUserId: (userId) => {
    return http.get(`/booking/user/${userId}`);
  },
  updateStatus: (bookingId, status) => {
    return http.patch(`/booking/${bookingId}/status`, { status });
  },
  createPayOSPayment: (bookingId) => {
    return http.post(`/booking/payos/create/${bookingId}`);
  },
};
