import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { APP_LOGO, APP_TITLE, getLoginUrl, OWNER_OPEN_ID } from "@/const";
import { trpc } from "@/lib/trpc";
import { Loader2, Plus, Store, Check, X, Copy, Trash2 } from "lucide-react";
import { Link } from "wouter";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useLocation } from "wouter";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  
  // Verificar autenticação admin
  const { data: adminUser, isLoading: adminLoading } = trpc.adminAuth.me.useQuery();
  
  useEffect(() => {
    if (!adminLoading && !adminUser) {
      // Redirecionar para login se não estiver autenticado
      setLocation("/admin/login");
    }
  }, [adminUser, adminLoading, setLocation]);
  
  const { user, loading, isAuthenticated } = useAuth();
  const { data: stores, isLoading: storesLoading, refetch } = trpc.stores.listAll.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  
  // Estados de gerenciamento de administradores
  const [adminManagementOpen, setAdminManagementOpen] = useState(false);
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [newAdminPassword, setNewAdminPassword] = useState("");
  const [newAdminName, setNewAdminName] = useState("");
  
  // Queries e mutations de gerenciamento de admins
  const { data: admins, isLoading: adminsLoading, refetch: refetchAdmins } = trpc.adminAuth.listAdmins.useQuery(undefined, {
    enabled: adminManagementOpen, // Só carregar quando modal abrir
  });
  
  const createAdminMutation = trpc.adminAuth.createAdmin.useMutation({
    onSuccess: () => {
      toast.success("Administrador criado com sucesso!");
      setNewAdminEmail("");
      setNewAdminPassword("");
      setNewAdminName("");
      refetchAdmins();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao criar administrador");
    },
  });
  
  const deleteAdminMutation = trpc.adminAuth.deleteAdmin.useMutation({
    onSuccess: () => {
      toast.success("Administrador removido com sucesso!");
      refetchAdmins();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao remover administrador");
    },
  });

  const approveMutation = trpc.stores.approve.useMutation({
    onSuccess: () => {
      toast.success("Loja aprovada com sucesso!");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const rejectMutation = trpc.stores.reject.useMutation({
    onSuccess: () => {
      toast.success("Loja rejeitada");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const deleteMutation = trpc.stores.deleteRejected.useMutation({
    onSuccess: () => {
      toast.success("Loja excluída com sucesso!");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const [activeTab, setActiveTab] = useState<"pending" | "approved" | "rejected">("pending");
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedStoreId, setSelectedStoreId] = useState<number | null>(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Lista de emails de administradores permitidos
  const ADMIN_EMAILS = [
    'thiagor.oliveira.profissional@gmail.com',
    // Adicione mais emails de admins aqui se necessário
  ];

  // Verificar se é o dono da plataforma (por OpenID ou email)
  const isOwner = user?.openId === OWNER_OPEN_ID || 
                  (user?.email && ADMIN_EMAILS.includes(user.email.toLowerCase()));

  if (loading || storesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Store className="w-8 h-8 text-teal-600" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Acesso Restrito</h2>
          <p className="text-gray-600 mb-6">
            Você precisa estar autenticado como administrador para acessar esta página.
          </p>
          <a href={getLoginUrl()}>
            <Button className="w-full bg-teal-600 hover:bg-teal-700">
              Fazer Login como Admin
            </Button>
          </a>
        </Card>
      </div>
    );
  }

  // Bloquear acesso se não for o dono
  if (isAuthenticated && !isOwner) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <X className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">🚫 Acesso Negado</h2>
          <p className="text-gray-600 mb-4">
            Você não tem permissão para acessar o painel administrativo.
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Este painel é restrito ao proprietário da plataforma Thiro Vendas.
          </p>
          <Link href="/">
            <Button className="bg-teal-600 hover:bg-teal-700">
              Voltar para Home
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  const pendingStores = stores?.filter(s => s.status === "pending") || [];
  const approvedStores = stores?.filter(s => s.status === "approved") || [];
  const rejectedStores = stores?.filter(s => s.status === "rejected") || [];

  const currentStores = activeTab === "pending" ? pendingStores : 
                        activeTab === "approved" ? approvedStores : 
                        rejectedStores;

  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  const handleApprove = (id: number) => {
    setSelectedStoreId(id);
    const newPassword = generatePassword();

    setPassword(newPassword);
    setConfirmPassword(newPassword);
    setApproveModalOpen(true);
  };

  const handleApproveConfirm = () => {
    if (!password || password.length < 6) {
      toast.error("Senha deve ter no mínimo 6 caracteres");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Senhas não conferem");
      return;
    }
    if (selectedStoreId) {

      approveMutation.mutate({ id: selectedStoreId, password });
      setApproveModalOpen(false);
    }
  };

  const handleDeleteRejected = (id: number) => {
    setSelectedStoreId(id);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (selectedStoreId) {
      deleteMutation.mutate({ id: selectedStoreId });
      setDeleteModalOpen(false);
      setSelectedStoreId(null);
    }
  };

  const handleReject = (id: number) => {
    const reason = prompt("Motivo da rejeição:");
    if (reason) {
      rejectMutation.mutate({ id, reason });
    }
  };
  
  const handleCreateAdmin = () => {
    if (!newAdminEmail || !newAdminPassword) {
      toast.error("Preencha email e senha");
      return;
    }
    if (newAdminPassword.length < 6) {
      toast.error("Senha deve ter no mínimo 6 caracteres");
      return;
    }
    createAdminMutation.mutate({
      email: newAdminEmail,
      password: newAdminPassword,
      name: newAdminName || undefined,
    });
  };
  
  const handleDeleteAdmin = (id: number) => {
    if (confirm("Tem certeza que deseja remover este administrador?")) {
      deleteAdminMutation.mutate({ id });
    }
  };

  // Mostrar loading enquanto verifica autenticação
  if (adminLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
      </div>
    );
  }
  
  // Se não estiver autenticado, não renderizar nada (useEffect vai redirecionar)
  if (!adminUser) {
    return null;
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/">
            <div className="flex items-center gap-2 cursor-pointer">
              <img src={APP_LOGO} alt={APP_TITLE} className="w-8 h-8" />
              <span className="text-xl font-bold text-teal-700">{APP_TITLE}</span>
            </div>
          </Link>
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAdminManagementOpen(true)}
            >
              👥 Gerenciar Administradores
            </Button>
            <span className="text-sm text-gray-600">
              👑 {adminUser?.name || adminUser?.email}
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">👑 Painel do Administrador</h1>
            <p className="text-gray-600 mt-1">Gerencie as lojas cadastradas na plataforma</p>
          </div>
          <Link href="/new-store">
            <Button className="bg-teal-600 hover:bg-teal-700">
              <Plus className="w-4 h-4 mr-2" />
              Criar Nova Loja
            </Button>
          </Link>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b">
          <button
            onClick={() => setActiveTab("pending")}
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${
              activeTab === "pending"
                ? "border-yellow-500 text-yellow-700"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            ⏳ Pendentes ({pendingStores.length})
          </button>
          <button
            onClick={() => setActiveTab("approved")}
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${
              activeTab === "approved"
                ? "border-green-500 text-green-700"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            ✅ Aprovadas ({approvedStores.length})
          </button>
          <button
            onClick={() => setActiveTab("rejected")}
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${
              activeTab === "rejected"
                ? "border-red-500 text-red-700"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            ❌ Rejeitadas ({rejectedStores.length})
          </button>
        </div>

        {/* Stores List */}
        {currentStores.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Store className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Nenhuma loja {activeTab === "pending" ? "pendente" : activeTab === "approved" ? "aprovada" : "rejeitada"}
            </h3>
            <p className="text-gray-600">
              {activeTab === "pending" && "Quando clientes se cadastrarem, aparecerão aqui para aprovação"}
              {activeTab === "approved" && "Nenhuma loja foi aprovada ainda"}
              {activeTab === "rejected" && "Nenhuma loja foi rejeitada"}
            </p>
          </Card>
        ) : (
          <div className="grid gap-4">
            {currentStores.map((store) => (
              <Card key={store.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {store.logoUrl && (
                        <img src={store.logoUrl} alt={store.name} className="w-12 h-12 rounded-lg object-cover" />
                      )}
                      <div>
                        <h3 className="text-xl font-semibold">{store.name}</h3>
                        <p className="text-sm text-gray-600">/{store.slug}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
                      <div>
                        <span className="text-gray-600">Proprietário:</span>
                        <p className="font-medium">{store.ownerName}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Email:</span>
                        <p className="font-medium">{store.ownerEmail}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">WhatsApp:</span>
                        <p className="font-medium">{store.ownerWhatsapp}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Plano:</span>
                        <p className="font-medium capitalize">{store.plan}</p>
                      </div>
                    </div>

                    {store.status === "rejected" && store.rejectionReason && (
                      <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-700">
                          <strong>Motivo da rejeição:</strong> {store.rejectionReason}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  {activeTab === "pending" && (
                    <div className="flex gap-2 ml-4">
                      <Button
                        onClick={() => handleApprove(store.id)}
                        disabled={approveMutation.isPending}
                        className="bg-green-600 hover:bg-green-700"
                        size="sm"
                      >
                        <Check className="w-4 h-4 mr-1" />
                        Aprovar
                      </Button>
                      <Button
                        onClick={() => handleReject(store.id)}
                        disabled={rejectMutation.isPending}
                        variant="destructive"
                        size="sm"
                      >
                        <X className="w-4 h-4 mr-1" />
                        Rejeitar
                      </Button>
                    </div>
                  )}

                  {activeTab === "approved" && (
                    <div className="flex flex-col gap-2 ml-4">
                      {store.plainPassword && (
                        <div className="flex items-center gap-2 p-2 bg-teal-50 border border-teal-200 rounded">
                          <span className="text-sm text-gray-700">
                            <strong>🔑 Senha:</strong> {store.plainPassword}
                          </span>
                          <Button
                            onClick={() => {
                              navigator.clipboard.writeText(store.plainPassword!);
                              toast.success("Senha copiada!");
                            }}
                            variant="outline"
                            size="sm"
                            className="ml-auto"
                          >
                            <Copy className="w-3 h-3 mr-1" />
                            Copiar
                          </Button>
                        </div>
                      )}
                      <Button
                        onClick={() => handleReject(store.id)}
                        disabled={rejectMutation.isPending}
                        variant="outline"
                        size="sm"
                      >
                        <X className="w-4 h-4 mr-1" />
                        Rejeitar
                      </Button>
                    </div>
                  )}

                  {activeTab === "rejected" && (
                    <div className="flex gap-2 ml-4">
                      <Button
                        onClick={() => handleApprove(store.id)}
                        disabled={approveMutation.isPending}
                        className="bg-green-600 hover:bg-green-700"
                        size="sm"
                      >
                        <Check className="w-4 h-4 mr-1" />
                        Aprovar
                      </Button>
                      <Button
                        onClick={() => handleDeleteRejected(store.id)}
                        disabled={deleteMutation.isPending}
                        variant="destructive"
                        size="sm"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Excluir
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Modal de Aprovação */}
      {approveModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4">🔑 Senha Gerada Automaticamente</h3>
            <p className="text-sm text-gray-600 mb-4">
              Copie esta senha e envie para o lojista por email ou WhatsApp.
            </p>
            
            <div className="space-y-4">
              <div className="bg-gray-50 border-2 border-teal-600 rounded-lg p-4">
                <label className="block text-sm font-medium mb-2 text-gray-700">Senha do Lojista:</label>
                <div className="flex items-center gap-2">
                  <Input
                    type="text"
                    value={password}
                    readOnly
                    className="font-mono text-lg font-bold bg-white"
                  />
                  <Button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(password);
                      toast.success("Senha copiada!");
                    }}
                    variant="outline"
                    size="sm"
                  >
                    📋 Copiar
                  </Button>
                </div>
              </div>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-sm text-yellow-800">
                  ⚠️ <strong>Importante:</strong> Salve esta senha antes de confirmar. Ela não poderá ser recuperada depois!
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                onClick={() => setApproveModalOpen(false)}
                variant="outline"
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleApproveConfirm}
                disabled={approveMutation.isPending}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                {approveMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Aprovar e Criar Credenciais
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Modal de Confirmação de Exclusão */}
      {deleteModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4 text-red-600">🗑️ Confirmar Exclusão</h3>
            <p className="text-sm text-gray-600 mb-4">
              Tem certeza que deseja excluir esta loja? Esta ação não pode ser desfeita.
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Todos os produtos, afiliados e vendas relacionados a esta loja também serão excluídos.
            </p>

            <div className="flex gap-3">
              <Button
                onClick={() => {
                  setDeleteModalOpen(false);
                  setSelectedStoreId(null);
                }}
                variant="outline"
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleDeleteConfirm}
                disabled={deleteMutation.isPending}
                variant="destructive"
                className="flex-1"
              >
                {deleteMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Excluir Permanentemente
              </Button>
            </div>
          </Card>
        </div>
      )}
      
      {/* Modal de Gerenciamento de Administradores */}
      {adminManagementOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4">👥 Gerenciar Administradores</h2>
              
              {/* Formulário para adicionar novo admin */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <h3 className="font-semibold mb-3">Adicionar Novo Administrador</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">Nome (opcional)</label>
                    <Input
                      value={newAdminName}
                      onChange={(e) => setNewAdminName(e.target.value)}
                      placeholder="Nome do administrador"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Email *</label>
                    <Input
                      type="email"
                      value={newAdminEmail}
                      onChange={(e) => setNewAdminEmail(e.target.value)}
                      placeholder="email@exemplo.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Senha *</label>
                    <Input
                      type="password"
                      value={newAdminPassword}
                      onChange={(e) => setNewAdminPassword(e.target.value)}
                      placeholder="Mínimo 6 caracteres"
                    />
                  </div>
                  <Button
                    onClick={handleCreateAdmin}
                    disabled={createAdminMutation.isPending}
                    className="w-full bg-teal-600 hover:bg-teal-700"
                  >
                    {createAdminMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Adicionar Administrador
                  </Button>
                </div>
              </div>
              
              {/* Lista de administradores */}
              <div>
                <h3 className="font-semibold mb-3">Administradores Cadastrados</h3>
                {adminsLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-teal-600" />
                  </div>
                ) : (
                  <div className="space-y-2">
                    {admins?.map((admin) => (
                      <div key={admin.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <div className="font-medium">{admin.name || admin.email}</div>
                          {admin.name && <div className="text-sm text-gray-600">{admin.email}</div>}
                          {admin.lastLoginAt && (
                            <div className="text-xs text-gray-500">
                              Último login: {new Date(admin.lastLoginAt).toLocaleString('pt-BR')}
                            </div>
                          )}
                        </div>
                        {admin.id !== adminUser?.id && (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteAdmin(admin.id)}
                            disabled={deleteAdminMutation.isPending}
                          >
                            Remover
                          </Button>
                        )}
                        {admin.id === adminUser?.id && (
                          <span className="text-sm text-gray-500">(Você)</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="flex gap-3 mt-6">
                <Button
                  onClick={() => {
                    setAdminManagementOpen(false);
                    setNewAdminEmail("");
                    setNewAdminPassword("");
                    setNewAdminName("");
                  }}
                  variant="outline"
                  className="w-full"
                >
                  Fechar
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
