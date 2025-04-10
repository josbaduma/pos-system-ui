import { ProductDTO } from "@/constants/ProductDTO";
import api from "./axiosInstance";

export type Table = {
  id: number;
  name: string;
  status: "available" | "occupied" | "reserved";
};

export type SubAccount = {
  id: number;
  table_id: number;
  name: string;
}

export const fetchTables = async (): Promise<Table[]> => {
  const response = await api.get("/tables");
  return response.data;
};

export const fetchSubAccountsActivePerTable = async (table: string | undefined): Promise<SubAccount[]> => {
  if (!table) return [];
  const response = await api.get(`/tables/sub-accounts/${table}`);
  return response.data;
};

export const createNewSubAccount = async ({ body }: { body: { name: string, table_id: number } }) => {
  const { data } = await api.post("/tables/sub-accounts", body);
  return data;
}

export const editSubAccount = async ({ id, nombre }: { id: number, nombre: string }) => {
  const { data } = await api.put(`/tables/sub-accounts/${id}`, { nombre });
  return data;
}

export const updateQuantity = async ({
  subaccountId,
  detailId,
  quantity,
}: {
  subaccountId: number;
  detailId: number;
  quantity: number;
}) => {
  await api.put(
    `/tables/sub-accounts/${subaccountId}/detail/${detailId}`,
    { quantity }
  );
}

export const addProductToSubaccount = async ({ id, product }: { id: number, product: ProductDTO }) => {
  return await api.post(`/tables/sub-accounts/${id}/products`, product);
}