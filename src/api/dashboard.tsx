import api from "./axiosInstance";

export type Sale = {
  id: number;
  sub_total: string;
  discount: string;
  taxes: string;
  total: string;
  created_at: string;
  updated_at: string;
};

export const fetchAllSales = async (): Promise<Sale[]> => {
  const response = await api.get(`/sales/`);
  return response.data.sales;
};
