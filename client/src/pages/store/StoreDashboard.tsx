import StoreLayout from "@/components/StoreLayout";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { useStoreAuth } from "@/hooks/useStoreAuth";
import { 
  Package, 
  ShoppingCart, 
  DollarSign, 
  TrendingUp,
  Users,
  Link as LinkIcon,
  Copy,
  ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function StoreDashboard() {
  const { storeOwner } = useStoreAuth();
  
  const { data: products } = trpc.products.list.useQuery(
    { storeId: storeOwner?.storeId || 0 },
    { enabled: !!storeOwner?.storeId }
  );

  const { data: orders } = trpc.orders.list.useQuery(
    { storeId: storeOwner?.storeId || 0 },
    { enabled: !!storeOwner?.storeId }
  );

  const { data: sales } = trpc.sales.list.useQuery(
    { storeId: storeOwner?.storeId || 0 },
    { enabled: !!storeOwner?.storeId }
  );

  // Calcular estatísticas
  const totalProducts = products?.length || 0;
  const totalOrders = orders?.length || 0;
  const pendingOrders = orders?.filter((o: any) => o.status === "pending").length || 0;
  const totalRevenue = sales?.reduce((sum: number, sale: any) => sum + sale.amount, 0) || 0;
  const recentOrders = orders?.slice(0, 5) || [];

  const stats = [
    {
      icon: Package,
      label: "Produtos",
      value: totalProducts,
      color: "bg-blue-100 text-blue-700",
      iconColor: "text-blue-600",
    },
    {
      icon: ShoppingCart,
      label: "Pedidos",
      value: totalOrders,
      color: "bg-green-100 text-green-700",
      iconColor: "text-green-600",
    },
    {
      icon: TrendingUp,
      label: "Pendentes",
      value: pendingOrders,
      color: "bg-yellow-100 text-yellow-700",
      iconColor: "text-yellow-600",
    },
    {
      icon: DollarSign,
      label: "Faturamento",
      value: `R$ ${(totalRevenue / 100).toFixed(2)}`,
      color: "bg-purple-100 text-purple-700",
      iconColor: "text-purple-600",
    },
  ];

  return (
    <StoreLayout>
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Bem-vindo ao painel da sua loja, {storeOwner?.storeName}
          </p>
        </div>

        {/* Link da Loja */}
        <Card className="p-6 mb-6 bg-gradient-to-r from-teal-50 to-blue-50 border-teal-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-teal-600 flex items-center justify-center">
                <LinkIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Link da Sua Loja</h3>
                <p className="text-sm text-gray-600">Compartilhe este link com seus clientes</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <code className="px-4 py-2 bg-white rounded-lg border text-sm font-mono text-gray-700">
                {window.location.origin}/loja/{storeOwner?.storeSlug}
              </code>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(`${window.location.origin}/loja/${storeOwner?.storeSlug}`);
                  toast.success("Link copiado!");
                }}
              >
                <Copy className="w-4 h-4 mr-2" />
                Copiar
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={() => window.open(`/loja/${storeOwner?.storeSlug}`, "_blank")}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Abrir
              </Button>
            </div>
          </div>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-lg ${stat.color} flex items-center justify-center`}>
                    <Icon className={`w-6 h-6 ${stat.iconColor}`} />
                  </div>
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </Card>
            );
          })}
        </div>

        {/* Recent Orders */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Pedidos Recentes</h2>
          {recentOrders.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <ShoppingCart className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p>Nenhum pedido ainda</p>
              <p className="text-sm">Quando clientes fizerem pedidos, aparecerão aqui</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentOrders.map((order: any) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">
                      Pedido #{order.id}
                    </div>
                    <div className="text-sm text-gray-600">
                      {order.customerName} • {order.customerWhatsapp}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-gray-900">
                      R$ {(order.total / 100).toFixed(2)}
                    </div>
                    <div className={`text-xs px-2 py-1 rounded-full inline-block ${
                      order.status === "completed"
                        ? "bg-green-100 text-green-700"
                        : order.status === "cancelled"
                        ? "bg-red-100 text-red-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}>
                      {order.status === "completed" ? "Concluído" : 
                       order.status === "cancelled" ? "Cancelado" : "Pendente"}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <Package className="w-8 h-8 text-teal-600 mb-3" />
            <h3 className="font-semibold text-gray-900 mb-1">Adicionar Produto</h3>
            <p className="text-sm text-gray-600">
              Cadastre novos produtos na sua loja
            </p>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <ShoppingCart className="w-8 h-8 text-teal-600 mb-3" />
            <h3 className="font-semibold text-gray-900 mb-1">Ver Pedidos</h3>
            <p className="text-sm text-gray-600">
              Gerencie todos os seus pedidos
            </p>
          </Card>

          {storeOwner?.plan !== "basic" && (
            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <LinkIcon className="w-8 h-8 text-teal-600 mb-3" />
              <h3 className="font-semibold text-gray-900 mb-1">Links Rastreáveis</h3>
              <p className="text-sm text-gray-600">
                Crie links para rastrear vendas
              </p>
            </Card>
          )}
        </div>
      </div>
    </StoreLayout>
  );
}
