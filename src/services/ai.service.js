import { http } from "./config";

export const aiService = {
  suggestStay: (message) => {
    return http.post("/ai/suggest-stay", { message });
  },
};
