import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createNewSubAccount,
  editSubAccount,
  fetchSubAccountsActivePerTable,
  updateQuantity,
  removeProductFromSubaccount,
  billSubAccount,
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
import { Trash2 } from "lucide-react";

const SubAccount = () => {
  const { table } = useParams();
  const queryClient = useQueryClient();
  const [nombre, setNombre] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [editNombre, setEditNombre] = useState("");
  const [editDetalles, setEditDetalles] = useState<any[]>([]);
  const [editId, setEditId] = useState<number | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [taxes, setTaxes] = useState(true);
  const [billMessage, setBillMessage] = useState("");

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
  const removeProductMutation = useMutation({
    mutationFn: removeProductFromSubaccount,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [query_keys.LIST_SUBACCOUNTS, table],
      });
    },
  });
  const billMutation = useMutation({
    mutationFn: billSubAccount,
    onSuccess: (data) => {
      setBillMessage("Subcuenta facturada correctamente ✅");
      setTimeout(() => {
        setBillMessage("");
        setIsDialogOpen(false);
      }, 1000);
      queryClient.invalidateQueries({
        queryKey: [query_keys.LIST_SUBACCOUNTS, table],
      });
    },
    onError: () => {
      setBillMessage("Error al facturar la subcuenta ❌");
    },
  });

  const handleRemoveProduct = (detailId: number) => {
    if (editId !== null) {
      removeProductMutation.mutate({ subaccountId: editId, detailId });
      setEditDetalles((prev) => prev.filter((d) => d.id !== detailId));
    }
  };

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

  // Cálculos de montos
  const subtotal = editDetalles.reduce((acc, detail) => {
    const value = detail.subtotal ? parseFloat(detail.subtotal) : 0;
    return acc + value;
  }, 0);
  const montoDescuento = (subtotal * discount) / 100;
  const montoImpuestos = taxes ? ((subtotal - montoDescuento) * 10) / 100 : 0;
  const total = subtotal + montoImpuestos - montoDescuento;

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
        <DialogContent
          className="sm:max-w-5xl max-w-6xl h-[80vh] flex flex-col"
          aria-describedby="dialog-description"
        >
          <DialogHeader>
            <DialogTitle>Editar Subcuenta</DialogTitle>
          </DialogHeader>
          {/* Formulario de edición de nombre en una sola columna */}
          <form onSubmit={handleEditSubmit} className="space-y-4 mb-6 w-full">
            <label htmlFor="edit-nombre" className="text-sm font-medium">
              Nombre de la subcuenta
            </label>
            <Input
              id="edit-nombre"
              type="text"
              value={editNombre}
              onChange={(e) => setEditNombre(e.target.value)}
              required
              className="w-full"
            />
            <Button type="submit">Guardar Cambios</Button>
          </form>
          <div className="flex flex-1 gap-6">
            {/* Columna 1: Productos y edición */}
            <div className="w-1/2 pr-4 border-r border-gray-200 flex flex-col">
              <h2 className="mt-2 text-lg font-bold">
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
                      <TableHead></TableHead>
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
                        <TableCell>
                          {new Intl.NumberFormat("es-CR", {
                            style: "currency",
                            currency: "CRC",
                          }).format(detail.subtotal)}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveProduct(detail.id)}
                            title="Eliminar producto"
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </TableCell>
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
            </div>
            {/* Columna 2: Facturación */}
            <div className="w-1/2 pl-4 flex flex-col">
              <h2 className="mt-2 text-lg font-bold">Facturación</h2>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (editId !== null) {
                    billMutation.mutate({
                      id: editId,
                      discount,
                      taxes: taxes ? 10 : 0,
                    });
                  }
                }}
                className="flex flex-col gap-2 mt-2 max-w-md"
              >
                <div className="flex gap-2">
                  <div className="flex flex-col w-1/2">
                    <label
                      htmlFor="descuento"
                      className="text-sm font-medium mb-1"
                    >
                      Descuento (%)
                    </label>
                    <Input
                      id="descuento"
                      type="number"
                      placeholder="Descuento"
                      value={discount}
                      min={0}
                      onChange={(e) => setDiscount(Number(e.target.value))}
                      className="w-full"
                    />
                  </div>
                  <div className="flex flex-col w-1/2 justify-end">
                    <label
                      htmlFor="impuestos"
                      className="text-sm font-medium mb-1"
                    >
                      Aplicar Impuesto (10%)
                    </label>
                    <input
                      id="impuestos"
                      type="checkbox"
                      checked={taxes}
                      onChange={(e) => setTaxes(e.target.checked)}
                      className="w-5 h-5 mt-2"
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-1 mt-2 text-sm">
                  <div>
                    <span className="font-medium">Subtotal:</span>{" "}
                    {new Intl.NumberFormat("es-CR", {
                      style: "currency",
                      currency: "CRC",
                    }).format(subtotal)}
                  </div>
                  <div>
                    <span className="font-medium">Descuento:</span>{" "}
                    {new Intl.NumberFormat("es-CR", {
                      style: "currency",
                      currency: "CRC",
                    }).format(montoDescuento)}
                  </div>
                  <div>
                    <span className="font-medium">Impuestos:</span>{" "}
                    {new Intl.NumberFormat("es-CR", {
                      style: "currency",
                      currency: "CRC",
                    }).format(montoImpuestos)}
                  </div>
                  <div>
                    <span className="font-medium">Total:</span>{" "}
                    {new Intl.NumberFormat("es-CR", {
                      style: "currency",
                      currency: "CRC",
                    }).format(total)}
                  </div>
                </div>
                <Button
                  type="submit"
                  disabled={billMutation.isPending}
                  className="mt-2"
                >
                  {billMutation.isPending ? "Facturando..." : "Facturar"}
                </Button>
                {billMessage && <span className="ml-2">{billMessage}</span>}
              </form>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SubAccount;
