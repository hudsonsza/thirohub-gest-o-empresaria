import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { getUserByOpenId, upsertUser } from "../db";
import { ADMIN_COOKIE_NAME, getAdminByToken } from "../adminAuth";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;

  try {
    const adminSessionToken = opts.req.cookies?.[ADMIN_COOKIE_NAME];

    if (adminSessionToken) {
      const admin = await getAdminByToken(adminSessionToken);

      if (admin) {
        const openId = `admin-${admin.id}`;

        // Garante que existe um registro correspondente na tabela users
        await upsertUser({
          openId,
          name: admin.name ?? null,
          email: admin.email ?? null,
          role: "admin",
        });

        const dbUser = await getUserByOpenId(openId);
        if (dbUser) {
          user = dbUser;
        }
      }
    }
  } catch (error) {
    // Authentication is optional for public procedures.
    user = null;
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}
