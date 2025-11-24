import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { APP_LOGO, APP_TITLE } from "@/const";
import { trpc } from "@/lib/trpc";
import { Store, Loader2, CheckCircle } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useState } from "react";
import { toast } from "sonner";

export default function PublicRegister() {
  const [, setLocation] = useLocation();
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    description: "",
    plan: "basic" as "basic" | "pro" | "platinum",
  });

  const createMutation = trpc.stores.register.useMutation({
    onSuccess: () => {
      setSubmitted(true);
      toast.success("Cadastro enviado com sucesso!");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.phone) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error("Email inválido");
      return;
    }

    createMutation.mutate({
      name: formData.name,
      ownerEmail: formData.email,
      ownerName: formData.name, // Usar nome da loja como nome do dono por enquanto
      ownerWhatsapp: formData.phone,
      whatsapp: formData.phone,
      plan: formData.plan,
      // Não envia senha - será definida pelo admin na aprovação
    });
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-amber-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            🎉 Cadastro Enviado!
          </h2>
          <p className="text-gray-600 mb-4">
            Seu cadastro foi enviado com sucesso e está aguardando aprovação.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left">
            <h3 className="font-semibold text-blue-900 mb-2">Próximos Passos:</h3>
            <ol className="text-sm text-blue-800 space-y-2">
              <li>1. Nossa equipe irá analisar seu cadastro</li>
              <li>2. Você receberá um email com a aprovação</li>
              <li>3. Suas credenciais de acesso serão enviadas</li>
              <li>4. Faça login e comece a vender!</li>
            </ol>
          </div>
          <p className="text-sm text-gray-500 mb-6">
            Geralmente aprovamos em até 24 horas úteis.
          </p>
          <Link href="/">
            <Button className="w-full bg-teal-600 hover:bg-teal-700">
              Voltar para Home
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-amber-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/">
            <div className="flex items-center gap-3 cursor-pointer">
              <Store className="w-8 h-8 text-teal-600" />
              <span className="text-xl font-bold text-gray-900">{APP_TITLE}</span>
            </div>
          </Link>
          <Link href="/">
            <Button variant="outline">Voltar</Button>
          </Link>
        </div>
      </header>

      {/* Form */}
      <div className="container mx-auto px-4 py-12 max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Crie Sua Loja Virtual
          </h1>
          <p className="text-lg text-gray-600">
            Preencha o formulário abaixo e comece a vender em minutos
          </p>
        </div>

        <Card className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nome da Loja */}
            <div>
              <Label htmlFor="name">Nome da Loja *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Minha Loja Virtual"
                required
              />
            </div>

            {/* Email */}
            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="seu@email.com"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Você usará este email para fazer login
              </p>
            </div>

            {/* Telefone */}
            <div>
              <Label htmlFor="phone">WhatsApp *</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="(11) 99999-9999"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Seus clientes farão pedidos neste número
              </p>
            </div>

            {/* Descrição */}
            <div>
              <Label htmlFor="description">Descrição da Loja (Opcional)</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Conte um pouco sobre sua loja e o que você vende..."
                rows={3}
              />
            </div>

            {/* Plano */}
            <div>
              <Label>Escolha seu Plano</Label>
              <div className="grid grid-cols-3 gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, plan: "basic" })}
                  className={`p-4 border-2 rounded-lg text-center transition-all ${
                    formData.plan === "basic"
                      ? "border-teal-600 bg-teal-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="font-bold text-lg">Basic</div>
                  <div className="text-sm text-gray-600">R$ 109,90</div>
                  <div className="text-xs text-gray-500 mt-1">50 produtos</div>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, plan: "pro" })}
                  className={`p-4 border-2 rounded-lg text-center transition-all ${
                    formData.plan === "pro"
                      ? "border-teal-600 bg-teal-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="font-bold text-lg">Pro</div>
                  <div className="text-sm text-gray-600">R$ 199,90</div>
                  <div className="text-xs text-gray-500 mt-1">Ilimitado</div>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, plan: "platinum" })}
                  className={`p-4 border-2 rounded-lg text-center transition-all ${
                    formData.plan === "platinum"
                      ? "border-teal-600 bg-teal-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="font-bold text-lg">Platinum</div>
                  <div className="text-sm text-gray-600">R$ 349,90</div>
                  <div className="text-xs text-gray-500 mt-1">Afiliados</div>
                </button>
              </div>
            </div>

            {/* Info */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <p className="text-sm text-amber-800">
                <strong>📝 Importante:</strong> Após o envio, seu cadastro será analisado por nossa equipe. 
                Você receberá um email com suas credenciais de acesso assim que for aprovado.
              </p>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              className="w-full bg-teal-600 hover:bg-teal-700 h-12 text-lg"
              disabled={createMutation.isPending}
            >
              {createMutation.isPending && <Loader2 className="w-5 h-5 mr-2 animate-spin" />}
              Enviar Cadastro
            </Button>

            <p className="text-xs text-center text-gray-500">
              Ao enviar, você concorda com nossos Termos de Uso e Política de Privacidade
            </p>
          </form>
        </Card>
      </div>
    </div>
  );
}
