import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
const queryClient = new QueryClient();
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import TablesPage from "./pages/Tables";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./app/Layout";
import { ThemeProvider } from "@/components/theme-provider";
import SubAccount from "./pages/SubAccount";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Dashboard />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/tables"
              element={
                <ProtectedRoute>
                  <Layout>
                    <TablesPage />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/subaccount/:table"
              element={
                <ProtectedRoute>
                  <Layout>
                    <SubAccount />
                  </Layout>
                </ProtectedRoute>
              }
            />
          </Routes>
        </BrowserRouter>
      </QueryClientProvider>
    </ThemeProvider>
  </StrictMode>
);
