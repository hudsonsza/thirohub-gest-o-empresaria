import { z } from "zod";
import { publicProcedure, router } from "./_core/trpc";
import * as storeAuth from "./storeAuth";
import * as db from "./db";
import { TRPCError } from "@trpc/server";

/**
 * Store Authentication Router
 * Rotas de autenticação para lojistas (nível 2)
 */

const STORE_SESSION_COOKIE = "store_session";

export const storeAuthRouter = router({
  // Registrar novo lojista (após criar loja)
  register: publicProcedure
    .input(z.object({
      storeId: z.number(),
      email: z.string().email(),
      password: z.string().min(6),
    }))
    .mutation(async ({ input, ctx }) => {
      // Verifica se a loja existe
      const store = await db.getStoreById(input.storeId);
      if (!store) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Loja não encontrada' });
      }

      // Registra lojista
      const result = await storeAuth.registerStoreOwner(
        input.storeId,
        input.email,
        input.password
      );

      if (!result.success) {
        throw new TRPCError({ 
          code: 'BAD_REQUEST', 
          message: result.error || 'Erro ao registrar' 
        });
      }

      // Define cookie de sessão
      const cookieOptions = {
        httpOnly: true,
        secure: true, // Sempre true pois o ambiente usa HTTPS
        sameSite: 'lax' as const,
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 dias
        path: '/',
      };
      ctx.res.cookie(STORE_SESSION_COOKIE, result.sessionToken, cookieOptions);

      return { 
        success: true,
        storeId: input.storeId,
      };
    }),

  // Login de lojista
  login: publicProcedure
    .input(z.object({
      email: z.string().email(),
      password: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      const result = await storeAuth.loginStoreOwner(input.email, input.password);

      if (!result.success) {
        throw new TRPCError({ 
          code: 'UNAUTHORIZED', 
          message: result.error || 'Credenciais inválidas' 
        });
      }

      // Verificar se a loja está aprovada
      const store = await db.getStoreById(result.storeId!);
      if (!store) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Loja não encontrada' });
      }
      if (store.status === 'pending') {
        throw new TRPCError({ 
          code: 'FORBIDDEN', 
          message: 'Sua loja ainda está aguardando aprovação do administrador' 
        });
      }
      if (store.status === 'rejected') {
        throw new TRPCError({ 
          code: 'FORBIDDEN', 
          message: `Sua loja foi rejeitada. Motivo: ${store.rejectionReason || 'Não especificado'}` 
        });
      }

      // Define cookie de sessão
      const cookieOptions = {
        httpOnly: true,
        secure: true, // Sempre true pois o ambiente usa HTTPS
        sameSite: 'lax' as const,
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 dias
        path: '/',
      };
      ctx.res.cookie(STORE_SESSION_COOKIE, result.sessionToken, cookieOptions);

      return { 
        success: true,
        storeId: result.storeId,
      };
    }),

  // Logout de lojista
  logout: publicProcedure
    .mutation(async ({ ctx }) => {
      const sessionToken = ctx.req.cookies[STORE_SESSION_COOKIE];
      
      if (sessionToken) {
        await storeAuth.logoutStoreOwner(sessionToken);
      }

      // Remove cookie
      ctx.res.clearCookie(STORE_SESSION_COOKIE, { path: '/' });

      return { success: true };
    }),

  // Verifica sessão atual
  me: publicProcedure
    .query(async ({ ctx }) => {
      const sessionToken = ctx.req.cookies[STORE_SESSION_COOKIE];
      
      if (!sessionToken) {
        return null;
      }

      const validation = await storeAuth.validateStoreSession(sessionToken);
      
      if (!validation.valid || !validation.storeId) {
        return null;
      }

      // Busca dados da loja
      const store = await db.getStoreById(validation.storeId);
      
      if (!store) {
        return null;
      }

      return {
        storeId: store.id,
        storeName: store.name,
        storeSlug: store.slug,
        email: validation.email,
        plan: store.plan,
        logoUrl: store.logoUrl,
        status: store.status,
        // Dados completos da loja para uso no frontend
        store: {
          id: store.id,
          name: store.name,
          slug: store.slug,
          plan: store.plan,
          logoUrl: store.logoUrl,
          status: store.status,
        },
      };
    }),

  // Atualizar senha
  updatePassword: publicProcedure
    .input(z.object({
      oldPassword: z.string(),
      newPassword: z.string().min(6),
    }))
    .mutation(async ({ input, ctx }) => {
      const sessionToken = ctx.req.cookies[STORE_SESSION_COOKIE];
      
      if (!sessionToken) {
        throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Não autenticado' });
      }

      const validation = await storeAuth.validateStoreSession(sessionToken);
      
      if (!validation.valid || !validation.email) {
        throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Sessão inválida' });
      }

      const result = await storeAuth.updateStorePassword(
        validation.email,
        input.oldPassword,
        input.newPassword
      );

      if (!result.success) {
        throw new TRPCError({ 
          code: 'BAD_REQUEST', 
          message: result.error || 'Erro ao atualizar senha' 
        });
      }

      return { success: true };
    }),
});
