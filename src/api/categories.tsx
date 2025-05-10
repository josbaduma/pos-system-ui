import api from "./axiosInstance";

export interface Category {
  id: number;
  name: string;
}

export const fetchCategories = async (): Promise<Category[]> => {
  const response = await api.get("/products/");
  return response.data.categories;
};

export const deleteCategory = async (id: number): Promise<string> => {
  const response = await api.delete(`/products/categories/${id}`);
  return response.data;
};

export const createCategory = async ({
  name,
}: {
  name: string;
}): Promise<Category[]> => {
  const response = await api.post("/products/categories", {
    name,
  });
  return response.data;
};

export const editCategory = async ({
  id,
  name,
}: {
  id: number;
  name: string;
  price: number;
  category_id: number;
}): Promise<Category[]> => {
  const response = await api.put(`/products/categories/${id}`, {
    name,
  });
  return response.data;
};
