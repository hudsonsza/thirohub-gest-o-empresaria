import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { Store, Loader2, ArrowLeft } from "lucide-react";
import { Link, useLocation } from "wouter";
import { BRAND_COLORS, APP_TITLE, getLoginUrl } from "@/const";
import { toast } from "sonner";

export default function StoreLogin() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const login = trpc.storeAuth.login.useMutation({
    onSuccess: (data) => {
      toast.success("Login realizado com sucesso!");
      setLocation(`/admin/${data.storeId}`);
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao fazer login");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error("Preencha todos os campos");
      return;
    }

    login.mutate({ email, password });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Link href="/">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para Home
          </Button>
        </Link>

        <Card>
          <CardHeader className="text-center">
            <div 
              className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
              style={{ backgroundColor: `${BRAND_COLORS.primary}20` }}
            >
              <Store className="w-8 h-8" style={{ color: BRAND_COLORS.primary }} />
            </div>
            <CardTitle className="text-2xl">🏪 Área do Lojista</CardTitle>
            <p className="text-sm text-gray-600 mt-2">
              <strong>Você é um lojista?</strong> Entre com suas credenciais para gerenciar sua loja
            </p>
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-left">
              <p className="text-xs text-blue-800">
                💡 <strong>Dica:</strong> Se você é o <strong>dono da plataforma</strong>, clique em "Sou Admin" abaixo.
              </p>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  required
                  autoFocus
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>

              <Button 
                type="submit" 
                className="w-full"
                style={{ backgroundColor: BRAND_COLORS.primary }}
                disabled={login.isPending}
              >
                {login.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Entrando...
                  </>
                ) : (
                  'Entrar'
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Ainda não tem uma loja?{" "}
                <Link href="/stores/new">
                  <a className="font-medium hover:underline" style={{ color: BRAND_COLORS.primary }}>
                    Crie agora
                  </a>
                </Link>
              </p>
            </div>

            <div className="mt-4 pt-4 border-t text-center space-y-3">
              <p className="text-xs text-gray-500">
                Você é o <strong>dono da plataforma</strong>?{" "}
                <a href={getLoginUrl()}>
                  <span className="font-medium hover:underline" style={{ color: BRAND_COLORS.primary }}>
                    👑 Sou Admin
                  </span>
                </a>
              </p>
              <p className="text-xs text-gray-500">
                Você é um <strong>comprador</strong>?{" "}
                <Link href="/">
                  <a className="font-medium hover:underline" style={{ color: BRAND_COLORS.secondary }}>
                    🛍️ Ir para lojas
                  </a>
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
