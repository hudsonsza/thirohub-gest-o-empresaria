import { NOT_ADMIN_ERR_MSG, UNAUTHED_ERR_MSG } from '@shared/const';
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import type { TrpcContext } from "./context";

const t = initTRPC.context<TrpcContext>().create({
  transformer: superjson,
});

export const router = t.router;
export const publicProcedure = t.procedure;

const requireUser = t.middleware(async opts => {
  const { ctx, next } = opts;

  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
  }

  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});

export const protectedProcedure = t.procedure.use(requireUser);

export const adminProcedure = t.procedure.use(
  t.middleware(async opts => {
    const { ctx, next } = opts;

    if (!ctx.user || ctx.user.role !== 'admin') {
      throw new TRPCError({ code: "FORBIDDEN", message: NOT_ADMIN_ERR_MSG });
    }

    return next({
      ctx: {
        ...ctx,
        user: ctx.user,
      },
    });
  }),
);

// Middleware para autenticação de lojistas (email/senha)
const requireStoreOwner = t.middleware(async opts => {
  const { ctx, next } = opts;
  
  // Importar funções de autenticação de lojista
  const { validateStoreSession } = await import('../storeAuth');
  const { getStoreById } = await import('../db');
  const STORE_SESSION_COOKIE = 'store_session';
  
  const sessionToken = ctx.req.cookies?.[STORE_SESSION_COOKIE];
  
  if (!sessionToken) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Sessão de lojista não encontrada" });
  }
  
  const validation = await validateStoreSession(sessionToken);
  
  if (!validation.valid || !validation.storeId) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Sessão inválida" });
  }
  
  const store = await getStoreById(validation.storeId);
  
  if (!store) {
    throw new TRPCError({ code: "NOT_FOUND", message: "Loja não encontrada" });
  }
  
  return next({
    ctx: {
      ...ctx,
      storeOwner: {
        storeId: store.id,
        email: validation.email,
        store,
      },
    },
  });
});

export const storeOwnerProcedure = t.procedure.use(requireStoreOwner);
