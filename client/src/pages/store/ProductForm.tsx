import StoreLayout from "@/components/StoreLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { useStoreAuth } from "@/hooks/useStoreAuth";
import { useLocation, useParams } from "wouter";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { Loader2, Upload, X } from "lucide-react";

export default function ProductForm() {
  const { storeOwner } = useStoreAuth();
  const params = useParams();
  const [, setLocation] = useLocation();
  const productId = params.id ? parseInt(params.id) : null;
  const isEdit = !!productId;

  const { data: store } = trpc.stores.getById.useQuery(
    { id: storeOwner?.storeId || 0 },
    { enabled: !!storeOwner?.storeId }
  );

  const { data: product, isLoading: productLoading } = trpc.products.getById.useQuery(
    { id: productId || 0 },
    { enabled: !!productId }
  );

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    stock: "0",
    videoUrl: "",
    images: [] as string[],
    featured: false,
    availableForAffiliates: false,
  });

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        description: product.description || "",
        price: (product.price / 100).toString(),
        category: product.category || "",
        stock: product.stock?.toString() || "0",
        videoUrl: product.videoUrl || "",
        images: product.images || [],
        featured: product.featured,
        availableForAffiliates: product.availableForAffiliates,
      });
    }
  }, [product]);

  const createMutation = trpc.products.create.useMutation({
    onSuccess: () => {
      toast.success("Produto criado com sucesso!");
      setLocation(`/admin/${storeOwner?.storeId}/products`);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const updateMutation = trpc.products.update.useMutation({
    onSuccess: () => {
      toast.success("Produto atualizado com sucesso!");
      setLocation(`/admin/${storeOwner?.storeId}/products`);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.price) {
      toast.error("Nome e preço são obrigatórios");
      return;
    }

    const data = {
      storeId: storeOwner?.storeId || 0,
      name: formData.name,
      description: formData.description,
      price: Math.round(parseFloat(formData.price) * 100),
      category: formData.category || undefined,
      stock: parseInt(formData.stock) || 0,
      videoUrl: formData.videoUrl || undefined,
      images: formData.images,
      featured: formData.featured,
      availableForAffiliates: formData.availableForAffiliates,
    };

    if (isEdit && productId) {
      updateMutation.mutate({ id: productId, ...data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleImageUrlAdd = () => {
    const url = prompt("Cole a URL da imagem:");
    if (url) {
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, url]
      }));
    }
  };

  const handleImageRemove = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const isPro = store?.plan === "pro" || store?.plan === "platinum";
  const isPlatinum = store?.plan === "platinum";
  const isLoading = createMutation.isPending || updateMutation.isPending;

  if (productLoading) {
    return (
      <StoreLayout>
        <div className="flex items-center justify-center h-screen">
          <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
        </div>
      </StoreLayout>
    );
  }

  return (
    <StoreLayout>
      <div className="p-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {isEdit ? "Editar Produto" : "Adicionar Produto"}
          </h1>
          <p className="text-gray-600 mt-1">
            Preencha as informações do produto
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <Card className="p-6 space-y-6">
            {/* Nome */}
            <div>
              <Label htmlFor="name">Nome do Produto *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Camiseta Básica Branca"
                required
              />
            </div>

            {/* Descrição */}
            <div>
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descreva o produto..."
                rows={4}
              />
            </div>

            {/* Preço */}
            <div>
              <Label htmlFor="price">Preço (R$) *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="0.00"
                required
              />
            </div>

            {/* Categoria e Estoque */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">Categoria</Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="Ex: Roupas, Acessórios"
                />
              </div>
              <div>
                <Label htmlFor="stock">Estoque</Label>
                <Input
                  id="stock"
                  type="number"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  placeholder="0"
                />
              </div>
            </div>

            {/* Vídeo (Pro/Platinum) */}
            {isPro && (
              <div>
                <Label htmlFor="videoUrl">
                  URL do Vídeo 
                  <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                    Pro/Platinum
                  </span>
                </Label>
                <Input
                  id="videoUrl"
                  value={formData.videoUrl}
                  onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                  placeholder="https://youtube.com/watch?v=..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  YouTube, Vimeo ou link direto
                </p>
              </div>
            )}

            {/* Imagens */}
            <div>
              <Label>Imagens do Produto</Label>
              <div className="mt-2 space-y-3">
                {formData.images.map((url, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <img src={url} alt={`Imagem ${index + 1}`} className="w-16 h-16 object-cover rounded" />
                    <div className="flex-1 text-sm text-gray-600 truncate">{url}</div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleImageRemove(index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleImageUrlAdd}
                  className="w-full"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Adicionar Imagem (URL)
                </Button>
                <p className="text-xs text-gray-500">
                  Cole a URL de uma imagem hospedada online
                </p>
              </div>
            </div>

            {/* Opções */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.featured}
                  onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                  className="w-4 h-4 text-teal-600"
                />
                <span className="text-sm text-gray-700">Produto em destaque</span>
              </label>

              {isPlatinum && (
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.availableForAffiliates}
                    onChange={(e) => setFormData({ ...formData, availableForAffiliates: e.target.checked })}
                    className="w-4 h-4 text-teal-600"
                  />
                  <span className="text-sm text-gray-700">
                    Disponível para afiliados
                    <span className="ml-2 text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                      Platinum
                    </span>
                  </span>
                </label>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => setLocation(`/admin/${storeOwner?.storeId}/products`)}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="bg-teal-600 hover:bg-teal-700"
                disabled={isLoading}
              >
                {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {isEdit ? "Salvar Alterações" : "Criar Produto"}
              </Button>
            </div>
          </Card>
        </form>
      </div>
    </StoreLayout>
  );
}
