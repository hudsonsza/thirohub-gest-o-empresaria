import { useStoreAuth } from "@/hooks/useStoreAuth";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Tag, 
  Link as LinkIcon, 
  Users, 
  BarChart3,
  LogOut,
  Store,
  Crown
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Loader2 } from "lucide-react";

interface StoreLayoutProps {
  children: React.ReactNode;
}

export default function StoreLayout({ children }: StoreLayoutProps) {
  const { storeOwner, isLoading, logout } = useStoreAuth();
  const [location] = useLocation();

  // Usar dados da loja que já vêm do storeAuth.me
  const store = storeOwner?.store;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
      </div>
    );
  }

  if (!storeOwner || !store) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Acesso Negado</h2>
          <p className="text-gray-600 mb-6">Você precisa estar logado como lojista</p>
          <Link href="/store/login">
            <Button className="bg-teal-600 hover:bg-teal-700">
              Fazer Login
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const isPro = store.plan === "pro" || store.plan === "platinum";
  const isPlatinum = store.plan === "platinum";

  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: `/admin/${store.id}`, enabled: true },
    { icon: Package, label: "Produtos", href: `/admin/${store.id}/products`, enabled: true },
    { icon: ShoppingCart, label: "Pedidos", href: `/admin/${store.id}/orders`, enabled: true },
    { icon: Tag, label: "Cupons", href: `/admin/${store.id}/coupons`, enabled: isPro, badge: "Pro" },
    { icon: LinkIcon, label: "Links", href: `/admin/${store.id}/links`, enabled: isPro, badge: "Pro" },
    { icon: Users, label: "Afiliados", href: `/admin/${store.id}/affiliates`, enabled: isPlatinum, badge: "Platinum" },
    { icon: BarChart3, label: "Relatórios", href: `/admin/${store.id}/reports`, enabled: isPro, badge: "Pro" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r flex flex-col">
        {/* Store Info */}
        <div className="p-6 border-b">
          <div className="flex items-center gap-3 mb-2">
            {store.logoUrl ? (
              <img src={store.logoUrl} alt={store.name} className="w-10 h-10 rounded-lg object-cover" />
            ) : (
              <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                <Store className="w-5 h-5 text-teal-600" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h2 className="font-semibold text-gray-900 truncate">{store.name}</h2>
              <p className="text-xs text-gray-500">/{store.slug}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              store.plan === "platinum" 
                ? "bg-purple-100 text-purple-700"
                : store.plan === "pro"
                ? "bg-blue-100 text-blue-700"
                : "bg-gray-100 text-gray-700"
            }`}>
              {store.plan === "platinum" ? "💎 Platinum" : store.plan === "pro" ? "🚀 Pro" : "📦 Basic"}
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.href;
            
            if (!item.enabled) {
              return (
                <div
                  key={item.href}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-400 cursor-not-allowed"
                  title={`Disponível apenas no plano ${item.badge}`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="flex-1">{item.label}</span>
                  <Crown className="w-3 h-3" />
                </div>
              );
            }

            return (
              <Link key={item.href} href={item.href}>
                <a
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    isActive
                      ? "bg-teal-50 text-teal-700 font-medium"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="flex-1">{item.label}</span>
                </a>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t">
          <div className="text-xs text-gray-600 mb-2">
            {storeOwner.email}
          </div>
          <Button
            onClick={logout}
            variant="outline"
            size="sm"
            className="w-full"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sair
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
