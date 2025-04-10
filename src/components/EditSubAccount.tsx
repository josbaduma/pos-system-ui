import { useState } from "react";
import Fuse from "fuse.js";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ProductDTO } from "@/constants/ProductDTO";
import { addProductToSubaccount } from "@/api/tables";

// Lista de productos disponibles (puedes reemplazar con una API)
const productosDisponibles = [
  { id: 1, nombre: "Coca-Cola", precio: 15 },
  { id: 2, nombre: "Pepsi", precio: 14 },
  { id: 3, nombre: "Hamburguesa", precio: 50 },
  { id: 4, nombre: "Pizza", precio: 100 },
];

const fuzzySearch = new Fuse(productosDisponibles, {
  keys: ["nombre"],
  threshold: 0.3, // Sensibilidad de la búsqueda (más bajo = más exacto)
});

const EditSubAccount = ({
  editId,
  setEditDetalles,
}: {
  editId: number | null;
  editDetalles: any;
  setEditDetalles: (product: any) => void;
}) => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [filteredProducts, setFilteredProducts] =
    useState(productosDisponibles);

  const addProductoMutation = useMutation({
    mutationFn: addProductToSubaccount,
    onSuccess: (newProduct) => {
      setEditDetalles((prev: ProductDTO[]) => [...prev, newProduct]);
      queryClient.invalidateQueries({ queryKey: ["subcuentas"] });
    },
  });

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const query: string = e.target.value;
    setSearch(query);
    setFilteredProducts(
      query
        ? fuzzySearch.search(query).map((res) => res.item)
        : productosDisponibles
    );
  };

  const handleAddProduct = (product: ProductDTO) => {
    if (editId !== null) {
      addProductoMutation.mutate({
        id: editId,
        product: { ...product, quantity: 1 },
      });
    }
  };

  return (
    <div>
      <h2 className="mt-4 text-lg font-bold">Buscar Productos</h2>
      <Input
        placeholder="Buscar producto..."
        value={search}
        onChange={handleSearch}
      />
      <div className="border rounded-md">
        {/* 🔹 Header fijo */}
        <Table className="w-full">
          <TableHeader className="bg-white sticky top-0 shadow-md z-10">
            <TableRow>
              <TableHead className="w-1/3">Producto</TableHead>
              <TableHead className="w-1/3">Precio</TableHead>
              <TableHead className="w-1/3 text-center">Acción</TableHead>
            </TableRow>
          </TableHeader>
        </Table>
        <div className="max-h-[15vh] overflow-y-auto">
          <Table className="w-full">
            <TableBody>
              {filteredProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>{product.nombre}</TableCell>
                  <TableCell>${product.precio}</TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      onClick={() =>
                        handleAddProduct({
                          product_id: product.id,
                          quantity: 1,
                          subtotal: product.precio,
                        } as ProductDTO)
                      }
                    >
                      Agregar
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default EditSubAccount;
