import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchCustomers,
  editCustomer,
  deleteCustomer,
  createCustomer,
} from "@/api/customers";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Helmet } from "react-helmet-async";
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

const Customers = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [editCustomerData, setEditCustomerData] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });

  const {
    data: customers,
    isLoading,
    isError,
  } = useQuery({
    queryKey: [query_keys.LIST_CUSTOMERS],
    queryFn: fetchCustomers,
  });

  const createMutation = useMutation({
    mutationFn: createCustomer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [query_keys.LIST_CUSTOMERS] });
      setNewCustomer({ name: "", email: "", phone: "", address: "" });
    },
  });

  const editMutation = useMutation({
    mutationFn: editCustomer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [query_keys.LIST_CUSTOMERS] });
      setIsDialogOpen(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCustomer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [query_keys.LIST_CUSTOMERS] });
    },
  });

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const handleEdit = (product: any) => {
    setEditCustomerData(product);
    setIsDialogOpen(true);
  };

  const handleDelete = (productId: number) => {
    if (confirm("¿Estás seguro de que deseas eliminar este cliente?")) {
      deleteMutation.mutate(productId);
    }
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editCustomerData) {
      editMutation.mutate(editCustomerData);
    }
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCustomer.name) {
      createMutation.mutate({
        name: newCustomer.name,
        email: newCustomer.email,
        address: newCustomer.address,
        phone: newCustomer.phone,
      });
    }
  };

  const filteredCustomeries = customers?.filter((category: any) =>
    category.name.toLowerCase().includes(search.toLowerCase()),
  );

  if (isLoading) return <p>Cargando clientes...</p>;
  if (isError) return <p>Error al cargar clientes ❌</p>;

  return (
    <div className="max-w-4xl mx-auto mt-6 w-full">
      <Helmet>
        <title>POS | Clientes</title>
      </Helmet>
      <h1 className="text-2xl font-bold mb-4">Gestión de Clientes</h1>
      <div className="p-4 border rounded-md mb-6">
        <h2 className="text-lg font-semibold mb-4">Crear Nuevo Cliente</h2>
        <form
          onSubmit={handleCreateSubmit}
          className="flex items-center space-x-4 mb-6"
        >
          <Input
            type="text"
            value={newCustomer.name}
            onChange={(e) =>
              setNewCustomer({ ...newCustomer, name: e.target.value })
            }
            placeholder="Nombre del cliente"
            required
          />
          <Input
            type="email"
            value={newCustomer.email}
            onChange={(e) =>
              setNewCustomer({ ...newCustomer, email: e.target.value })
            }
            placeholder="Correo"
            required
          />
          <Input
            type="text"
            value={newCustomer.phone}
            onChange={(e) =>
              setNewCustomer({ ...newCustomer, phone: e.target.value })
            }
            placeholder="Teléfono"
            required
          />
          <Input
            type="text"
            value={newCustomer.address}
            onChange={(e) =>
              setNewCustomer({ ...newCustomer, address: e.target.value })
            }
            placeholder="Dirección"
            required
          />

          <Button type="submit">Crear Cliente</Button>
        </form>
      </div>

      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-4">Buscar Clientes</h2>
        <Input
          placeholder="Buscar cliente..."
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
            <TableHead>Telefono</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Direccion</TableHead>
            <TableHead>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredCustomeries?.map((category: any) => (
            <TableRow key={category.id}>
              <TableCell>{category.id}</TableCell>
              <TableCell>{category.name}</TableCell>
              <TableCell>{category.phone}</TableCell>
              <TableCell>{category.email}</TableCell>
              <TableCell>{category.address}</TableCell>
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
            <DialogTitle>Editar Cliente</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <Input
              type="text"
              value={editCustomerData?.name || ""}
              onChange={(e) =>
                setEditCustomerData((prev: any) => ({
                  ...prev,
                  name: e.target.value,
                }))
              }
              placeholder="Nombre del cliente"
              required
            />
            <Input
              type="email"
              value={editCustomerData?.email || ""}
              onChange={(e) =>
                setEditCustomerData(
                  (prev: any) => prev && { ...prev, email: e.target.value },
                )
              }
              placeholder="Correo"
              required
            />
            <Input
              type="text"
              value={editCustomerData?.phone || ""}
              onChange={(e) =>
                setEditCustomerData(
                  (prev: any) => prev && { ...prev, phone: e.target.value },
                )
              }
              placeholder="Teléfono"
              required
            />
            <Input
              type="text"
              value={editCustomerData?.address || ""}
              onChange={(e) =>
                setEditCustomerData(
                  (prev: any) => prev && { ...prev, address: e.target.value },
                )
              }
              placeholder="Teléfono"
              required
            />

            <Button type="submit">Guardar Cambios</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Customers;
