import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { storeAuthRouter } from "./storeAuthRouter";
import { publicProcedure, router, protectedProcedure, storeOwnerProcedure } from "./_core/trpc";
import * as db from "./db";
import { TRPCError } from "@trpc/server";
import * as adminAuth from "./adminAuth";

export const appRouter = router({
  system: systemRouter,
  
  // Autenticação de lojistas (nível 2)
  storeAuth: storeAuthRouter,
  
  // Autenticação de administradores do painel principal
  adminAuth: router({
    login: publicProcedure
      .input(z.object({
        email: z.string().email(),
        password: z.string().min(6),
      }))
      .mutation(async ({ input, ctx }) => {
        const admin = await adminAuth.authenticateAdmin(input.email, input.password);
        
        if (!admin) {
          throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Email ou senha inválidos' });
        }
        
        // Salvar token no cookie
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(adminAuth.ADMIN_COOKIE_NAME, admin.sessionToken, {
          ...cookieOptions,
          maxAge: 30 * 24 * 60 * 60 * 1000, // 30 dias
        });
        
        return {
          id: admin.id,
          email: admin.email,
          name: admin.name,
        };
      }),
    
    me: publicProcedure.query(async ({ ctx }) => {
      const token = ctx.req.cookies[adminAuth.ADMIN_COOKIE_NAME];
      if (!token) return null;
      
      return await adminAuth.getAdminByToken(token);
    }),
    
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(adminAuth.ADMIN_COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true };
    }),
    
    listAdmins: publicProcedure.query(async ({ ctx }) => {
      // Verificar se está autenticado como admin
      const token = ctx.req.cookies[adminAuth.ADMIN_COOKIE_NAME];
      if (!token) {
        throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Acesso negado' });
      }
      
      const admin = await adminAuth.getAdminByToken(token);
      if (!admin) {
        throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Acesso negado' });
      }
      
      return await adminAuth.listAdmins();
    }),
    
    createAdmin: publicProcedure
      .input(z.object({
        email: z.string().email(),
        password: z.string().min(6),
        name: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        // Verificar se está autenticado como admin
        const token = ctx.req.cookies[adminAuth.ADMIN_COOKIE_NAME];
        if (!token) {
          throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Acesso negado' });
        }
        
        const admin = await adminAuth.getAdminByToken(token);
        if (!admin) {
          throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Acesso negado' });
        }
        
        await adminAuth.createAdmin(input.email, input.password, input.name);
        return { success: true };
      }),
    
    deleteAdmin: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        // Verificar se está autenticado como admin
        const token = ctx.req.cookies[adminAuth.ADMIN_COOKIE_NAME];
        if (!token) {
          throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Acesso negado' });
        }
        
        const admin = await adminAuth.getAdminByToken(token);
        if (!admin) {
          throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Acesso negado' });
        }
        
        // Não permitir deletar a si mesmo
        if (admin.id === input.id) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'Você não pode deletar sua própria conta' });
        }
        
        await adminAuth.deleteAdmin(input.id);
        return { success: true };
      }),
  }),
  
  // Autenticação de admin (nível 1 - OAuth Manus)
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      // Limpa cookie de sessão legado (OAuth) e cookie de admin baseado em banco
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      ctx.res.clearCookie(adminAuth.ADMIN_COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // ============ STORES ============
  stores: router({
    // Registro público de lojas (sem autenticação)
    register: publicProcedure
      .input(z.object({
        name: z.string().min(1),
        ownerEmail: z.string().email(),
        ownerName: z.string().min(1),
        ownerWhatsapp: z.string().min(1),
        whatsapp: z.string().min(1),
        plan: z.enum(["basic", "pro", "platinum"]).default("basic"),
      }))
      .mutation(async ({ input }) => {
        // Gerar slug a partir do nome
        const baseSlug = input.name
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '');
        
        // Verificar se slug já existe e adicionar número se necessário
        let slug = baseSlug;
        let counter = 1;
        while (await db.getStoreBySlug(slug)) {
          slug = `${baseSlug}-${counter}`;
          counter++;
        }

        // Gerar access code único
        const accessCode = db.generateAccessCode();

        // Criar loja com status pending (aguardando aprovação)
        // userId = 0 temporariamente (será atualizado na aprovação)
        await db.createStore({
          userId: 0, // Temporário
          name: input.name,
          slug,
          ownerEmail: input.ownerEmail,
          ownerName: input.ownerName,
          ownerWhatsapp: input.ownerWhatsapp,
          whatsapp: input.whatsapp,
          plan: input.plan,
          primaryColor: '#0F766E',
          secondaryColor: '#F59E0B',
          accessCode,
          status: 'pending',
        });

        return { success: true };
      }),

    create: protectedProcedure
      .input(z.object({
        name: z.string().min(1),
        slug: z.string().min(1),
        ownerEmail: z.string().email(),
        ownerName: z.string().min(1),
        ownerWhatsapp: z.string().min(1),
        cpfCnpj: z.string().optional(),
        category: z.string().optional(),
        plan: z.enum(["basic", "pro", "platinum"]).default("basic"),
        logoUrl: z.string().optional(),
        primaryColor: z.string().default("#0F766E"),
        secondaryColor: z.string().default("#F59E0B"),
        whatsapp: z.string().min(1),
      }))
      .mutation(async ({ ctx, input }) => {
        // Check if slug already exists
        const existing = await db.getStoreBySlug(input.slug);
        if (existing) {
          throw new TRPCError({ code: 'CONFLICT', message: 'Slug já está em uso' });
        }

        const accessCode = db.generateAccessCode();
        const trialEndsAt = new Date();
        trialEndsAt.setDate(trialEndsAt.getDate() + 7); // 7 days trial

        await db.createStore({
          ...input,
          userId: ctx.user.id,
          accessCode,
          trialEndsAt,
          status: 'pending', // Aguardando aprovação do admin
        });

        return { success: true, accessCode };
      }),

    list: protectedProcedure.query(async ({ ctx }) => {
      return await db.getStoresByUserId(ctx.user.id);
    }),

    // Listar TODAS as lojas (apenas para admin)
    listAll: protectedProcedure.query(async () => {
      return await db.getAllStores();
    }),

    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        const store = await db.getStoreById(input.id);
        if (!store) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Loja não encontrada' });
        }
        if (store.userId !== ctx.user.id) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Acesso negado' });
        }
        return store;
      }),

    getBySlug: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(async ({ input }) => {
        const store = await db.getStoreBySlug(input.slug);
        if (!store || store.status !== 'approved') {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Loja não encontrada' });
        }
        return store;
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        logoUrl: z.string().optional(),
        primaryColor: z.string().optional(),
        secondaryColor: z.string().optional(),
        whatsapp: z.string().optional(),
        category: z.string().optional(),
        status: z.enum(["pending", "approved", "rejected"]).optional(),
        rejectionReason: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { id, ...data } = input;
        const store = await db.getStoreById(id);
        if (!store || store.userId !== ctx.user.id) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Acesso negado' });
        }
        await db.updateStore(id, data);
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const store = await db.getStoreById(input.id);
        if (!store || store.userId !== ctx.user.id) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Acesso negado' });
        }
        await db.deleteStore(input.id);
        return { success: true };
      }),

    // Admin: Aprovar loja e definir senha
    approve: protectedProcedure
      .input(z.object({ 
        id: z.number(),
        password: z.string().min(6),
      }))
      .mutation(async ({ ctx, input }) => {
        const store = await db.getStoreById(input.id);
        if (!store) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Loja não encontrada' });
        }

        // Atualizar status da loja e salvar senha em texto plano
        await db.updateStore(input.id, { 
          status: 'approved',
          rejectionReason: null,
          plainPassword: input.password // Salvar senha para referência administrativa
        });

        // Criar credenciais de lojista
        const { registerStoreOwner } = await import('./storeAuth');
        const result = await registerStoreOwner(
          store.id,
          store.ownerEmail,
          input.password
        );
        
        if (!result.success) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: result.error || 'Erro ao criar credenciais' });
        }

        return { success: true };
      }),

    // Admin: Rejeitar loja
    reject: protectedProcedure
      .input(z.object({ 
        id: z.number(),
        reason: z.string()
      }))
      .mutation(async ({ ctx, input }) => {
        await db.updateStore(input.id, { 
          status: 'rejected',
          rejectionReason: input.reason
        });
        return { success: true };
      }),

    // Admin: Deletar loja rejeitada
    deleteRejected: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        // Verificar se loja está rejeitada
        const store = await db.getStoreById(input.id);
        if (!store) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Loja não encontrada' });
        }
        if (store.status !== 'rejected') {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Apenas lojas rejeitadas podem ser excluídas' });
        }

        // Deletar loja (cascade vai deletar produtos, afiliados, etc)
        await db.deleteStore(input.id);
        return { success: true };
      }),
  }),

  // ============ PRODUCTS ============
  products: router({
    create: storeOwnerProcedure
      .input(z.object({
        storeId: z.number(),
        name: z.string().min(1),
        description: z.string().optional(),
        price: z.number().min(0),
        category: z.string().optional(),
        images: z.array(z.string()).optional(),
        videoUrl: z.string().optional(),
        stock: z.number().default(0),
        featured: z.boolean().default(false),
        availableForAffiliates: z.boolean().default(false),
      }))
      .mutation(async ({ ctx, input }) => {
        // Verificar se o lojista está tentando criar produto na própria loja
        if (input.storeId !== ctx.storeOwner.storeId) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Acesso negado' });
        }
        await db.createProduct({ 
          ...input, 
          status: 'active',
          description: input.description || null,
          category: input.category || null,
          images: input.images || [],
          videoUrl: input.videoUrl && input.videoUrl.trim() !== '' ? input.videoUrl : null,
        });
        return { success: true };
      }),

    list: storeOwnerProcedure
      .input(z.object({ storeId: z.number() }))
      .query(async ({ ctx, input }) => {
        if (input.storeId !== ctx.storeOwner.storeId) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Acesso negado' });
        }
        return await db.getProductsByStoreId(input.storeId);
      }),

    listPublic: publicProcedure
      .input(z.object({ storeId: z.number() }))
      .query(async ({ input }) => {
        const products = await db.getProductsByStoreId(input.storeId);
        // Retornar apenas produtos com status 'active'
        return products.filter(p => p.status === 'active');
      }),

    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        const product = await db.getProductById(input.id);
        if (!product) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Produto não encontrado' });
        }
        const store = await db.getStoreById(product.storeId);
        if (!store || store.userId !== ctx.user.id) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Acesso negado' });
        }
        return product;
      }),

    update: storeOwnerProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        description: z.string().optional(),
        price: z.number().optional(),
        category: z.string().optional(),
        images: z.array(z.string()).optional(),
        videoUrl: z.string().optional(),
        stock: z.number().optional(),
        status: z.enum(["active", "inactive"]).optional(),
        featured: z.boolean().optional(),
        availableForAffiliates: z.boolean().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { id, ...data } = input;
        const product = await db.getProductById(id);
        if (!product) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Produto não encontrado' });
        }
        if (product.storeId !== ctx.storeOwner.storeId) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Acesso negado' });
        }
        await db.updateProduct(id, data);
        return { success: true };
      }),

    delete: storeOwnerProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const product = await db.getProductById(input.id);
        if (!product) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Produto não encontrado' });
        }
        if (product.storeId !== ctx.storeOwner.storeId) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Acesso negado' });
        }
        await db.deleteProduct(input.id);
        return { success: true };
      }),
  }),

  // ============ ORDERS ============
  orders: router({
    create: publicProcedure
      .input(z.object({
        storeId: z.number(),
        customerName: z.string().min(1),
        customerEmail: z.string().email().optional(),
        customerPhone: z.string().min(1),
        customerAddress: z.object({
          street: z.string(),
          number: z.string(),
          complement: z.string().optional(),
          neighborhood: z.string(),
          city: z.string(),
          state: z.string(),
          zipCode: z.string(),
        }).optional(),
        items: z.array(z.object({
          productId: z.number(),
          productName: z.string(),
          quantity: z.number(),
          price: z.number(),
          total: z.number(),
        })),
        subtotal: z.number(),
        discount: z.number().default(0),
        shipping: z.number().default(0),
        total: z.number(),
        paymentMethod: z.string().optional(),
        shippingMethod: z.string().optional(),
        notes: z.string().optional(),
        couponCode: z.string().optional(),
        affiliateCode: z.string().optional(),
        trackingLink: z.string().optional(),
        source: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const orderNumber = db.generateOrderNumber();
        
        await db.createOrder({
          ...input,
          orderNumber,
          status: 'new',
        });

        // Register sale if affiliate code is present
        if (input.affiliateCode) {
          const affiliate = await db.getAffiliateByCode(input.affiliateCode);
          if (affiliate && affiliate.status === 'active') {
            const commissionValue = Math.floor(input.total * (affiliate.commissionPercentage / 100));
            
            // Find the order we just created
            const order = await db.getOrderByNumber(orderNumber);
            if (order) {
              await db.createSale({
                storeId: input.storeId,
                orderId: order.id,
                affiliateCode: input.affiliateCode,
                affiliateId: affiliate.id,
                trackingLink: input.trackingLink || null,
                saleValue: input.total,
                commissionPercentage: affiliate.commissionPercentage,
                commissionValue,
                customerEmail: input.customerEmail || null,
              });

              // Update affiliate stats
              await db.updateAffiliate(affiliate.id, {
                totalSales: (affiliate.totalSales || 0) + 1,
                totalCommission: (affiliate.totalCommission || 0) + commissionValue,
              });
            }
          }
        }

        return { success: true, orderNumber };
      }),

    list: storeOwnerProcedure
      .input(z.object({ storeId: z.number() }))
      .query(async ({ ctx, input }) => {
        if (input.storeId !== ctx.storeOwner.storeId) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Acesso negado' });
        }
        return await db.getOrdersByStoreId(input.storeId);
      }),

    getById: storeOwnerProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        const order = await db.getOrderById(input.id);
        if (!order) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Pedido não encontrado' });
        }
        if (order.storeId !== ctx.storeOwner.storeId) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Acesso negado' });
        }
        return order;
      }),

    updateStatus: storeOwnerProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(["new", "confirmed", "shipped", "delivered", "cancelled"]),
      }))
      .mutation(async ({ ctx, input }) => {
        const order = await db.getOrderById(input.id);
        if (!order) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Pedido não encontrado' });
        }
        if (order.storeId !== ctx.storeOwner.storeId) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Acesso negado' });
        }
        await db.updateOrder(input.id, { status: input.status });
        return { success: true };
      }),
  }),

  // ============ COUPONS ============
  coupons: router({
    create: protectedProcedure
      .input(z.object({
        storeId: z.number(),
        code: z.string().min(1),
        type: z.enum(["percentage", "fixed"]),
        value: z.number().min(0),
        minPurchase: z.number().default(0),
        maxUses: z.number().default(0),
        validFrom: z.date(),
        validUntil: z.date(),
      }))
      .mutation(async ({ ctx, input }) => {
        const store = await db.getStoreById(input.storeId);
        if (!store || store.userId !== ctx.user.id) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Acesso negado' });
        }
        if (store.plan === 'basic') {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Cupons disponíveis apenas nos planos Pro e Platinum' });
        }
        await db.createCoupon({ ...input, currentUses: 0, status: 'active' });
        return { success: true };
      }),

    list: protectedProcedure
      .input(z.object({ storeId: z.number() }))
      .query(async ({ ctx, input }) => {
        const store = await db.getStoreById(input.storeId);
        if (!store || store.userId !== ctx.user.id) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Acesso negado' });
        }
        return await db.getCouponsByStoreId(input.storeId);
      }),

    validate: publicProcedure
      .input(z.object({
        storeId: z.number(),
        code: z.string(),
        purchaseAmount: z.number(),
      }))
      .query(async ({ input }) => {
        const coupon = await db.getCouponByCode(input.storeId, input.code);
        
        if (!coupon) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Cupom não encontrado' });
        }

        if (coupon.status !== 'active') {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'Cupom inativo' });
        }

        const now = new Date();
        if (now < coupon.validFrom || now > coupon.validUntil) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'Cupom fora do período de validade' });
        }

        if (coupon.maxUses > 0 && coupon.currentUses >= coupon.maxUses) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'Cupom esgotado' });
        }

        if (input.purchaseAmount < coupon.minPurchase) {
          throw new TRPCError({ 
            code: 'BAD_REQUEST', 
            message: `Compra mínima de R$ ${(coupon.minPurchase / 100).toFixed(2)} necessária` 
          });
        }

        let discountAmount = 0;
        if (coupon.type === 'percentage') {
          discountAmount = Math.floor(input.purchaseAmount * (coupon.value / 100));
        } else {
          discountAmount = coupon.value;
        }

        return {
          valid: true,
          coupon,
          discountAmount,
        };
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        code: z.string().optional(),
        type: z.enum(["percentage", "fixed"]).optional(),
        value: z.number().optional(),
        minPurchase: z.number().optional(),
        maxUses: z.number().optional(),
        validFrom: z.date().optional(),
        validUntil: z.date().optional(),
        status: z.enum(["active", "inactive"]).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { id, ...data } = input;
        const coupon = await db.getCouponById(id);
        if (!coupon) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Cupom não encontrado' });
        }
        const store = await db.getStoreById(coupon.storeId);
        if (!store || store.userId !== ctx.user.id) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Acesso negado' });
        }
        await db.updateCoupon(id, data);
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const coupon = await db.getCouponById(input.id);
        if (!coupon) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Cupom não encontrado' });
        }
        const store = await db.getStoreById(coupon.storeId);
        if (!store || store.userId !== ctx.user.id) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Acesso negado' });
        }
        await db.deleteCoupon(input.id);
        return { success: true };
      }),
  }),

  // ============ TRACKING LINKS ============
  trackingLinks: router({
    create: protectedProcedure
      .input(z.object({
        storeId: z.number(),
        name: z.string().min(1),
        slug: z.string().min(1),
        targetUrl: z.string().url(),
        productId: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const store = await db.getStoreById(input.storeId);
        if (!store || store.userId !== ctx.user.id) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Acesso negado' });
        }
        if (store.plan === 'basic') {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Links rastreáveis disponíveis apenas nos planos Pro e Platinum' });
        }
        await db.createTrackingLink({ 
          ...input, 
          clicks: 0, 
          conversions: 0, 
          status: 'active',
          productId: input.productId || null 
        });
        return { success: true };
      }),

    list: protectedProcedure
      .input(z.object({ storeId: z.number() }))
      .query(async ({ ctx, input }) => {
        const store = await db.getStoreById(input.storeId);
        if (!store || store.userId !== ctx.user.id) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Acesso negado' });
        }
        return await db.getTrackingLinksByStoreId(input.storeId);
      }),

    click: publicProcedure
      .input(z.object({
        storeId: z.number(),
        slug: z.string(),
      }))
      .mutation(async ({ input }) => {
        const link = await db.getTrackingLinkBySlug(input.storeId, input.slug);
        if (!link || link.status !== 'active') {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Link não encontrado' });
        }
        await db.incrementTrackingLinkClick(link.id);
        return { targetUrl: link.targetUrl };
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        targetUrl: z.string().optional(),
        status: z.enum(["active", "inactive"]).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { id, ...data } = input;
        const link = await db.getTrackingLinkById(id);
        if (!link) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Link não encontrado' });
        }
        const store = await db.getStoreById(link.storeId);
        if (!store || store.userId !== ctx.user.id) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Acesso negado' });
        }
        await db.updateTrackingLink(id, data);
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const link = await db.getTrackingLinkById(input.id);
        if (!link) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Link não encontrado' });
        }
        const store = await db.getStoreById(link.storeId);
        if (!store || store.userId !== ctx.user.id) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Acesso negado' });
        }
        await db.deleteTrackingLink(input.id);
        return { success: true };
      }),
  }),

  // ============ AFFILIATES ============
  affiliates: router({
    create: storeOwnerProcedure
      .input(z.object({
        storeId: z.number(),
        name: z.string().min(1),
        email: z.string().email(),
        whatsapp: z.string().optional(),
        commissionPercentage: z.number().min(0).max(100),
      }))
      .mutation(async ({ ctx, input }) => {
        if (input.storeId !== ctx.storeOwner.storeId) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Acesso negado' });
        }
        if (ctx.storeOwner.store.plan !== 'platinum') {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Afiliados disponíveis apenas no plano Platinum' });
        }
        
        const affiliateCode = db.generateAffiliateCode(input.name);
        
        await db.createAffiliate({
          ...input,
          whatsapp: input.whatsapp || null,
          affiliateCode,
          totalClicks: 0,
          totalSales: 0,
          totalCommission: 0,
          status: 'active',
        });
        
        return { success: true, affiliateCode };
      }),

    list: storeOwnerProcedure
      .input(z.object({ storeId: z.number() }))
      .query(async ({ ctx, input }) => {
        if (input.storeId !== ctx.storeOwner.storeId) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Acesso negado' });
        }
        return await db.getAffiliatesByStoreId(input.storeId);
      }),

    getByCode: publicProcedure
      .input(z.object({ code: z.string() }))
      .query(async ({ input }) => {
        const affiliate = await db.getAffiliateByCode(input.code);
        if (!affiliate || affiliate.status !== 'active') {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Afiliado não encontrado' });
        }
        return affiliate;
      }),

    trackClick: publicProcedure
      .input(z.object({ code: z.string() }))
      .mutation(async ({ input }) => {
        const affiliate = await db.getAffiliateByCode(input.code);
        if (!affiliate || affiliate.status !== 'active') {
          return { success: false };
        }
        // Incrementar contador de cliques
        await db.updateAffiliate(affiliate.id, {
          totalClicks: affiliate.totalClicks + 1,
        });
        return { success: true };
      }),

    toggleStatus: storeOwnerProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const affiliate = await db.getAffiliateById(input.id);
        if (!affiliate) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Afiliado não encontrado' });
        }
        if (affiliate.storeId !== ctx.storeOwner.storeId) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Acesso negado' });
        }
        const newStatus = affiliate.status === 'active' ? 'inactive' : 'active';
        await db.updateAffiliate(input.id, { status: newStatus });
        return { success: true };
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        email: z.string().optional(),
        whatsapp: z.string().optional(),
        commissionPercentage: z.number().optional(),
        status: z.enum(["active", "inactive", "pending"]).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { id, ...data } = input;
        const affiliate = await db.getAffiliateById(id);
        if (!affiliate) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Afiliado não encontrado' });
        }
        const store = await db.getStoreById(affiliate.storeId);
        if (!store || store.userId !== ctx.user.id) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Acesso negado' });
        }
        await db.updateAffiliate(id, data);
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const affiliate = await db.getAffiliateById(input.id);
        if (!affiliate) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Afiliado não encontrado' });
        }
        const store = await db.getStoreById(affiliate.storeId);
        if (!store || store.userId !== ctx.user.id) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Acesso negado' });
        }
        await db.deleteAffiliate(input.id);
        return { success: true };
      }),
  }),

  // ============ SALES ============
  sales: router({
    list: protectedProcedure
      .input(z.object({ storeId: z.number() }))
      .query(async ({ ctx, input }) => {
        const store = await db.getStoreById(input.storeId);
        if (!store || store.userId !== ctx.user.id) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Acesso negado' });
        }
        return await db.getSalesByStoreId(input.storeId);
      }),

    listByAffiliate: protectedProcedure
      .input(z.object({ affiliateId: z.number() }))
      .query(async ({ ctx, input }) => {
        const affiliate = await db.getAffiliateById(input.affiliateId);
        if (!affiliate) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Afiliado não encontrado' });
        }
        const store = await db.getStoreById(affiliate.storeId);
        if (!store || store.userId !== ctx.user.id) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Acesso negado' });
        }
        return await db.getSalesByAffiliateId(input.affiliateId);
      }),
  }),
});

export type AppRouter = typeof appRouter;
