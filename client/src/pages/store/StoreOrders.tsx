import StoreLayout from "@/components/StoreLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { useStoreAuth } from "@/hooks/useStoreAuth";
import { ShoppingCart, Eye, Package, Truck, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

export default function StoreOrders() {
  const { storeOwner } = useStoreAuth();
  const [selectedStatus, setSelectedStatus] = useState<"all" | "new" | "confirmed" | "shipped" | "delivered" | "cancelled">("all");
  
  const { data: orders, refetch } = trpc.orders.list.useQuery(
    { storeId: storeOwner?.storeId || 0 },
    { enabled: !!storeOwner?.storeId }
  );

  const updateStatusMutation = trpc.orders.updateStatus.useMutation({
    onSuccess: () => {
      toast.success("Status atualizado!");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleStatusChange = (orderId: number, newStatus: string) => {
    updateStatusMutation.mutate({ id: orderId, status: newStatus as "new" | "confirmed" | "shipped" | "delivered" | "cancelled" });
  };

  const filteredOrders = selectedStatus === "all" 
    ? orders 
    : orders?.filter((o: any) => o.status === selectedStatus);

  const statusCounts = {
    all: orders?.length || 0,
    new: orders?.filter((o: any) => o.status === "new").length || 0,
    confirmed: orders?.filter((o: any) => o.status === "confirmed").length || 0,
    shipped: orders?.filter((o: any) => o.status === "shipped").length || 0,
    delivered: orders?.filter((o: any) => o.status === "delivered").length || 0,
    cancelled: orders?.filter((o: any) => o.status === "cancelled").length || 0,
  };

  const statusOptions = [
    { value: "new", label: "Novo", icon: Package, color: "yellow" },
    { value: "confirmed", label: "Confirmado", icon: CheckCircle, color: "blue" },
    { value: "shipped", label: "Enviado", icon: Truck, color: "purple" },
    { value: "delivered", label: "Entregue", icon: CheckCircle, color: "green" },
    { value: "cancelled", label: "Cancelado", icon: XCircle, color: "red" },
  ];

  return (
    <StoreLayout>
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Pedidos</h1>
          <p className="text-gray-600 mt-1">
            Gerencie todos os pedidos da sua loja
          </p>
        </div>

        {/* Status Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          <button
            onClick={() => setSelectedStatus("all")}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
              selectedStatus === "all"
                ? "bg-teal-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Todos ({statusCounts.all})
          </button>
          {statusOptions.map((status) => (
            <button
              key={status.value}
              onClick={() => setSelectedStatus(status.value as any)}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                selectedStatus === status.value
                  ? `bg-${status.color}-600 text-white`
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {status.label} ({(statusCounts as any)[status.value]})
            </button>
          ))}
        </div>

        {/* Orders List */}
        {!filteredOrders || filteredOrders.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShoppingCart className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Nenhum pedido encontrado
            </h3>
            <p className="text-gray-600">
              {selectedStatus === "all" 
                ? "Quando clientes fizerem pedidos, aparecerão aqui" 
                : `Nenhum pedido com status "${selectedStatus}"`}
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order: any) => (
              <Card key={order.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Pedido #{order.orderNumber}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        order.status === "delivered"
                          ? "bg-green-100 text-green-700"
                          : order.status === "cancelled"
                          ? "bg-red-100 text-red-700"
                          : order.status === "shipped"
                          ? "bg-purple-100 text-purple-700"
                          : order.status === "confirmed"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}>
                        {order.status === "delivered" ? "Entregue" :
                         order.status === "cancelled" ? "Cancelado" :
                         order.status === "shipped" ? "Enviado" :
                         order.status === "confirmed" ? "Confirmado" : "Novo"}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p><strong>Cliente:</strong> {order.customerName}</p>
                      <p><strong>WhatsApp:</strong> {order.customerPhone}</p>
                      {order.customerEmail && (
                        <p><strong>Email:</strong> {order.customerEmail}</p>
                      )}
                      {order.customerAddress && (
                        <p><strong>Endereço:</strong> {
                          `${order.customerAddress.street}, ${order.customerAddress.number} - ${order.customerAddress.city}/${order.customerAddress.state}`
                        }</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-teal-600 mb-2">
                      R$ {(order.total / 100).toFixed(2)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString("pt-BR")}
                    </div>
                  </div>
                </div>

                {/* Items */}
                <div className="border-t pt-4 mb-4">
                  <h4 className="font-medium text-gray-900 mb-2">Itens do Pedido:</h4>
                  <div className="space-y-2">
                    {order.items.map((item: any, index: number) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span className="text-gray-700">
                          {item.quantity}x {item.productName}
                        </span>
                        <span className="font-medium text-gray-900">
                          R$ {(item.price / 100).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                  {order.discount > 0 && (
                    <div className="flex justify-between text-sm text-green-600 mt-2">
                      <span>Desconto{order.couponCode && ` (${order.couponCode})`}</span>
                      <span>-R$ {(order.discount / 100).toFixed(2)}</span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-4 border-t">
                  <select
                    value={order.status}
                    onChange={(e) => handleStatusChange(order.id, e.target.value)}
                    className="px-3 py-2 border rounded-lg text-sm"
                    disabled={updateStatusMutation.isPending}
                  >
                    <option value="new">Novo</option>
                    <option value="confirmed">Confirmado</option>
                    <option value="shipped">Enviado</option>
                    <option value="delivered">Entregue</option>
                    <option value="cancelled">Cancelado</option>
                  </select>
                  
                  <a
                    href={`https://wa.me/${order.customerPhone.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="outline" size="sm">
                      Contatar Cliente
                    </Button>
                  </a>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </StoreLayout>
  );
}
