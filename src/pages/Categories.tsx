import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchCategories,
  editCategory,
  deleteCategory,
  createCategory,
} from "@/api/categories";
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

const Categories = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [editCategoryData, setEditCategoryData] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newCategory, setNewCategory] = useState({
    name: "",
  });

  const {
    data: productCategories,
    isLoading,
    isError,
  } = useQuery({
    queryKey: [query_keys.LIST_CATEGORIES],
    queryFn: fetchCategories,
  });

  const categories = productCategories
    ? productCategories.map((category: any) => ({
        id: category.id,
        name: category.name,
      }))
    : [];

  const createMutation = useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [query_keys.LIST_CATEGORIES] });
      setNewCategory({ name: "" });
    },
  });

  const editMutation = useMutation({
    mutationFn: editCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [query_keys.LIST_CATEGORIES] });
      setIsDialogOpen(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [query_keys.LIST_CATEGORIES] });
    },
  });

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const handleEdit = (product: any) => {
    setEditCategoryData(product);
    setIsDialogOpen(true);
  };

  const handleDelete = (productId: number) => {
    if (confirm("¿Estás seguro de que deseas eliminar este categoria?")) {
      deleteMutation.mutate(productId);
    }
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editCategoryData) {
      editMutation.mutate(editCategoryData);
    }
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCategory.name) {
      createMutation.mutate({
        name: newCategory.name,
      });
    }
  };

  const filteredCategories = productCategories?.filter((category: any) =>
    category.name.toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading) return <p>Cargando categorias...</p>;
  if (isError) return <p>Error al cargar categorias ❌</p>;

  return (
    <div className="max-w-4xl mx-auto mt-6 w-full">
      <h1 className="text-2xl font-bold mb-4">Gestión de Categorias</h1>
      <div className="p-4 border rounded-md mb-6">
        <h2 className="text-lg font-semibold mb-4">Crear Nuevo Categoria</h2>
        <form
          onSubmit={handleCreateSubmit}
          className="flex items-center space-x-4 mb-6"
        >
          <Input
            type="text"
            value={newCategory.name}
            onChange={(e) =>
              setNewCategory({ ...newCategory, name: e.target.value })
            }
            placeholder="Nombre del categoria"
            required
          />

          <Button type="submit">Crear Categoria</Button>
        </form>
      </div>

      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-4">Buscar Categorias</h2>
        <Input
          placeholder="Buscar categoria..."
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
            <TableHead>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredCategories?.map((category: any) => (
            <TableRow key={category.id}>
              <TableCell>{category.id}</TableCell>
              <TableCell>{category.name}</TableCell>
              <TableCell>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(category)}
                  className="mr-2"
                >
                  Editar
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(category.id)}
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
            <DialogTitle>Editar Categoria</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <Input
              type="text"
              value={editCategoryData?.name || ""}
              onChange={(e) =>
                setEditCategoryData((prev: any) => ({
                  ...prev,
                  name: e.target.value,
                }))
              }
              placeholder="Nombre del categoria"
              required
            />

            <Button type="submit">Guardar Cambios</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Categories;
