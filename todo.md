# Thiro Vendas - TODO List

## Fase 1: Banco de Dados
- [x] Criar schema completo com 7 tabelas (Store, Product, Order, Coupon, TrackingLink, Affiliate, Sale)
- [x] Adicionar relacionamentos e índices
- [x] Fazer push do schema para o banco

## Fase 2: Backend API
- [x] Criar routers tRPC para cada entidade
- [x] Implementar CRUD de Stores (lojas)
- [x] Implementar CRUD de Products (produtos)
- [x] Implementar CRUD de Orders (pedidos)
- [x] Implementar CRUD de Coupons (cupons)
- [x] Implementar CRUD de TrackingLinks (links rastreáveis)
- [x] Implementar CRUD de Affiliates (afiliados)
- [x] Implementar registro de Sales (vendas)
- [x] Adicionar validação de planos (Basic/Pro/Platinum)
- [ ] Implementar upload de imagens (produtos e logos)
- [x] Criar sistema de geração de códigos únicos (access_code, affiliate_code)

## Fase 3: Frontend - Páginas Públicas
- [ ] Adaptar Home (landing page)
- [ ] Adaptar Plans (página de planos)
- [ ] Adaptar Demo (demonstração)
- [ ] Adaptar Contact (contato)
- [ ] Criar Header e Footer públicos

## Fase 4: Frontend - Autenticação
- [ ] Adaptar Login
- [ ] Adaptar Onboarding (cadastro de loja)
- [ ] Adaptar AfterLogin (redirecionamento pós-login)

## Fase 5: Frontend - Painel Admin (3 versões)
- [ ] Adaptar AdminBasic (painel plano Basic)
- [ ] Adaptar AdminPro (painel plano Pro)
- [ ] Adaptar AdminPlatinum (painel plano Platinum)
- [ ] Criar Sidebar de navegação
- [ ] Criar componentes compartilhados (StatsCard, etc)

## Fase 6: Frontend - Loja Virtual
- [ ] Adaptar StoreProducts (listagem de produtos)
- [ ] Adaptar StoreProductDetail (detalhes do produto)
- [ ] Adaptar StoreCheckout (checkout)
- [ ] Adaptar StoreConfirmation (confirmação de pedido)
- [ ] Criar StoreHeader e StoreFooter
- [ ] Criar ProductCard
- [ ] Criar CartDrawer (carrinho)

## Fase 7: Integrações
- [ ] Integrar envio de pedidos via WhatsApp
- [ ] Implementar sistema de rastreamento de links
- [ ] Implementar sistema de cupons com validação
- [ ] Implementar sistema de afiliados com comissões
- [ ] Adicionar campos de cupom/afiliado no checkout

