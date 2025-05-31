import api from "./axiosInstance";

export interface Customer {
  id: number;
  name: string;
}

export const fetchCustomers = async (): Promise<Customer[]> => {
  const response = await api.get("/customers/");
  return response.data.customers;
};

export const deleteCustomer = async (id: number): Promise<string> => {
  const response = await api.delete(`/customers/${id}`);
  return response.data;
};

export const createCustomer = async ({
  name,
  email,
  phone,
  address,
}: {
  name: string;
  email: string;
  phone: string;
  address: string;
}): Promise<Customer[]> => {
  const response = await api.post("/customers", {
    name,
    email,
    phone,
    address,
    password: "customer123",
  });
  return response.data;
};

export const editCustomer = async ({
  id,
  name,
}: {
  id: number;
  name: string;
  price: number;
  category_id: number;
}): Promise<Customer[]> => {
  const response = await api.put(`/customers/${id}`, {
    name,
  });
  return response.data;
};
