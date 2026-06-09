import { http } from "./config";

export const statisticService = {
  getAdminStatistics: () => {
    return http.get("/statistics/admin");
  },
};
