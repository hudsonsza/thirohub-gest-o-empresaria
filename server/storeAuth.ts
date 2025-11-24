import bcrypt from 'bcryptjs';
import { eq } from "drizzle-orm";
import { storeSessions, InsertStoreSession } from "../drizzle/schema";
import { getDb } from "./db";
import crypto from 'crypto';

/**
 * Store Authentication Helpers
 * Sistema de autenticação para lojistas (nível 2)
 * Independente do OAuth Manus
 */

// ============ PASSWORD HASHING ============
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// ============ SESSION TOKEN ============
export function generateSessionToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

// ============ STORE SESSION CRUD ============
export async function createStoreSession(session: InsertStoreSession) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.insert(storeSessions).values(session);
}

export async function getStoreSessionByEmail(email: string) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(storeSessions)
    .where(eq(storeSessions.email, email))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getStoreSessionByToken(token: string) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(storeSessions)
    .where(eq(storeSessions.sessionToken, token))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getStoreSessionByStoreId(storeId: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(storeSessions)
    .where(eq(storeSessions.storeId, storeId))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateStoreSession(id: number, data: Partial<InsertStoreSession>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.update(storeSessions).set(data).where(eq(storeSessions.id, id));
}

export async function deleteStoreSession(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.delete(storeSessions).where(eq(storeSessions.id, id));
}

export async function deleteStoreSessionByToken(token: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.delete(storeSessions).where(eq(storeSessions.sessionToken, token));
}

// ============ AUTH OPERATIONS ============

/**
 * Registra um novo lojista
 */
export async function registerStoreOwner(
  storeId: number,
  email: string,
  password: string
): Promise<{ success: boolean; sessionToken?: string; error?: string }> {
  try {
    // Verifica se já existe sessão para esta loja
    const existing = await getStoreSessionByStoreId(storeId);
    if (existing) {
      return { success: false, error: 'Loja já possui credenciais cadastradas' };
    }

    // NOTA: Removida verificação de email duplicado
    // Um mesmo lojista pode ter múltiplas lojas com o mesmo email

    // Hash da senha

    const passwordHash = await hashPassword(password);

    
    // Gera token de sessão
    const sessionToken = generateSessionToken();

    // Cria sessão
    await createStoreSession({
      storeId,
      email,
      passwordHash,
      sessionToken,
      lastLoginAt: new Date(),
    });

    return { success: true, sessionToken };
  } catch (error) {
    console.error('[StoreAuth] Register error:', error);
    return { success: false, error: 'Erro ao registrar lojista' };
  }
}

/**
 * Faz login de um lojista
 */
export async function loginStoreOwner(
  email: string,
  password: string
): Promise<{ success: boolean; sessionToken?: string; storeId?: number; error?: string }> {
  try {
    // Busca sessão por email
    const session = await getStoreSessionByEmail(email);
    if (!session) {
      return { success: false, error: 'Email ou senha incorretos' };
    }

    // Verifica senha
    const isValid = await verifyPassword(password, session.passwordHash);
    if (!isValid) {
      return { success: false, error: 'Email ou senha incorretos' };
    }

    // Gera novo token de sessão
    const sessionToken = generateSessionToken();

    // Atualiza sessão
    await updateStoreSession(session.id, {
      sessionToken,
      lastLoginAt: new Date(),
    });

    return { 
      success: true, 
      sessionToken,
      storeId: session.storeId 
    };
  } catch (error) {
    console.error('[StoreAuth] Login error:', error);
    return { success: false, error: 'Erro ao fazer login' };
  }
}

/**
 * Faz logout de um lojista
 */
export async function logoutStoreOwner(sessionToken: string): Promise<{ success: boolean }> {
  try {
    await deleteStoreSessionByToken(sessionToken);
    return { success: true };
  } catch (error) {
    console.error('[StoreAuth] Logout error:', error);
    return { success: false };
  }
}

/**
 * Valida um token de sessão
 */
export async function validateStoreSession(
  sessionToken: string
): Promise<{ valid: boolean; storeId?: number; email?: string }> {
  try {
    const session = await getStoreSessionByToken(sessionToken);
    if (!session) {
      return { valid: false };
    }

    return {
      valid: true,
      storeId: session.storeId,
      email: session.email,
    };
  } catch (error) {
    console.error('[StoreAuth] Validate error:', error);
    return { valid: false };
  }
}

/**
 * Atualiza senha de um lojista
 */
export async function updateStorePassword(
  email: string,
  oldPassword: string,
  newPassword: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await getStoreSessionByEmail(email);
    if (!session) {
      return { success: false, error: 'Sessão não encontrada' };
    }

    // Verifica senha antiga
    const isValid = await verifyPassword(oldPassword, session.passwordHash);
    if (!isValid) {
      return { success: false, error: 'Senha atual incorreta' };
    }

    // Hash da nova senha
    const passwordHash = await hashPassword(newPassword);

    // Atualiza sessão
    await updateStoreSession(session.id, { passwordHash });

    return { success: true };
  } catch (error) {
    console.error('[StoreAuth] Update password error:', error);
    return { success: false, error: 'Erro ao atualizar senha' };
  }
}
