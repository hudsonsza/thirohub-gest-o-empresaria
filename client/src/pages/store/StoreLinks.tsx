import StoreLayout from "@/components/StoreLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link as LinkIcon, TrendingUp, Users, DollarSign } from "lucide-react";

export default function StoreLinks() {
  return (
    <StoreLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <LinkIcon className="w-8 h-8 text-teal-600" />
              Links Rastreáveis
            </h1>
            <p className="text-muted-foreground">Crie e gerencie links rastreáveis para campanhas</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total de Links</CardDescription>
              <CardTitle className="text-3xl">0</CardTitle>
            </CardHeader>
            <CardContent>
              <LinkIcon className="w-8 h-8 text-teal-600" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Cliques Totais</CardDescription>
              <CardTitle className="text-3xl">0</CardTitle>
            </CardHeader>
            <CardContent>
              <TrendingUp className="w-8 h-8 text-green-600" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Conversões</CardDescription>
              <CardTitle className="text-3xl">0</CardTitle>
            </CardHeader>
            <CardContent>
              <Users className="w-8 h-8 text-blue-600" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Taxa de Conversão</CardDescription>
              <CardTitle className="text-3xl">0%</CardTitle>
            </CardHeader>
            <CardContent>
              <DollarSign className="w-8 h-8 text-yellow-600" />
            </CardContent>
          </Card>
        </div>

        {/* Empty State */}
        <Card>
          <CardContent className="py-12 text-center">
            <LinkIcon className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Em breve!</h3>
            <p className="text-muted-foreground">
              Funcionalidade de links rastreáveis em desenvolvimento.
            </p>
          </CardContent>
        </Card>
      </div>
    </StoreLayout>
  );
}
