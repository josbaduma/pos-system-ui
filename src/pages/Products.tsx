import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchProducts,
  editProduct,
  deleteProduct,
  createProduct,
} from "@/api/products";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { query_keys } from "@/constants/queryKeys";

const Products = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [editProductData, setEditProductData] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: "",
    price: "",
    category_id: "",
  });

  const {
    data: productCategories,
    isLoading,
    isError,
  } = useQuery({
    queryKey: [query_keys.LIST_PRODUCTS],
    queryFn: fetchProducts,
  });

  const categories = productCategories
    ? productCategories.map((category: any) => ({
        id: category.id,
        name: category.name,
      }))
    : [];

  const createMutation = useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [query_keys.LIST_PRODUCTS] });
      setNewProduct({ name: "", price: "", category_id: "" });
    },
  });

  const editMutation = useMutation({
    mutationFn: editProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [query_keys.LIST_PRODUCTS] });
      setIsDialogOpen(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [query_keys.LIST_PRODUCTS] });
    },
  });

  const products = productCategories
    ? productCategories.flatMap((category: any) => category.products)
    : [];

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const handleEdit = (product: any) => {
    setEditProductData(product);
    setIsDialogOpen(true);
  };

  const handleDelete = (productId: number) => {
    if (confirm("¿Estás seguro de que deseas eliminar este producto?")) {
      deleteMutation.mutate(productId);
    }
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editProductData) {
      editMutation.mutate(editProductData);
    }
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newProduct.name && newProduct.price) {
      createMutation.mutate({
        name: newProduct.name,
        price: parseFloat(newProduct.price),
        category_id: parseInt(newProduct.category_id),
      });
    }
  };

  const filteredProducts = products?.filter((product: any) =>
    product.name.toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading) return <p>Cargando productos...</p>;
  if (isError) return <p>Error al cargar productos ❌</p>;

  return (
    <div className="max-w-4xl mx-auto mt-6 w-full">
      <h1 className="text-2xl font-bold mb-4">Gestión de Productos</h1>
      <div className="p-4 border rounded-md mb-6">
        <h2 className="text-lg font-semibold mb-4">Crear Nuevo Producto</h2>
        <form
          onSubmit={handleCreateSubmit}
          className="flex items-center space-x-4 mb-6"
        >
          <Input
            type="text"
            value={newProduct.name}
            onChange={(e) =>
              setNewProduct({ ...newProduct, name: e.target.value })
            }
            placeholder="Nombre del producto"
            required
          />
          <Input
            type="number"
            value={newProduct.price}
            onChange={(e) =>
              setNewProduct({ ...newProduct, price: e.target.value })
            }
            placeholder="Precio del producto"
            required
          />
          <Select
            onValueChange={(value) =>
              setNewProduct({ ...newProduct, category_id: value })
            }
            value={newProduct.category_id}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Seleccionar categoría" />
            </SelectTrigger>
            <SelectContent>
              {categories?.map((category: any) => (
                <SelectItem key={category.id} value={category.id.toString()}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button type="submit">Crear Producto</Button>
        </form>
      </div>

      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-4">Buscar Productos</h2>
        <Input
          placeholder="Buscar producto..."
          value={search}
          onChange={handleSearch}
          className="mb-4"
        />
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Nombre</TableHead>
            <TableHead>Precio</TableHead>
            <TableHead>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredProducts?.map((product: any) => (
            <TableRow key={product.id}>
              <TableCell>{product.id}</TableCell>
              <TableCell>{product.name}</TableCell>
              <TableCell>
                {new Intl.NumberFormat("es-CR", {
                  style: "currency",
                  currency: "CRC",
                }).format(product.price)}
              </TableCell>
              <TableCell>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(product)}
                  className="mr-2"
                >
                  Editar
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(product.id)}
                >
                  Eliminar
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Producto</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <Input
              type="text"
              value={editProductData?.name || ""}
              onChange={(e) =>
                setEditProductData((prev: any) => ({
                  ...prev,
                  name: e.target.value,
                }))
              }
              placeholder="Nombre del producto"
              required
            />
            <Input
              type="number"
              value={editProductData?.price || ""}
              onChange={(e) =>
                setEditProductData((prev: any) => ({
                  ...prev,
                  price: Number(e.target.value),
                }))
              }
              placeholder="Precio del producto"
              required
            />
            <Select
              onValueChange={(value) =>
                setEditProductData((prev: any) => ({
                  ...prev,
                  category_id: value,
                }))
              }
              value={editProductData?.category_id?.toString() || ""}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Seleccionar categoría" />
              </SelectTrigger>
              <SelectContent>
                {categories?.map((category: any) => (
                  <SelectItem key={category.id} value={category.id.toString()}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button type="submit">Guardar Cambios</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Products;
