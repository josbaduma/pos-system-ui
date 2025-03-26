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

export const createNewSubAccount = async ({ nombre }: { nombre: string }) => {
  const { data } = await api.post("/subcuentas", nombre);
  return data;
}

export const editSubAccount = async ({ id, nombre }: { id: number, nombre: string }) => {
  const { data } = await api.put(`/subcuentas/${id}`, { nombre });
  return data;
}