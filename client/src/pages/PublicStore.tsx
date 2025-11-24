import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { Loader2, ShoppingCart, Search, Phone, Store as StoreIcon } from "lucide-react";
import { useParams, useSearch } from "wouter";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export default function PublicStore() {
  const { slug } = useParams<{ slug: string }>();
  const search = useSearch();
  const affiliateRef = new URLSearchParams(search).get("ref");

  const [searchTerm, setSearchTerm] = useState("");
  const [cart, setCart] = useState<Array<{ productId: number; quantity: number }>>([]);

  const { data: store, isLoading: storeLoading } = trpc.stores.getBySlug.useQuery(
    { slug: slug || "" },
    { enabled: !!slug }
  );

  const { data: products, isLoading: productsLoading } = trpc.products.listPublic.useQuery(
    { storeId: store?.id || 0 },
    { enabled: !!store?.id }
  );

  const trackClickMutation = trpc.affiliates.trackClick.useMutation();

  // Rastrear clique do afiliado
  useEffect(() => {
    if (affiliateRef && store?.id) {
      // Salvar no localStorage para persistir durante a sessão
      localStorage.setItem(`affiliate_${store.id}`, affiliateRef);
      
      // Registrar clique
      trackClickMutation.mutate({ code: affiliateRef });
      
      toast.success("Link de afiliado detectado! 🎉");
    }
  }, [affiliateRef, store?.id]);

  const filteredProducts = products?.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addToCart = (productId: number) => {
    const existing = cart.find(item => item.productId === productId);
    if (existing) {
      setCart(cart.map(item =>
        item.productId === productId
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { productId, quantity: 1 }]);
    }
    toast.success("Produto adicionado ao carrinho!");
  };

  const getTotalItems = () => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  };

  const getTotalPrice = () => {
    if (!products) return 0;
    return cart.reduce((sum, item) => {
      const product = products.find(p => p.id === item.productId);
      return sum + (product?.price || 0) * item.quantity;
    }, 0);
  };

  const sendToWhatsApp = () => {
    if (!store || !products || cart.length === 0) return;

    let message = `*Olá! Gostaria de fazer um pedido:*\n\n`;
    
    cart.forEach(item => {
      const product = products.find(p => p.id === item.productId);
      if (product) {
        message += `• ${product.name} - ${item.quantity}x R$ ${(product.price / 100).toFixed(2)}\n`;
      }
    });

    message += `\n*Total: R$ ${(getTotalPrice() / 100).toFixed(2)}*`;

    // Adicionar código de afiliado se existir
    const savedAffiliate = localStorage.getItem(`affiliate_${store.id}`);
    if (savedAffiliate) {
      message += `\n\n_Código de indicação: ${savedAffiliate}_`;
    }

    const whatsappUrl = `https://wa.me/${store.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  if (storeLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
      </div>
    );
  }

  if (!store) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <StoreIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Loja não encontrada</h1>
          <p className="text-gray-600">Verifique o endereço e tente novamente.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header 
        className="text-white py-6 shadow-lg"
        style={{ backgroundColor: store.primaryColor || '#0F766E' }}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {store.logoUrl && (
                <img 
                  src={store.logoUrl} 
                  alt={store.name}
                  className="w-12 h-12 rounded-full bg-white p-1"
                />
              )}
              <div>
                <h1 className="text-2xl font-bold">{store.name}</h1>
                {store.category && (
                  <p className="text-sm opacity-90">{store.category}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <a 
                href={`https://wa.me/${store.whatsapp.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:opacity-80"
              >
                <Phone className="w-5 h-5" />
                <span className="hidden sm:inline">Contato</span>
              </a>

              {cart.length > 0 && (
                <Button
                  onClick={sendToWhatsApp}
                  className="relative"
                  style={{ backgroundColor: store.secondaryColor || '#F59E0B' }}
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Carrinho ({getTotalItems()})
                  <span className="ml-2">
                    R$ {(getTotalPrice() / 100).toFixed(2)}
                  </span>
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Search */}
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-2xl mx-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Buscar produtos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <main className="container mx-auto px-4 pb-12">
        {productsLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
          </div>
        ) : !filteredProducts || filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">
              {searchTerm ? "Nenhum produto encontrado." : "Nenhum produto disponível no momento."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                {product.images && product.images.length > 0 && (
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-48 object-cover"
                  />
                )}
                <CardContent className="p-4">
                  <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
                  {product.description && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {product.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold" style={{ color: store.primaryColor || '#0F766E' }}>
                        R$ {(product.price / 100).toFixed(2)}
                      </p>
                      {product.stock !== null && product.stock > 0 && (
                        <p className="text-xs text-gray-500">
                          {product.stock} em estoque
                        </p>
                      )}
                    </div>
                    <Button
                      onClick={() => addToCart(product.id)}
                      disabled={product.stock !== null && product.stock === 0}
                      style={{ backgroundColor: store.primaryColor || '#0F766E' }}
                      className="hover:opacity-90"
                    >
                      <ShoppingCart className="w-4 h-4 mr-1" />
                      Adicionar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-6 mt-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm">
            © {new Date().getFullYear()} {store.name}. Todos os direitos reservados.
          </p>
          <p className="text-xs text-gray-400 mt-2">
            Powered by Thiro Vendas
          </p>
        </div>
      </footer>
    </div>
  );
}
