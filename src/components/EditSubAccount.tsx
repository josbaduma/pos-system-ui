import { useEffect, useState } from "react";
import Fuse from "fuse.js";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
import { Category, fetchProducts, Product } from "@/api/products";
import { query_keys } from "@/constants/queryKeys";

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

  const {
    data: productsResponse,
    isLoading: isLoadingProducts,
    isSuccess: isSuccessProducts,
    isError: isErrorProducts,
  } = useQuery({
    queryKey: [query_keys.LIST_PRODUCTS],
    queryFn: () => fetchProducts(),
  });

  const allProducts = productsResponse
    ? productsResponse.flatMap((category: Category) => category.products)
    : [];

  const fuzzySearch = new Fuse(allProducts || [], {
    keys: ["name"],
    threshold: 0.3,
  });
  const [filteredProducts, setFilteredProducts] = useState(allProducts || []);

  useEffect(() => {
    if (filteredProducts.length === 0 && allProducts.length > 0) {
      setFilteredProducts(allProducts);
    }
  }, [allProducts]);

  const addProductoMutation = useMutation({
    mutationFn: addProductToSubaccount,
    onSuccess: (newProduct) => {
      setEditDetalles((prev: ProductDTO[]) => [...prev, newProduct]);
      queryClient.invalidateQueries({ queryKey: ["list-products"] });
    },
  });

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const query: string = e.target.value;
    setSearch(query);
    setFilteredProducts(
      query ? fuzzySearch.search(query).map((res) => res.item) : allProducts
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
      {isLoadingProducts && <p>Cargando productos...</p>}
      {isErrorProducts && <p>Error al cargar productos</p>}
      {isSuccessProducts && (
        <div>
          <h2 className="mt-4 text-lg font-bold">Buscar Productos</h2>
          <Input
            placeholder="Buscar producto..."
            value={search}
            onChange={handleSearch}
          />
          <div className="border rounded-md">
            <Table className="w-full">
              <TableHeader className="bg-white sticky top-0 shadow-md z-10">
                <TableRow>
                  <TableHead className="w-2/5">Producto</TableHead>
                  <TableHead className="w-1/5">Precio</TableHead>
                  <TableHead className="w-2/5 text-center">Acción</TableHead>
                </TableRow>
              </TableHeader>
            </Table>
            <div className="max-h-[15vh] overflow-y-auto">
              <Table className="w-full">
                <TableBody>
                  {filteredProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="w-2/5">{product.name}</TableCell>
                      <TableCell className="w-1/5">
                        {new Intl.NumberFormat("es-CR", {
                          style: "currency",
                          currency: "CRC",
                        }).format(product.price)}
                      </TableCell>
                      <TableCell className="w-2/5 text-center">
                        <Button
                          size="sm"
                          onClick={() =>
                            handleAddProduct({
                              product_id: product.id,
                              quantity: 1,
                              subtotal: Number(product.price),
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
      )}
    </div>
  );
};

export default EditSubAccount;
