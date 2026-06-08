import { http } from "./config";
export const conversationService = {
  createOrGet: (data) => {
    return http.post("/conversations/create-or-get", data);
  },

  getMy: () => {
    return http.get("/conversations/my");
  },
  getById: (conversationId) => {
    return http.get(`/conversations/${conversationId}`);
  },
};
