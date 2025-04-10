import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createNewSubAccount,
  editSubAccount,
  fetchSubAccountsActivePerTable,
  updateQuantity,
} from "@/api/tables";
import { Link, useParams } from "react-router-dom";
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
import EditSubAccount from "@/components/EditSubAccount";

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
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: [query_keys.LIST_SUBACCOUNTS, table],
      });
      setMensaje("Subcuenta creada exitosamente ✅");
      setNombre("");
      const account = { ...data.sub_account, details: [] };
      handleEdit(account);
    },
    onError: () => {
      setMensaje("Error al crear la subcuenta ❌");
    },
  });

  const editMutation = useMutation({
    mutationFn: editSubAccount,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [query_keys.LIST_SUBACCOUNTS, table],
      });
      setIsDialogOpen(false);
    },
    onError: () => {
      alert("Error al actualizar la subcuenta ❌");
    },
  });

  const updateQuantityMutation = useMutation({
    mutationFn: updateQuantity,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [query_keys.LIST_SUBACCOUNTS, table],
      });
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    createMutation.mutate({ body: { name: nombre, table_id: Number(table) } });
  };

  const handleEdit = (subcuenta: any) => {
    setEditId(subcuenta.id);
    setEditNombre(subcuenta.name);
    setEditDetalles(subcuenta.details);
    setIsDialogOpen(true);
  };

  const handleQuantityChange = (detailId: number, quantity: number) => {
    setEditDetalles((prev) =>
      prev.map((details) =>
        details.id === detailId ? { ...details, quantity } : details
      )
    );
  };

  const handleQuantityBlur = async (detailId: number, quantity: number) => {
    if (editId !== null) {
      try {
        updateQuantityMutation.mutate({
          subaccountId: editId,
          detailId,
          quantity,
        });
        setEditDetalles((prev) =>
          prev.map((detail) =>
            detail.id === detailId
              ? {
                  ...detail,
                  quantity: quantity,
                  subtotal: detail.product.price * quantity,
                }
              : detail
          )
        );
        queryClient.invalidateQueries({
          queryKey: [query_keys.LIST_SUBACCOUNTS, table],
        });
      } catch (error) {
        console.error("Error al actualizar la cantidad:", error);
      }
    }
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
      <Link to="/tables">
        <Button variant="outline">← Volver a Mesas</Button>
      </Link>
      <Card className="w-3xl mt-4">
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

          <Table className="mt-2">
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
        <DialogContent className="sm:max-w-3xl max-w-4xl h-[80vh] flex flex-col">
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
                    <TableCell>
                      <Input
                        type="number"
                        value={detail.quantity}
                        min="1"
                        onChange={(e) =>
                          handleQuantityChange(
                            detail.id,
                            Number(e.target.value)
                          )
                        }
                        onBlur={() =>
                          handleQuantityBlur(detail.id, detail.quantity)
                        }
                      />
                    </TableCell>
                    <TableCell>{detail.subtotal}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p>No hay productos en esta subcuenta.</p>
          )}
          <EditSubAccount
            editId={editId}
            editDetalles={editDetalles}
            setEditDetalles={setEditDetalles}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SubAccount;
