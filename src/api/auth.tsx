// src/api/auth.ts
import api from "./axiosInstance";

type LoginData = {
  email: string;
  password: string;
};

export type LoginResponse = {
  accessToken: string;
  id: number;
};

export const login = async (data: LoginData): Promise<LoginResponse> => {
  const response = await api.post("/auth/login", data);
  return response.data;
};
