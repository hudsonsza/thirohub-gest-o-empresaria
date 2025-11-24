import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { Store, Loader2, ArrowLeft, CheckCircle } from "lucide-react";
import { Link, useLocation } from "wouter";
import { BRAND_COLORS, slugify, PLANS } from "@/const";
import { toast } from "sonner";

export default function NewStore() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    ownerName: user?.name || "",
    ownerEmail: user?.email || "",
    ownerWhatsapp: "",
    cpfCnpj: "",
    category: "",
    plan: "basic" as "basic" | "pro" | "platinum",
    whatsapp: "",
  });

  const [showSuccess, setShowSuccess] = useState(false);

  const createStore = trpc.stores.create.useMutation({
    onSuccess: (data) => {
      toast.success("Loja cadastrada com sucesso!");
      setShowSuccess(true);
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao criar loja");
    },
  });

  const handleNameChange = (name: string) => {
    setFormData({
      ...formData,
      name,
      slug: slugify(name),
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.slug || !formData.ownerName || !formData.ownerEmail || !formData.whatsapp) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    createStore.mutate({
      ...formData,
      ownerWhatsapp: formData.ownerWhatsapp || formData.whatsapp,
    });
  };

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full">
          <CardContent className="pt-12 pb-12 text-center">
            <div className="flex justify-center mb-6">
              <div 
                className="w-20 h-20 rounded-full flex items-center justify-center"
                style={{ backgroundColor: `${BRAND_COLORS.primary}20` }}
              >
                <CheckCircle className="w-12 h-12" style={{ color: BRAND_COLORS.primary }} />
              </div>
            </div>

            <h1 className="text-3xl font-bold mb-4">Cadastro Realizado com Sucesso! 🎉</h1>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6 text-left">
              <h3 className="font-semibold text-lg mb-3">📋 Próximos Passos:</h3>
              <ol className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="font-semibold min-w-6">1.</span>
                  <span>Sua loja <strong>{formData.name}</strong> está aguardando aprovação do administrador</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-semibold min-w-6">2.</span>
                  <span>Você receberá um email em <strong>{formData.ownerEmail}</strong> com suas credenciais de acesso</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-semibold min-w-6">3.</span>
                  <span>Após a aprovação, você poderá fazer login e começar a configurar sua loja</span>
                </li>
              </ol>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-amber-800">
                ⏱️ <strong>Tempo de aprovação:</strong> Geralmente processamos novos cadastros em até 24 horas úteis.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/">
                <Button variant="outline">
                  Voltar para Home
                </Button>
              </Link>
              <Link href="/store/login">
                <Button style={{ backgroundColor: BRAND_COLORS.primary }}>
                  Ir para Login
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="container mx-auto max-w-2xl py-8">
        <Link href="/">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
        </Link>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div 
                className="w-12 h-12 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `${BRAND_COLORS.primary}20` }}
              >
                <Store className="w-6 h-6" style={{ color: BRAND_COLORS.primary }} />
              </div>
              <div>
                <CardTitle className="text-2xl">Criar Nova Loja</CardTitle>
                <p className="text-sm text-gray-600">
                  Preencha os dados da sua loja virtual
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Informações da Loja */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Informações da Loja</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="name">Nome da Loja *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="Ex: Minha Loja Virtual"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slug">URL da Loja *</Label>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">thirovendas.com/</span>
                    <Input
                      id="slug"
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: slugify(e.target.value) })}
                      placeholder="minha-loja"
                      required
                    />
                  </div>
                  <p className="text-xs text-gray-500">
                    Esta será a URL da sua loja virtual
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Categoria</Label>
                  <Input
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="Ex: Moda, Eletrônicos, Alimentos..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="whatsapp">WhatsApp da Loja *</Label>
                  <Input
                    id="whatsapp"
                    value={formData.whatsapp}
                    onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                    placeholder="(11) 99999-9999"
                    required
                  />
                  <p className="text-xs text-gray-500">
                    Os pedidos serão enviados para este número
                  </p>
                </div>
              </div>

              {/* Informações do Proprietário */}
              <div className="space-y-4 pt-4 border-t">
                <h3 className="font-semibold text-lg">Informações do Proprietário</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="ownerName">Nome Completo *</Label>
                  <Input
                    id="ownerName"
                    value={formData.ownerName}
                    onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                    placeholder="Seu nome completo"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ownerEmail">Email *</Label>
                  <Input
                    id="ownerEmail"
                    type="email"
                    value={formData.ownerEmail}
                    onChange={(e) => setFormData({ ...formData, ownerEmail: e.target.value })}
                    placeholder="seu@email.com"
                    required
                  />
                  <p className="text-xs text-gray-500">
                    Você receberá suas credenciais de acesso neste email
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ownerWhatsapp">WhatsApp Pessoal</Label>
                  <Input
                    id="ownerWhatsapp"
                    value={formData.ownerWhatsapp}
                    onChange={(e) => setFormData({ ...formData, ownerWhatsapp: e.target.value })}
                    placeholder="(11) 99999-9999"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cpfCnpj">CPF ou CNPJ</Label>
                  <Input
                    id="cpfCnpj"
                    value={formData.cpfCnpj}
                    onChange={(e) => setFormData({ ...formData, cpfCnpj: e.target.value })}
                    placeholder="000.000.000-00 ou 00.000.000/0000-00"
                  />
                </div>
              </div>

              {/* Plano */}
              <div className="space-y-4 pt-4 border-t">
                <h3 className="font-semibold text-lg">Escolha seu Plano</h3>
                
                <div className="grid md:grid-cols-3 gap-4">
                  {Object.entries(PLANS).map(([key, plan]) => (
                    <Card 
                      key={key}
                      className={`cursor-pointer transition-all ${
                        formData.plan === key 
                          ? 'border-2 shadow-lg' 
                          : 'border hover:border-gray-400'
                      }`}
                      style={formData.plan === key ? { borderColor: BRAND_COLORS.primary } : {}}
                      onClick={() => setFormData({ ...formData, plan: key as any })}
                    >
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <h4 className="font-semibold mb-2">{plan.name}</h4>
                          <p className="text-2xl font-bold mb-4">
                            R$ {plan.price.toFixed(2)}
                            <span className="text-sm text-gray-600">/mês</span>
                          </p>
                          <p className="text-xs text-gray-600">
                            {plan.features[0]}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    ✨ <strong>7 dias grátis!</strong> Você pode testar todos os recursos sem compromisso.
                  </p>
                </div>
              </div>

              {/* Botões */}
              <div className="flex gap-3 pt-4">
                <Link href="/" className="flex-1">
                  <Button type="button" variant="outline" className="w-full">
                    Cancelar
                  </Button>
                </Link>
                <Button 
                  type="submit" 
                  className="flex-1"
                  style={{ backgroundColor: BRAND_COLORS.primary }}
                  disabled={createStore.isPending}
                >
                  {createStore.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Store className="w-4 h-4 mr-2" />
                      Enviar Cadastro
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
