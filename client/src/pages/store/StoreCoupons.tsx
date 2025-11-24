import { useState } from "react";
import { useParams } from "wouter";
import StoreLayout from "@/components/StoreLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { Loader2, Plus, Tag, TrendingUp, Users, DollarSign } from "lucide-react";
import { toast } from "sonner";

export default function StoreCoupons() {
  const { storeId } = useParams<{ storeId: string }>();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    code: "",
    type: "percentage" as "percentage" | "fixed",
    value: "",
    minPurchase: "",
    maxUses: "",
    validUntil: "",
  });

  const utils = trpc.useUtils();
  const { data: coupons, isLoading } = trpc.coupons.list.useQuery({ storeId: parseInt(storeId!) });
  const createMutation = trpc.coupons.create.useMutation({
    onSuccess: () => {
      toast.success("Cupom criado com sucesso!");
      utils.coupons.list.invalidate();
      setShowForm(false);
      setFormData({
        code: "",
        type: "percentage",
        value: "",
        minPurchase: "",
        maxUses: "",
        validUntil: "",
      });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // TODO: Implementar toggleStatus

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      storeId: parseInt(storeId!),
      code: formData.code.toUpperCase(),
      type: formData.type,
      value: parseInt(formData.value) * 100,
      minPurchase: formData.minPurchase ? parseInt(formData.minPurchase) * 100 : 0,
      maxUses: formData.maxUses ? parseInt(formData.maxUses) : undefined,
      validFrom: new Date(),
      validUntil: formData.validUntil ? new Date(formData.validUntil) : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    });
  };

  const activeCoupons = coupons?.filter(c => c.status === "active").length || 0;
  const totalUsed = coupons?.reduce((sum, c) => sum + c.currentUses, 0) || 0;

  return (
    <StoreLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Tag className="w-8 h-8 text-teal-600" />
              Cupons
            </h1>
            <p className="text-muted-foreground">Crie promoções e cupons de desconto</p>
          </div>
          <Button onClick={() => setShowForm(!showForm)} className="bg-teal-600 hover:bg-teal-700">
            <Plus className="w-4 h-4 mr-2" />
            Novo Cupom
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total de Cupons</CardDescription>
              <CardTitle className="text-3xl">{coupons?.length || 0}</CardTitle>
            </CardHeader>
            <CardContent>
              <Tag className="w-8 h-8 text-teal-600" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Cupons Ativos</CardDescription>
              <CardTitle className="text-3xl">{activeCoupons}</CardTitle>
            </CardHeader>
            <CardContent>
              <TrendingUp className="w-8 h-8 text-green-600" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total de Usos</CardDescription>
              <CardTitle className="text-3xl">{totalUsed}</CardTitle>
            </CardHeader>
            <CardContent>
              <Users className="w-8 h-8 text-blue-600" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Desconto Médio</CardDescription>
              <CardTitle className="text-3xl">
                {coupons && coupons.length > 0
                  ? Math.round(coupons.reduce((sum, c) => sum + (c.type === "percentage" ? c.value / 100 : 0), 0) / coupons.length)
                  : 0}%
              </CardTitle>
            </CardHeader>
            <CardContent>
              <DollarSign className="w-8 h-8 text-yellow-600" />
            </CardContent>
          </Card>
        </div>

        {/* Form */}
        {showForm && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Adicionar Novo Cupom</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="code">Código *</Label>
                    <Input
                      id="code"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                      placeholder="DESCONTO10"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="discountType">Tipo de Desconto</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value: "percentage" | "fixed") => setFormData({ ...formData, type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percentage">Porcentagem (%)</SelectItem>
                        <SelectItem value="fixed">Valor Fixo (R$)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="discountValue">
                      Valor do Desconto {formData.type === "percentage" ? "(%)" : "(R$)"} *
                    </Label>
                    <Input
                      id="discountValue"
                      type="number"
                      value={formData.value}
                      onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                      placeholder={formData.type === "percentage" ? "10" : "50.00"}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="minPurchase">Compra Mínima (R$)</Label>
                    <Input
                      id="minPurchase"
                      type="number"
                      value={formData.minPurchase}
                      onChange={(e) => setFormData({ ...formData, minPurchase: e.target.value })}
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <Label htmlFor="maxUses">Máximo de Usos</Label>
                    <Input
                      id="maxUses"
                      type="number"
                      value={formData.maxUses}
                      onChange={(e) => setFormData({ ...formData, maxUses: e.target.value })}
                      placeholder="Ilimitado"
                    />
                  </div>

                  <div>
                    <Label htmlFor="validUntil">Data de Expiração</Label>
                    <Input
                      id="validUntil"
                      type="date"
                      value={formData.validUntil}
                      onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" className="bg-teal-600 hover:bg-teal-700" disabled={createMutation.isPending}>
                    {createMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Adicionar Cupom
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* List */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
          </div>
        ) : coupons && coupons.length > 0 ? (
          <div className="space-y-4">
            {coupons.map((coupon) => (
              <Card key={coupon.id}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-xl font-bold">{coupon.code}</h3>
                        <Badge variant={coupon.status === "active" ? "default" : "secondary"}>
                          {coupon.status === "active" ? "Ativo" : "Inativo"}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                        <div>
                          <strong>Desconto:</strong>{" "}
                          {coupon.type === "percentage"
                            ? `${coupon.value / 100}%`
                            : `R$ ${(coupon.value / 100).toFixed(2)}`}
                        </div>
                        <div>
                          <strong>Compra Mínima:</strong> R$ {(coupon.minPurchase / 100).toFixed(2)}
                        </div>
                        <div>
                          <strong>Usos:</strong> {coupon.currentUses}
                          {coupon.maxUses ? ` / ${coupon.maxUses}` : " / Ilimitado"}
                        </div>
                        <div>
                          <strong>Expira:</strong> {coupon.validUntil ? new Date(coupon.validUntil).toLocaleDateString() : "Nunca"}
                        </div>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Criado em {new Date(coupon.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <Tag className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum cupom cadastrado</h3>
              <p className="text-muted-foreground mb-4">
                Crie cupons de desconto para atrair e fidelizar clientes!
              </p>
              <Button onClick={() => setShowForm(true)} className="bg-teal-600 hover:bg-teal-700">
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Primeiro Cupom
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </StoreLayout>
  );
}
