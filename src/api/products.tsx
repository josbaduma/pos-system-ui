import api from "./axiosInstance";

export interface Product {
  id: number;
  name: string;
  price: number;
}

export interface Category {
  id: number;
  name: string;
  products: Product[];
}

export const fetchProducts = async (): Promise<Category[]> => {
  const response = await api.get("/products");
  return response.data.categories;
};

export const deleteProduct = async (id: number): Promise<string> => {
  const response = await api.delete(`/products/${id}`);
  return response.data;
};

export const createProduct = async ({
  name,
  price,
  category_id,
}: {
  name: string;
  price: number;
  category_id: number;
}): Promise<Category[]> => {
  const response = await api.post("/products", {
    name,
    price,
    category_id,
  });
  return response.data;
};

export const editProduct = async ({
  id,
  name,
  price,
  category_id,
}: {
  id: number;
  name: string;
  price: number;
  category_id: number;
}): Promise<Category[]> => {
  const response = await api.put(`/products/${id}`, {
    name,
    price,
    category_id,
  });
  return response.data;
};
