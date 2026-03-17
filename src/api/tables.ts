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

export const editSubAccount = async ({ id, name }: { id: number, name: string }) => {
  const { data } = await api.put(`/tables/sub-accounts/${id}`, { name });
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

export const removeProductFromSubaccount = async ({
  subaccountId,
  detailId,
}: {
  subaccountId: number;
  detailId: number;
}) => {
  const res = await api.delete(
    `/tables/sub-accounts/${subaccountId}/details/${detailId}`,
  );
  if (!res) throw new Error("Error al eliminar producto de la subcuenta");
  return res.data;
}

export const billSubAccount = async ({
  id,
  discount,
  taxes,
}: {
  id: number;
  discount: number;
  taxes: number;
}) => {
  const response = await api.post(`/tables/sub-accounts/${id}/bill`, {
    discount,
    taxes,
  });
  return response.data;
};