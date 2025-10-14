import axios from "axios";

export const api = axios.create({
  baseURL: "http://localhost:3001/api",
  withCredentials: true,
});

export const ReportAPI = {
  getProductionReport: (params?: any) =>
    api.get("/reports/production", { params }),
  getQualityReport: (params?: any) => api.get("/reports/quality", { params }),
  getInventoryReport: (params?: any) =>
    api.get("/reports/inventory", { params }),
};
