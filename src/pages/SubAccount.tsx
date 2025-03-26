import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createNewSubAccount,
  editSubAccount,
  fetchSubAccountsActivePerTable,
} from "@/api/tables";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { query_keys } from "../constants/queryKeys";

const SubAccount = () => {
  const { table } = useParams();
  const queryClient = useQueryClient();
  const [nombre, setNombre] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [editNombre, setEditNombre] = useState("");
  const [editDetalles, setEditDetalles] = useState<any[]>([]);
  const [editId, setEditId] = useState<number | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const {
    data: subcuentas,
    isLoading,
    isError,
  } = useQuery({
    queryKey: [query_keys.LIST_SUBACCOUNTS, table],
    queryFn: () => fetchSubAccountsActivePerTable(table),
  });

  const createMutation = useMutation({
    mutationFn: createNewSubAccount,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [query_keys.CREATE_SUBACCOUNT, table],
      });
      setMensaje("Subcuenta creada exitosamente ✅");
      setNombre("");
    },
    onError: () => {
      setMensaje("Error al crear la subcuenta ❌");
    },
  });

  const editMutation = useMutation({
    mutationFn: editSubAccount,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [query_keys.EDIT_SUBACCOUNT, table],
      });
      setIsDialogOpen(false);
    },
    onError: () => {
      alert("Error al actualizar la subcuenta ❌");
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    createMutation.mutate({ nombre });
  };

  const handleEdit = (subcuenta: any) => {
    setEditId(subcuenta.id);
    setEditNombre(subcuenta.name);
    setEditDetalles(subcuenta.details);
    setIsDialogOpen(true);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editId !== null) {
      editMutation.mutate({ id: editId, nombre: editNombre });
    }
  };

  if (!table) return <p>Selecciona una mesa para ver sus subcuentas.</p>;
  if (isLoading) return <p>Cargando subcuentas...</p>;
  if (isError) return <p>Error al cargar subcuentas ❌</p>;

  return (
    <div className="max-w-4xl mx-auto mt-6">
      <Card className="w-3xl">
        <CardHeader>
          <CardTitle>Subcuentas de la Mesa #{table}</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleSubmit}
            className="flex items-center space-x-2 mb-4"
          >
            <Input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Nombre de la subcuenta"
              required
            />
            <Button type="submit">Crear Subcuenta</Button>
          </form>

          {mensaje && <p className="text-green-600">{mensaje}</p>}

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subcuentas?.map((sub: any) => (
                <TableRow key={sub.id}>
                  <TableCell>{sub.id}</TableCell>
                  <TableCell>{sub.name}</TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(sub)}
                    >
                      Editar
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-3xl w-3xl">
          <DialogHeader>
            <DialogTitle>Editar Subcuenta</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <Input
              type="text"
              value={editNombre}
              onChange={(e) => setEditNombre(e.target.value)}
              required
            />
            <Button type="submit">Guardar Cambios</Button>
          </form>

          {/* Lista de Productos Asociados */}
          <h2 className="mt-4 text-lg font-bold">
            Productos en esta Subcuenta
          </h2>
          {editDetalles.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Producto</TableHead>
                  <TableHead>Cantidad</TableHead>
                  <TableHead>Subtotal</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {editDetalles.map((detail: any) => (
                  <TableRow key={detail.id}>
                    <TableCell>{detail.id}</TableCell>
                    <TableCell>{detail.product.name}</TableCell>
                    <TableCell>{detail.quantity}</TableCell>
                    <TableCell>{detail.subtotal}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p>No hay productos en esta subcuenta.</p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SubAccount;
