import StoreLayout from "@/components/StoreLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, TrendingUp, Users, DollarSign } from "lucide-react";

export default function StoreReports() {
  return (
    <StoreLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <BarChart3 className="w-8 h-8 text-teal-600" />
              Relatórios
            </h1>
            <p className="text-muted-foreground">Análises e métricas da sua loja</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Vendas do Mês</CardDescription>
              <CardTitle className="text-3xl">R$ 0.00</CardTitle>
            </CardHeader>
            <CardContent>
              <DollarSign className="w-8 h-8 text-teal-600" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Pedidos do Mês</CardDescription>
              <CardTitle className="text-3xl">0</CardTitle>
            </CardHeader>
            <CardContent>
              <TrendingUp className="w-8 h-8 text-green-600" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Novos Clientes</CardDescription>
              <CardTitle className="text-3xl">0</CardTitle>
            </CardHeader>
            <CardContent>
              <Users className="w-8 h-8 text-blue-600" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Ticket Médio</CardDescription>
              <CardTitle className="text-3xl">R$ 0.00</CardTitle>
            </CardHeader>
            <CardContent>
              <BarChart3 className="w-8 h-8 text-yellow-600" />
            </CardContent>
          </Card>
        </div>

        {/* Empty State */}
        <Card>
          <CardContent className="py-12 text-center">
            <BarChart3 className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Em breve!</h3>
            <p className="text-muted-foreground">
              Relatórios detalhados e gráficos em desenvolvimento.
            </p>
          </CardContent>
        </Card>
      </div>
    </StoreLayout>
  );
}
