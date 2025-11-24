import StoreLayout from "@/components/StoreLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { useStoreAuth } from "@/hooks/useStoreAuth";
import { Package, Plus, Edit, Trash2, Eye, EyeOff } from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";
import { useState } from "react";

export default function StoreProducts() {
  const { storeOwner } = useStoreAuth();
  
  const { data: products, refetch } = trpc.products.list.useQuery(
    { storeId: storeOwner?.storeId || 0 },
    { enabled: !!storeOwner?.storeId }
  );

  const { data: store } = trpc.stores.getById.useQuery(
    { id: storeOwner?.storeId || 0 },
    { enabled: !!storeOwner?.storeId }
  );

  const deleteMutation = trpc.products.delete.useMutation({
    onSuccess: () => {
      toast.success("Produto deletado com sucesso!");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const updateMutation = trpc.products.update.useMutation({
    onSuccess: () => {
      toast.success("Produto atualizado!");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleDelete = (id: number, name: string) => {
    if (confirm(`Deseja realmente deletar o produto "${name}"?`)) {
      deleteMutation.mutate({ id });
    }
  };

  const toggleAvailability = (id: number, currentStatus: string) => {
    updateMutation.mutate({
      id,
      status: currentStatus === "active" ? "inactive" : "active",
    });
  };

  const productCount = products?.length || 0;
  const isBasic = store?.plan === "basic";
  const limit = isBasic ? 50 : null;
  const canAddMore = !limit || productCount < limit;

  return (
    <StoreLayout>
      <div className="p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Produtos</h1>
            <p className="text-gray-600 mt-1">
              {productCount} produto{productCount !== 1 ? "s" : ""} cadastrado{productCount !== 1 ? "s" : ""}
              {limit && ` (limite: ${limit})`}
            </p>
          </div>
          <Link href={`/admin/${storeOwner?.storeId}/products/new`}>
            <Button 
              className="bg-teal-600 hover:bg-teal-700"
              disabled={!canAddMore}
            >
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Produto
            </Button>
          </Link>
        </div>

        {/* Limit Warning */}
        {isBasic && productCount >= 45 && (
          <Card className="p-4 mb-6 bg-yellow-50 border-yellow-200">
            <div className="flex items-center gap-3">
              <Package className="w-5 h-5 text-yellow-600" />
              <div>
                <p className="font-medium text-yellow-900">
                  {productCount >= 50 
                    ? "Limite de produtos atingido!" 
                    : `Você está próximo do limite (${productCount}/50)`}
                </p>
                <p className="text-sm text-yellow-700">
                  Faça upgrade para Pro ou Platinum para produtos ilimitados
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Products List */}
        {!products || products.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Nenhum produto cadastrado
            </h3>
            <p className="text-gray-600 mb-6">
              Comece adicionando seus primeiros produtos à loja
            </p>
            <Link href={`/admin/${storeOwner?.storeId}/products/new`}>
              <Button className="bg-teal-600 hover:bg-teal-700">
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Primeiro Produto
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="grid gap-4">
            {products.map((product: any) => (
              <Card key={product.id} className="p-6">
                <div className="flex items-start gap-4">
                  {/* Product Image */}
                  {product.images && product.images.length > 0 ? (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-24 h-24 object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Package className="w-8 h-8 text-gray-400" />
                    </div>
                  )}

                  {/* Product Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {product.name}
                        </h3>
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {product.description}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-teal-600">
                          R$ {(product.price / 100).toFixed(2)}
                        </div>
                        {product.compareAtPrice && (
                          <div className="text-sm text-gray-500 line-through">
                            R$ {(product.compareAtPrice / 100).toFixed(2)}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 mt-4">
                      {/* Status Badge */}
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          product.status === "active"
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {product.status === "active" ? "Disponível" : "Indisponível"}
                      </span>

                      {/* Stock */}
                      {product.stock !== null && (
                        <span className="text-sm text-gray-600">
                          Estoque: {product.stock}
                        </span>
                      )}

                      {/* Actions */}
                      <div className="ml-auto flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleAvailability(product.id, product.status)}
                        >
                          {product.status === "active" ? (
                            <>
                              <EyeOff className="w-4 h-4 mr-1" />
                              Ocultar
                            </>
                          ) : (
                            <>
                              <Eye className="w-4 h-4 mr-1" />
                              Mostrar
                            </>
                          )}
                        </Button>
                        <Link href={`/admin/${storeOwner?.storeId}/products/${product.id}/edit`}>
                          <Button variant="outline" size="sm">
                            <Edit className="w-4 h-4 mr-1" />
                            Editar
                          </Button>
                        </Link>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(product.id, product.name)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Deletar
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </StoreLayout>
  );
}
