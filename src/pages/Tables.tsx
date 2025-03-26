import React from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchTables, Table } from "../api/tables";

const TablesPage: React.FC = () => {
  const {
    data: tables,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["tables"],
    queryFn: fetchTables,
  });

  if (isLoading)
    return (
      <div className="flex justify-center items-center h-screen text-lg font-semibold">
        Cargando mesas...
      </div>
    );
  if (isError)
    return (
      <div className="text-center text-red-500 text-lg">
        Error al cargar las mesas.
      </div>
    );

  return (
    <div className="p-8 min-h-screen bg-gray-100 max-w-full min-w-full w-100 dark:bg-gray-700">
      <h1 className="text-3xl font-bold text-center mb-8 text-gray-800 dark:text-white">
        Mesas del Restaurante
      </h1>
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-8">
        {tables?.map((table: Table) => (
          <div
            key={table.id}
            className={`p-6 rounded-lg shadow-md text-white ${getTableColor(
              table.status
            )}`}
          >
            <h2 className="text-xl font-bold mb-2">{table.name}</h2>
            <p className="text-sm">
              Estado:{" "}
              <span className="font-medium capitalize">{table.status}</span>
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

const getTableColor = (status: string) => {
  switch (status) {
    case "available":
      return "bg-green-500";
    case "occupied":
      return "bg-red-500";
    case "reserved":
      return "bg-yellow-500";
    default:
      return "bg-gray-400";
  }
};

export default TablesPage;