## Fase 8: Testes e Ajustes
- [ ] Testar fluxo completo de cadastro de loja
- [ ] Testar criação e edição de produtos
- [ ] Testar fluxo de compra completo
- [ ] Testar sistema de cupons
- [ ] Testar sistema de afiliados
- [ ] Testar multi-tenancy (isolamento entre lojas)
- [ ] Verificar cores da marca (Teal #0F766E + Gold #F59E0B)

## Fase 9: Documentação e Deploy
- [ ] Criar documentação de instalação
- [ ] Criar documentação de uso
- [ ] Preparar para deploy
- [ ] Criar checkpoint final


## Fase 10: Ajustes de Preços e Autenticação Multi-Nível
- [x] Atualizar preços dos planos (109.90, 199.90, 349.90)
- [x] Criar tabela de sessões de lojistas no banco
- [x] Implementar hash de senhas (bcrypt)
- [x] Criar endpoints de registro de lojista
- [x] Criar endpoints de login de lojista
- [x] Criar middleware de autenticação de lojista
- [x] Criar página de login para lojistas
- [x] Criar página de registro para lojistas (integrado no NewStore)
- [x] Separar rotas: admin (OAuth Manus) vs lojista (email/senha)
- [x] Atualizar dashboard para detectar tipo de usuário
- [x] Testar login de lojista
- [x] Testar fluxo completo sem Base44


## Fase 11: Correção de Preços e Diferenciação de Acessos
- [x] Buscar e corrigir preços em TODOS os arquivos do projeto
- [x] Verificar schema do banco (tabela stores)
- [x] Verificar routers (validação de planos)
- [x] Verificar páginas frontend (Home, NewStore, etc)
- [x] Adicionar badges/indicadores visuais para cada nível de usuário
- [x] Melhorar header da Home com links claros para cada tipo de acesso
- [x] Criar seção explicando os 3 níveis na Home
- [x] Testar fluxo completo de cada nível


## Fase 12: Correção do Header - Botões de Acesso
- [x] Corrigir header para mostrar AMBOS os botões sempre
- [x] Garantir que apareça "Admin" E "Lojista" lado a lado
- [x] Testar visualmente no navegador


## Fase 13: Sistema de Cadastro Público com Aprovação
- [x] Adicionar campo `status` (pending/approved/rejected) na tabela stores
- [x] Adicionar campo `rejectionReason` na tabela stores
- [x] Fazer push do schema atualizado
- [x] Criar routers de aprovação/rejeição
- [x] Criar aba "Lojas Pendentes" no dashboard admin
- [x] Criar aba "Lojas Aprovadas" no dashboard admin
- [x] Criar aba "Lojas Rejeitadas" no dashboard admin
- [x] Adicionar botões aprovar/rejeitar no dashboard
- [x] Bloquear login de lojistas com status != approved
- [x] Mostrar mensagem de "aguardando aprovação" no login
- [ ] Criar página pública de cadastro (/cadastrar-loja)
- [ ] Testar fluxo completo (cadastro → aprovação → login)


## Fase 14: Painel do Lojista - Dashboard e Produtos
- [x] Criar layout do painel do lojista com sidebar
- [x] Criar dashboard com estatísticas (vendas, produtos, pedidos)
- [x] Criar página de listagem de produtos
- [x] Criar formulário de adicionar produto
- [x] Criar formulário de editar produto
- [x] Adicionar validação de limite de 50 produtos (plano Basic)
- [x] Adicionar campo de vídeo (apenas Pro/Platinum)
- [ ] Implementar sistema de upload de imagens de produtos (S3)

## Fase 15: Painel do Lojista - Pedidos, Cupons e Afiliados
- [x] Criar página de listagem de pedidos
- [x] Criar página de detalhes do pedido
- [x] Adicionar atualização de status do pedido
- [ ] Criar página de cupons (apenas Pro/Platinum)
- [ ] Criar formulário de criar/editar cupom
- [ ] Criar página de links rastreáveis (apenas Pro/Platinum)
- [ ] Criar página de afiliados (apenas Platinum)
- [ ] Criar formulário de adicionar afiliado
- [ ] Criar página de relatórios com gráficos

## Fase 16: Loja Virtual Pública
- [ ] Criar página inicial da loja (catálogo)
- [ ] Criar página de detalhes do produto
- [ ] Implementar sistema de carrinho (localStorage)
- [ ] Criar página de checkout
- [ ] Adicionar aplicação de cupons no checkout
- [ ] Implementar geração de mensagem para WhatsApp
- [ ] Adicionar rastreamento de cliques (links rastreáveis)
- [ ] Adicionar rastreamento de afiliados
- [ ] Criar página de busca/filtros
- [ ] Tornar loja responsiva (mobile-first)


## Fase 16: Segurança do Dashboard Admin
- [x] Verificar se dashboard admin está restrito apenas ao dono
- [x] Adicionar verificação de OWNER_OPEN_ID
- [x] Bloquear acesso de outros usuários OAuth ao dashboard admin
- [x] Mensagem de "Acesso Negado" para não-donos


## Fase 17: Cadastro Público de Lojas
- [x] Criar página pública de cadastro (/cadastrar)
- [x] Formulário sem campo de senha (admin define depois)
- [x] Botão "Começar Grátis" da home redireciona para /cadastrar
- [x] Loja criada fica com status "pending" automaticamente
- [x] Modificar dashboard admin para definir senha ao aprovar
- [x] Modal/formulário de aprovação com campo de senha
- [x] Criar credenciais de lojista ao aprovar (email + senha definida)
- [ ] Testar fluxo: cadastro → aprovação → login do lojista


## Fase 18: Sistema de Afiliados (Platinum)
- [x] Criar página de listagem de afiliados (/admin/:storeId/affiliates)
- [x] Criar formulário de adicionar afiliado
- [x] Gerar código único para cada afiliado
- [x] Implementar ativar/desativar afiliado
- [x] Adicionar endpoint toggleStatus no backend
- [x] Criar sistema de links rastreáveis com código de afiliado
- [x] Rastrear cliques nos links de afiliados
- [x] Criar loja virtual pública (/loja/:slug)
- [x] Implementar carrinho de compras
- [x] Integração com WhatsApp
- [x] Detectar e salvar código de afiliado
- [ ] Registrar vendas por afiliado automaticamente
- [ ] Calcular comissões automaticamente
- [ ] Criar relatório de comissões a pagar
- [ ] Criar histórico de vendas por afiliado
- [ ] Adicionar validação de plano Platinum
- [ ] Testar fluxo completo de afiliados


## Fase 19: Correção de Acesso ao Dashboard Admin
- [x] Adicionar verificação por email além de OWNER_OPEN_ID
- [x] Permitir acesso para thiagor.oliveira.profissional@gmail.com
- [x] Criar lista de emails de administradores
- [x] Testar acesso ao dashboard


## Fase 20: Correção de Erro React #310
- [x] Identificar causa do erro React #310 no Dashboard
- [x] Corrigir uso incorreto de hooks
- [x] Verificar ordem de declaração de variáveis e hooks
- [x] Testar dashboard após correção


## Fase 21: Correções do Dashboard Admin
- [x] Reforçar proteção do dashboard admin (OAuth + email obrigatório)
- [x] Verificar por que cadastros não aparecem na listagem
- [x] Corrigir query ou filtro de lojas pendentes (criado endpoint listAll)
- [x] Implementar geração automática de senha forte (12 caracteres)
- [x] Mostrar senha gerada para admin copiar (modal com botão copiar)
- [x] Criar tabela storeSessions no banco de dados
- [x] Permitir múltiplas lojas por email (mesmo lojista várias lojas)
- [x] Adicionar cookie-parser ao servidor Express
- [x] Corrigir sistema de aprovação e criação de credenciais
- [ ] Debugar problema de autenticação do lojista (cookie não persiste após login)


## Fase 22: Correção de Autenticação do Lojista
- [x] Investigar configuração de cookies (httpOnly, secure, sameSite, domain, path)
- [x] Corrigir secure para true (ambiente usa HTTPS)
- [x] Adicionar cookie-parser ao servidor Express
- [x] Verificar se cookie está sendo setado corretamente no response
- [x] Verificar se cookie está sendo enviado nas requisições seguintes
- [x] Modificar StoreLayout para usar dados de storeAuth.me (evitar query protectedProcedure)
- [x] Adicionar campos completos da loja ao retorno de storeAuth.me
- [x] Testar login e acesso ao dashboard do lojista - FUNCIONANDO!
- [x] Confirmar que sessão persiste após reload da página


## Fase 23: Correção de Acesso aos Endpoints do Lojista
- [x] Criar middleware `storeOwnerProcedure` para autenticação de lojistas
- [x] Atualizar endpoints de produtos para aceitar autenticação de lojista
- [x] Atualizar endpoints de afiliados para aceitar autenticação de lojista
- [x] Criar tabela products no banco de dados
- [x] Testar criação de produto no painel do lojista - FUNCIONANDO!
- [ ] Criar tabelas restantes (affiliates, orders, coupons, trackingLinks)
- [ ] Atualizar endpoints de pedidos para aceitar autenticação de lojista
- [ ] Atualizar endpoints de cupons para aceitar autenticação de lojista
- [ ] Testar criação de afiliado no painel do lojista


## Fase 24: Criação de Tabelas Restantes e Páginas Faltantes
- [x] Criar tabela affiliates no banco de dados
- [x] Criar tabela orders no banco de dados  
- [x] Criar tabela coupons no banco de dados
- [x] Criar tabela trackingLinks no banco de dados
- [x] Implementar página de Cupons (/admin/:storeId/coupons) - versão básica
- [x] Implementar página de Links Rastreáveis (/admin/:storeId/links) - versão básica
- [x] Implementar página de Relatórios (/admin/:storeId/reports) - versão básica
- [x] Adicionar rotas no App.tsx para as novas páginas
- [x] Adicionar card com link da loja no dashboard do lojista (copiar e abrir)
- [x] Atualizar loja para plano Platinum para testar afiliados
- [x] Testar criação de afiliado - FUNCIONANDO!
- [ ] Implementar funcionalidade completa de cupons (criar, editar, desativar)
- [ ] Implementar funcionalidade completa de links rastreáveis
- [ ] Implementar gráficos e relatórios detalhados


## Fase 25: Correção de Rota /new-store
- [x] Corrigir erro 404 na rota /new-store (rota faltante no App.tsx)


## Fase 26: Correção de "Loja não encontrada"
- [ ] Investigar por que /loja/thirolojas retorna "Loja não encontrada"
- [ ] Verificar se loja existe no banco com esse slug
- [ ] Verificar query e filtros na página PublicStore
- [ ] Corrigir problema identificado


## Fase 27: Remover Criação de Senha pelo Cliente
- [x] Remover tela de criação de senha em NewStore.tsx
- [x] Cliente deve apenas cadastrar loja (sem senha)
- [x] Loja fica pendente aguardando aprovação do admin
- [x] Apenas admin cria senha ao aprovar (já implementado)
- [x] Testar fluxo completo


## Fase 28: Autenticação Admin + Gerenciamento + Limite Afiliados
- [x] Criar tabela admin_users no banco de dados
- [x] Criar sistema de autenticação para painel admin (email + senha)
- [x] Email inicial: Thiagor.oliveira.profissional@gmail.com
- [x] Senha inicial: Thiro15112004!
- [x] Criar página de login do admin (/admin/login)
- [x] Proteger rota /dashboard com autenticação
- [x] Adicionar botão "Gerenciar Administradores" no dashboard
- [x] Modal para adicionar novos administradores (email + senha)
- [x] Lista de administradores com opção de remover
- [x] Implementar limite de 7 afiliados simultâneos no Platinum
- [x] Cobrar R$ 50,00 por afiliado adicional acima de 7
- [x] Mostrar aviso no dashboard da loja quando ultrapassar limite
- [x] Testar fluxo completo


## Fase 29: Corrigir Senha de Loja e Visualização no Dashboard
- [x] Investigar por que senha gerada não funciona no login da loja
- [x] Verificar se senha está sendo hasheada e salva corretamente
- [x] Adicionar campo plainPassword na tabela stores para armazenar senha em texto plano
- [x] Modificar dashboard admin para mostrar senha após aprovação
- [x] Adicionar botão de copiar senha no dashboard
- [x] Testar fluxo: aprovar loja → copiar senha → fazer login com sucesso


## Fase 30: Excluir Loja Rejeitada
- [x] Criar endpoint tRPC para deletar loja do banco
- [x] Remover loja + sessões + produtos + afiliados relacionados
- [x] Adicionar botão "Excluir" nas lojas rejeitadas
- [x] Implementar modal de confirmação antes de excluir
- [x] Testar exclusão completa


## Fase 31: Corrigir Erro NotFoundError no Dashboard
- [ ] Investigar erro NotFoundError relacionado ao React DOM
- [ ] Verificar estados duplicados ou conflitos no Dashboard.tsx
- [ ] Corrigir problema identificado
- [ ] Testar dashboard após correção
