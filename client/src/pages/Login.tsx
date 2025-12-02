import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, ShieldCheck, Store } from "lucide-react";
import { APP_TITLE, BRAND_COLORS } from "@/const";

export default function Login() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <Link href="/">
          <Button variant="ghost" className="mb-8">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para Home
          </Button>
        </Link>

        <div className="text-center mb-10">
          <p className="text-sm uppercase tracking-[0.3em] text-gray-500 mb-2">Bem-vindo ao</p>
          <h1 className="text-4xl font-bold text-gray-900">{APP_TITLE}</h1>
          <p className="text-gray-600 mt-4">
            Escolha como deseja acessar o painel.
            Lojistas possuem uma conta por loja, enquanto administradores acessam o painel geral.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="border-teal-100 shadow-lg shadow-teal-100/40">
            <CardHeader>
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center mb-4"
                style={{ backgroundColor: `${BRAND_COLORS.primary}15` }}
              >
                <Store className="w-6 h-6" style={{ color: BRAND_COLORS.primary }} />
              </div>
              <CardTitle className="text-2xl">Área do Lojista</CardTitle>
              <p className="text-sm text-gray-500 mt-2">
                Gerencie produtos, pedidos, afiliados, cupons e todos os recursos da sua loja.
              </p>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Login com email e senha definidos no cadastro da loja</li>
                <li>• Acesso restrito aos gestores da loja específica</li>
                <li>• Recursos variam conforme o plano contratado</li>
              </ul>
              <Link href="/store/login">
                <Button className="w-full" style={{ backgroundColor: BRAND_COLORS.primary }}>
                  Entrar como Lojista
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="border-amber-100 shadow-lg shadow-amber-100/40">
            <CardHeader>
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center mb-4 bg-amber-50"
              >
                <ShieldCheck className="w-6 h-6 text-amber-600" />
              </div>
              <CardTitle className="text-2xl">Área do Administrador</CardTitle>
              <p className="text-sm text-gray-500 mt-2">
                Acesse o painel principal, aprove lojas, crie usuários e configure toda a plataforma.
              </p>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Uso exclusivo do dono ou equipe central da plataforma</li>
                <li>• Gerencie lojistas, planos, cores e configurações gerais</li>
                <li>• Controle total sobre aprovações e contas de administrador</li>
              </ul>
              <Link href="/admin/login">
                <Button className="w-full bg-amber-500 hover:bg-amber-600">
                  Entrar como Admin
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
