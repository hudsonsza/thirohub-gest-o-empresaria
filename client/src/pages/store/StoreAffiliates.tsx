import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import StoreLayout from "@/components/StoreLayout";
import { trpc } from "@/lib/trpc";
import { Loader2, Plus, Users, DollarSign, TrendingUp, Copy, Check, X } from "lucide-react";
import { useParams } from "wouter";
import { useState } from "react";
import { toast } from "sonner";

export default function StoreAffiliates() {
  const { storeId } = useParams<{ storeId: string }>();
  const storeIdNum = parseInt(storeId || "0");

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    whatsapp: "",
    commissionPercentage: 10,
  });
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const { data: store } = trpc.stores.getById.useQuery(
    { id: storeIdNum },
    { enabled: !!storeIdNum }
  );
  
  const { data: affiliates, isLoading, refetch } = trpc.affiliates.list.useQuery(
    { storeId: storeIdNum },
    { enabled: !!storeIdNum }
  );
  
  // Limite de afiliados para plano Platinum
  const PLATINUM_AFFILIATE_LIMIT = 7;
  const EXTRA_AFFILIATE_COST = 50; // R$ 50,00 por afiliado adicional
  
  const activeAffiliatesCount = affiliates?.filter(a => a.status === 'active').length || 0;
  const isPlatinum = store?.plan === 'platinum';
  const isOverLimit = isPlatinum && activeAffiliatesCount > PLATINUM_AFFILIATE_LIMIT;
  const extraAffiliates = isOverLimit ? activeAffiliatesCount - PLATINUM_AFFILIATE_LIMIT : 0;
  const extraCost = extraAffiliates * EXTRA_AFFILIATE_COST;

  const createMutation = trpc.affiliates.create.useMutation({
    onSuccess: () => {
      toast.success("Afiliado criado com sucesso!");
      setShowForm(false);
      setFormData({ name: "", email: "", whatsapp: "", commissionPercentage: 10 });
      refetch();
    },
    onError: (error: any) => {
      toast.error(error.message);
    },
  });

  const toggleStatusMutation = trpc.affiliates.toggleStatus.useMutation({
    onSuccess: () => {
      toast.success("Status atualizado!");
      refetch();
    },
    onError: (error: any) => {
      toast.error(error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email) {
      toast.error("Preencha nome e email");
      return;
    }

    if (formData.commissionPercentage < 0 || formData.commissionPercentage > 100) {
      toast.error("Comissão deve estar entre 0% e 100%");
      return;
    }

    createMutation.mutate({
      storeId: storeIdNum,
      ...formData,
    });
  };

  const copyAffiliateLink = (code: string) => {
    const link = `${window.location.origin}/loja/${storeId}?ref=${code}`;
    navigator.clipboard.writeText(link);
    setCopiedCode(code);
    toast.success("Link copiado!");
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const copyAffiliateCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success("Código copiado!");
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Calcular estatísticas
  const totalAffiliates = affiliates?.length || 0;
  const activeAffiliates = affiliates?.filter(a => a.status === 'active').length || 0;
  const totalSales = affiliates?.reduce((sum, a) => sum + (a.totalSales || 0), 0) || 0;
  const totalCommission = affiliates?.reduce((sum, a) => sum + (a.totalCommission || 0), 0) || 0;

  return (
    <StoreLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">👥 Afiliados</h1>
            <p className="text-gray-600 mt-1">
              Gerencie seus afiliados e acompanhe as comissões
            </p>
          </div>
          <Button
            onClick={() => setShowForm(!showForm)}
            className="bg-teal-600 hover:bg-teal-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Novo Afiliado
          </Button>
        </div>
        
        {/* Aviso de Limite de Afiliados (Platinum) */}
        {isPlatinum && (
          <Card className={isOverLimit ? "border-orange-300 bg-orange-50" : "border-blue-300 bg-blue-50"}>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">
                    {isOverLimit ? "⚠️ Limite de Afiliados Ultrapassado" : "📊 Limite de Afiliados - Plano Platinum"}
                  </h3>
                  <p className="text-sm text-gray-700 mt-1">
                    {isOverLimit ? (
                      <>
                        Você tem <strong>{activeAffiliatesCount} afiliados ativos</strong>, ultrapassando o limite de <strong>{PLATINUM_AFFILIATE_LIMIT} afiliados</strong> incluídos no plano Platinum.
                        <br />
                        <span className="text-orange-700 font-semibold">
                          Cobrança adicional: {extraAffiliates} afiliado(s) × R$ {EXTRA_AFFILIATE_COST.toFixed(2)} = <strong>R$ {extraCost.toFixed(2)}</strong>
                        </span>
                      </>
                    ) : (
                      <>
                        Seu plano Platinum inclui até <strong>{PLATINUM_AFFILIATE_LIMIT} afiliados simultâneos</strong>. Você tem <strong>{activeAffiliatesCount}/{PLATINUM_AFFILIATE_LIMIT}</strong> afiliados ativos.
                        {activeAffiliatesCount < PLATINUM_AFFILIATE_LIMIT && (
                          <span className="text-green-700"> Ainda restam <strong>{PLATINUM_AFFILIATE_LIMIT - activeAffiliatesCount}</strong> vagas!</span>
                        )}
                        <br />
                        <span className="text-gray-600">
                          Afiliados adicionais serão cobrados <strong>R$ {EXTRA_AFFILIATE_COST.toFixed(2)}</strong> cada.
                        </span>
                      </>
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total de Afiliados</p>
                  <p className="text-2xl font-bold mt-1">{totalAffiliates}</p>
                </div>
                <Users className="w-8 h-8 text-teal-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Afiliados Ativos</p>
                  <p className="text-2xl font-bold mt-1">{activeAffiliates}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total de Vendas</p>
                  <p className="text-2xl font-bold mt-1">{totalSales}</p>
                </div>
                <DollarSign className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Comissões a Pagar</p>
                  <p className="text-2xl font-bold mt-1">
                    R$ {(totalCommission / 100).toFixed(2)}
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-amber-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Form */}
        {showForm && (
          <Card>
            <CardHeader>
              <CardTitle>Adicionar Novo Afiliado</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Nome *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Nome do afiliado"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="email@exemplo.com"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="whatsapp">WhatsApp (Opcional)</Label>
                    <Input
                      id="whatsapp"
                      value={formData.whatsapp}
                      onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                      placeholder="(11) 99999-9999"
                    />
                  </div>

                  <div>
                    <Label htmlFor="commission">Comissão (%)</Label>
                    <Input
                      id="commission"
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={formData.commissionPercentage}
                      onChange={(e) => setFormData({ ...formData, commissionPercentage: parseFloat(e.target.value) })}
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowForm(false)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={createMutation.isPending}
                    className="bg-teal-600 hover:bg-teal-700"
                  >
                    {createMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Adicionar Afiliado
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
        ) : !affiliates || affiliates.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Nenhum afiliado cadastrado
              </h3>
              <p className="text-gray-600 mb-4">
                Comece adicionando seu primeiro afiliado para aumentar suas vendas!
              </p>
              <Button
                onClick={() => setShowForm(true)}
                className="bg-teal-600 hover:bg-teal-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Primeiro Afiliado
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {affiliates.map((affiliate) => (
              <Card key={affiliate.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold">{affiliate.name}</h3>
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            affiliate.status === 'active'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {affiliate.status === 'active' ? 'Ativo' : 'Inativo'}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                        <div>
                          <p><strong>Email:</strong> {affiliate.email}</p>
                          {affiliate.whatsapp && (
                            <p><strong>WhatsApp:</strong> {affiliate.whatsapp}</p>
                          )}
                        </div>
                        <div>
                          <p><strong>Comissão:</strong> {affiliate.commissionPercentage}%</p>
                          <p><strong>Vendas:</strong> {affiliate.totalSales || 0}</p>
                          <p><strong>Comissões:</strong> R$ {((affiliate.totalCommission || 0) / 100).toFixed(2)}</p>
                        </div>
                      </div>

                      <div className="mt-4 space-y-2">
                        <div className="flex items-center gap-2">
                          <Label className="text-sm font-medium">Código:</Label>
                          <code className="px-2 py-1 bg-gray-100 rounded text-sm font-mono">
                            {affiliate.affiliateCode}
                          </code>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => copyAffiliateCode(affiliate.affiliateCode)}
                          >
                            {copiedCode === affiliate.affiliateCode ? (
                              <Check className="w-4 h-4 text-green-600" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </Button>
                        </div>

                        <div className="flex items-center gap-2">
                          <Label className="text-sm font-medium">Link:</Label>
                          <code className="px-2 py-1 bg-gray-100 rounded text-sm font-mono flex-1 truncate">
                            {window.location.origin}/loja/{storeId}?ref={affiliate.affiliateCode}
                          </code>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => copyAffiliateLink(affiliate.affiliateCode)}
                          >
                            {copiedCode === affiliate.affiliateCode ? (
                              <Check className="w-4 h-4 text-green-600" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="ml-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toggleStatusMutation.mutate({ id: affiliate.id })}
                        disabled={toggleStatusMutation.isPending}
                      >
                        {affiliate.status === 'active' ? (
                          <>
                            <X className="w-4 h-4 mr-1" />
                            Desativar
                          </>
                        ) : (
                          <>
                            <Check className="w-4 h-4 mr-1" />
                            Ativar
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </StoreLayout>
  );
}
