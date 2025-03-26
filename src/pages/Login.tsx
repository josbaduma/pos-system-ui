// src/pages/Login.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useAuthStore } from "@/store/authStore";
import { login, LoginResponse } from "@/api/auth";
import { useNavigate } from "react-router-dom";
import logo from "../assets/image-logo.png";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const setToken = useAuthStore((state) => state.setToken);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate({ email, password });
  };

  const mutation = useMutation({
    mutationFn: login,
    onSuccess: (data: LoginResponse) => {
      console.log(data);
      setToken(data.accessToken);
      navigate("/dashboard");
    },
  });

  return (
    <div className="container w-[100vw] max-w-full">
      <div className="flex justify-center items-center min-h-screen bg-gray-100 w-full">
        <Card className="w-full max-w-md p-6 space-y-6 shadow-lg rounded-2xl">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">
              <img src={logo} alt="Logo" className="w-24 m-auto" />
              Iniciar Sesion
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Ingrese su email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Ingrese su contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                Iniciar Sesion
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
