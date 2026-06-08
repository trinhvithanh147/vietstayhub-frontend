import { http } from "./config";
export const messageService = {
  getByConversation: (conversationId) => {
    return http.get(`/messages/${conversationId}`);
  },
};
