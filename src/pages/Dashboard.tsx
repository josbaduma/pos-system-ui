// src/pages/Dashboard.tsx
import React, { useEffect, useState } from "react";
import { useAuthStore } from "../store/authStore";
import { useNavigate } from "react-router-dom";
import { query_keys } from "@/constants/queryKeys";
import { fetchAllSales } from "@/api/dashboard";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Helmet } from "react-helmet-async";

const Dashboard: React.FC = () => {
  const clearToken = useAuthStore((state) => state.clearToken);
  const navigate = useNavigate();
  const [totalSale, setTotalSale] = useState(0);
  const [subTotalSale, setSubTotalSale] = useState(0);
  const [taxesSale, setTaxesSale] = useState(0);

  const handleLogout = () => {
    clearToken();
    navigate("/");
  };

  const {
    data: sales,
    isLoading,
    isError,
  } = useQuery({
    queryKey: [query_keys.LIST_SALES],
    queryFn: () => fetchAllSales(),
  });

  useEffect(() => {
    if (sales) {
      const total = sales.reduce(
        (acc, sale) => acc + parseFloat(sale.total),
        0,
      );
      const subTotal = sales.reduce(
        (acc, sale) => acc + parseFloat(sale.sub_total),
        0,
      );
      const taxes = sales.reduce(
        (acc, sale) => acc + parseFloat(sale.taxes),
        0,
      );
      setTotalSale(total);
      setSubTotalSale(subTotal);
      setTaxesSale(taxes);
    }
  }, [sales]);

  return (
    <div className="max-w-4xl mx-auto mt-6 w-full">
      <Helmet>
        <title>POS | Dashboard</title>
      </Helmet>
      <h1 className="text-2xl font-bold mb-4">Welcome to Dashboard</h1>

      <div className="mb-4">
        <p>Total Sales: {totalSale.toFixed(2)}</p>
        <p>Sub Total Sales: {subTotalSale.toFixed(2)}</p>
        <p>Taxes: {taxesSale.toFixed(2)}</p>
      </div>
      {isLoading && <p>Loading sales...</p>}
      {isError && <p>Error loading sales.</p>}
      {sales && (
        <ul>
          {sales.map((sale) => (
            <li key={sale.id}>
              Sale ID: {sale.id}, Total: {sale.total}
            </li>
          ))}
        </ul>
      )}

      <Button onClick={handleLogout} className="mb-3">
        Logout
      </Button>
    </div>
  );
};

export default Dashboard;
