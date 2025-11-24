import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { APP_TITLE, getLoginUrl, PLANS, BRAND_COLORS } from "@/const";
import { 
  Store, 
  ShoppingCart, 
  MessageCircle, 
  TrendingUp, 
  Users, 
  Zap,
  Check,
  ArrowRight,
  Sparkles
} from "lucide-react";
import { Link } from "wouter";

export default function Home() {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Store className="w-8 h-8" style={{ color: BRAND_COLORS.primary }} />
            <h1 className="text-2xl font-bold" style={{ color: BRAND_COLORS.primary }}>
              {APP_TITLE}
            </h1>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-gray-600 hover:text-gray-900">Recursos</a>
            <a href="#plans" className="text-gray-600 hover:text-gray-900">Planos</a>
            <a href="#how-it-works" className="text-gray-600 hover:text-gray-900">Como Funciona</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/store/login">
              <Button variant="outline" size="sm">
                🏪 Lojista
              </Button>
            </Link>
            {isAuthenticated ? (
              <Link href="/dashboard">
                <Button size="sm" style={{ backgroundColor: BRAND_COLORS.primary }}>
                  👑 Admin
                </Button>
              </Link>
            ) : (
              <a href={getLoginUrl()}>
                <Button size="sm" style={{ backgroundColor: BRAND_COLORS.primary }}>
                  👑 Admin
                </Button>
              </a>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-teal-50 to-amber-50 px-4 py-2 rounded-full mb-6">
            <Sparkles className="w-4 h-4" style={{ color: BRAND_COLORS.secondary }} />
            <span className="text-sm font-medium">Crie sua loja virtual em minutos</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-teal-700 to-teal-900 bg-clip-text text-transparent">
            Venda Mais com Sua Loja Virtual no WhatsApp
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Crie sua loja online profissional e receba pedidos direto no WhatsApp. 
            Sem complicação, sem mensalidade abusiva.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/cadastrar">
              <Button
                size="lg"
                className="text-lg px-8"
                style={{ backgroundColor: BRAND_COLORS.primary }}
              >
                Começar Grátis
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <a href="#plans">
              <Button 
                size="lg" 
                variant="outline" 
                className="text-lg px-8"
              >
                Ver Planos
              </Button>
            </a>
          </div>

          <p className="text-sm text-gray-500 mt-4">
            ✨ 7 dias grátis • Sem cartão de crédito • Cancele quando quiser
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              Tudo que você precisa para vender online
            </h2>
            <p className="text-xl text-gray-600">
              Recursos poderosos para impulsionar suas vendas
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-2 hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4" 
                     style={{ backgroundColor: `${BRAND_COLORS.primary}20` }}>
                  <Store className="w-6 h-6" style={{ color: BRAND_COLORS.primary }} />
                </div>
                <h3 className="text-xl font-semibold mb-2">Loja Personalizada</h3>
                <p className="text-gray-600">
                  Crie sua loja com suas cores, logo e identidade visual única
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4" 
                     style={{ backgroundColor: `${BRAND_COLORS.secondary}20` }}>
                  <MessageCircle className="w-6 h-6" style={{ color: BRAND_COLORS.secondary }} />
                </div>
                <h3 className="text-xl font-semibold mb-2">Pedidos no WhatsApp</h3>
                <p className="text-gray-600">
                  Receba pedidos direto no seu WhatsApp com todos os detalhes
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4" 
                     style={{ backgroundColor: `${BRAND_COLORS.primary}20` }}>
                  <ShoppingCart className="w-6 h-6" style={{ color: BRAND_COLORS.primary }} />
                </div>
                <h3 className="text-xl font-semibold mb-2">Gestão de Produtos</h3>
                <p className="text-gray-600">
                  Adicione produtos, fotos, vídeos e gerencie seu estoque facilmente
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4" 
                     style={{ backgroundColor: `${BRAND_COLORS.secondary}20` }}>
                  <TrendingUp className="w-6 h-6" style={{ color: BRAND_COLORS.secondary }} />
                </div>
                <h3 className="text-xl font-semibold mb-2">Cupons de Desconto</h3>
                <p className="text-gray-600">
                  Crie promoções e cupons para aumentar suas vendas
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4" 
                     style={{ backgroundColor: `${BRAND_COLORS.primary}20` }}>
                  <Users className="w-6 h-6" style={{ color: BRAND_COLORS.primary }} />
                </div>
                <h3 className="text-xl font-semibold mb-2">Sistema de Afiliados</h3>
                <p className="text-gray-600">
                  Tenha vendedores promovendo seus produtos e pague comissão automática
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4" 
                     style={{ backgroundColor: `${BRAND_COLORS.secondary}20` }}>
                  <Zap className="w-6 h-6" style={{ color: BRAND_COLORS.secondary }} />
                </div>
                <h3 className="text-xl font-semibold mb-2">Links Rastreáveis</h3>
                <p className="text-gray-600">
                  Acompanhe de onde vêm suas vendas com links personalizados
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Plans Section */}
      <section id="plans" className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              Escolha o plano ideal para você
            </h2>
            <p className="text-xl text-gray-600">
              Comece grátis e evolua conforme seu negócio cresce
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Basic Plan */}
            <Card className="border-2 hover:shadow-xl transition-shadow">
              <CardContent className="pt-6">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold mb-2">{PLANS.basic.name}</h3>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-bold">R$ {PLANS.basic.price.toFixed(2)}</span>
                    <span className="text-gray-600">/mês</span>
                  </div>
                </div>
                <ul className="space-y-3 mb-6">
                  {PLANS.basic.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Check className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: BRAND_COLORS.primary }} />
                      <span className="text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/cadastrar">
                  <Button className="w-full" variant="outline">
                    Começar Grátis
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Pro Plan - Featured */}
            <Card className="border-2 relative hover:shadow-xl transition-shadow" 
                  style={{ borderColor: BRAND_COLORS.primary }}>
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <span className="px-4 py-1 rounded-full text-sm font-semibold text-white"
                      style={{ backgroundColor: BRAND_COLORS.secondary }}>
                  Mais Popular
                </span>
              </div>
              <CardContent className="pt-6">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold mb-2">{PLANS.pro.name}</h3>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-bold">R$ {PLANS.pro.price.toFixed(2)}</span>
                    <span className="text-gray-600">/mês</span>
                  </div>
                </div>
                <ul className="space-y-3 mb-6">
                  {PLANS.pro.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Check className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: BRAND_COLORS.primary }} />
                      <span className="text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/cadastrar">
                  <Button className="w-full" style={{ backgroundColor: BRAND_COLORS.primary }}>
                    Começar Grátis
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Platinum Plan */}
            <Card className="border-2 hover:shadow-xl transition-shadow">
              <CardContent className="pt-6">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold mb-2">{PLANS.platinum.name}</h3>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-bold">R$ {PLANS.platinum.price.toFixed(2)}</span>
                    <span className="text-gray-600">/mês</span>
                  </div>
                </div>
                <ul className="space-y-3 mb-6">
                  {PLANS.platinum.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Check className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: BRAND_COLORS.primary }} />
                      <span className="text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/cadastrar">
                  <Button className="w-full" variant="outline">
                    Começar Grátis
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-4 bg-white">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              Como funciona?
            </h2>
            <p className="text-xl text-gray-600">
              Comece a vender em 3 passos simples
            </p>
          </div>

          <div className="space-y-12">
            <div className="flex gap-6 items-start">
              <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold text-xl"
                   style={{ backgroundColor: BRAND_COLORS.primary }}>
                1
              </div>
              <div>
                <h3 className="text-2xl font-semibold mb-2">Crie sua conta</h3>
                <p className="text-gray-600 text-lg">
                  Cadastre-se gratuitamente e configure sua loja com suas cores e logo
                </p>
              </div>
            </div>

            <div className="flex gap-6 items-start">
              <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold text-xl"
                   style={{ backgroundColor: BRAND_COLORS.secondary }}>
                2
              </div>
              <div>
                <h3 className="text-2xl font-semibold mb-2">Adicione seus produtos</h3>
                <p className="text-gray-600 text-lg">
                  Cadastre seus produtos com fotos, descrições e preços
                </p>
              </div>
            </div>

            <div className="flex gap-6 items-start">
              <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold text-xl"
                   style={{ backgroundColor: BRAND_COLORS.primary }}>
                3
              </div>
              <div>
                <h3 className="text-2xl font-semibold mb-2">Compartilhe e venda</h3>
                <p className="text-gray-600 text-lg">
                  Compartilhe o link da sua loja e comece a receber pedidos no WhatsApp
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Access Levels Section */}
      <section className="py-20 px-4 bg-white border-t">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">
              Quem pode usar o Thiro Vendas?
            </h2>
            <p className="text-lg text-gray-600">
              Nosso sistema é dividido em 3 níveis de acesso
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Nível 1 - Admin */}
            <Card className="border-2" style={{ borderColor: BRAND_COLORS.primary }}>
              <CardContent className="pt-6 text-center">
                <div className="text-5xl mb-4">👑</div>
                <h3 className="text-xl font-bold mb-2">Administrador</h3>
                <p className="text-sm text-gray-600 mb-4">Dono da Plataforma</p>
                <div className="space-y-2 text-sm text-left">
                  <p>• Gerencia a plataforma</p>
                  <p>• Cria lojas para clientes</p>
                  <p>• Acessa via OAuth Manus</p>
                </div>
                <a href={getLoginUrl()} className="block mt-4">
                  <Button className="w-full" style={{ backgroundColor: BRAND_COLORS.primary }}>
                    Acessar como Admin
                  </Button>
                </a>
              </CardContent>
            </Card>

            {/* Nível 2 - Lojista */}
            <Card className="border-2" style={{ borderColor: BRAND_COLORS.secondary }}>
              <CardContent className="pt-6 text-center">
                <div className="text-5xl mb-4">🏪</div>
                <h3 className="text-xl font-bold mb-2">Lojista</h3>
                <p className="text-sm text-gray-600 mb-4">Cliente que contrata o serviço</p>
                <div className="space-y-2 text-sm text-left">
                  <p>• Gerencia sua loja</p>
                  <p>• Adiciona produtos e pedidos</p>
                  <p>• Login com email/senha</p>
                </div>
                <Link href="/store/login" className="block mt-4">
                  <Button className="w-full" style={{ backgroundColor: BRAND_COLORS.secondary }}>
                    Acessar como Lojista
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Nível 3 - Comprador */}
            <Card className="border-2 border-gray-300">
              <CardContent className="pt-6 text-center">
                <div className="text-5xl mb-4">🛍️</div>
                <h3 className="text-xl font-bold mb-2">Comprador</h3>
                <p className="text-sm text-gray-600 mb-4">Cliente final da loja</p>
                <div className="space-y-2 text-sm text-left">
                  <p>• Navega na loja pública</p>
                  <p>• Faz pedidos via WhatsApp</p>
                  <p>• Não precisa login</p>
                </div>
                <Button className="w-full mt-4" variant="outline" disabled>
                  Acesso direto à loja
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4" style={{ backgroundColor: `${BRAND_COLORS.primary}10` }}>
        <div className="container mx-auto text-center max-w-3xl">
          <h2 className="text-4xl font-bold mb-6">
            Pronto para começar a vender?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Junte-se a centenas de empreendedores que já estão vendendo com o Thiro Vendas
          </p>
          <a href={getLoginUrl()}>
            <Button 
              size="lg" 
              className="text-lg px-8"
              style={{ backgroundColor: BRAND_COLORS.primary }}
            >
              Criar Minha Loja Grátis
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 bg-gray-900 text-white">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Store className="w-6 h-6" style={{ color: BRAND_COLORS.secondary }} />
                <span className="text-xl font-bold">{APP_TITLE}</span>
              </div>
              <p className="text-gray-400">
                Sua loja virtual completa com vendas pelo WhatsApp
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Produto</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#features" className="hover:text-white">Recursos</a></li>
                <li><a href="#plans" className="hover:text-white">Planos</a></li>
                <li><a href="#how-it-works" className="hover:text-white">Como Funciona</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Empresa</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Sobre</a></li>
                <li><a href="#" className="hover:text-white">Blog</a></li>
                <li><a href="#" className="hover:text-white">Contato</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Termos de Uso</a></li>
                <li><a href="#" className="hover:text-white">Privacidade</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>&copy; 2024 {APP_TITLE}. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
