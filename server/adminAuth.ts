import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { adminUsers, type InsertAdminUser } from '../drizzle/schema';
import { getDb } from './db';

const ADMIN_COOKIE_NAME = 'admin_session';

/**
 * Hash de senha usando bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

/**
 * Verifica se a senha corresponde ao hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Gera token de sessão aleatório
 */
export function generateSessionToken(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

/**
 * Cria um novo administrador
 */
export async function createAdmin(email: string, password: string, name?: string) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  const passwordHash = await hashPassword(password);
  
  const admin: InsertAdminUser = {
    email,
    passwordHash,
    name,
  };

  const result = await db.insert(adminUsers).values(admin);
  return result;
}

/**
 * Autentica admin e retorna dados do usuário
 */
export async function authenticateAdmin(email: string, password: string) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  const result = await db.select().from(adminUsers).where(eq(adminUsers.email, email)).limit(1);
  
  if (result.length === 0) {
    return null;
  }

  const admin = result[0];
  const isValid = await verifyPassword(password, admin.passwordHash);
  
  if (!isValid) {
    return null;
  }

  // Gera novo token de sessão
  const sessionToken = generateSessionToken();
  
  await db.update(adminUsers)
    .set({ 
      sessionToken,
      lastLoginAt: new Date()
    })
    .where(eq(adminUsers.id, admin.id));

  return {
    id: admin.id,
    email: admin.email,
    name: admin.name,
    sessionToken,
  };
}

/**
 * Verifica se o token de sessão é válido e retorna dados do admin
 */
export async function getAdminByToken(sessionToken: string) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.select()
    .from(adminUsers)
    .where(eq(adminUsers.sessionToken, sessionToken))
    .limit(1);

  if (result.length === 0) {
    return null;
  }

  const admin = result[0];
  return {
    id: admin.id,
    email: admin.email,
    name: admin.name,
  };
}

/**
 * Lista todos os administradores
 */
export async function listAdmins() {
  const db = await getDb();
  if (!db) return [];

  const result = await db.select({
    id: adminUsers.id,
    email: adminUsers.email,
    name: adminUsers.name,
    createdAt: adminUsers.createdAt,
    lastLoginAt: adminUsers.lastLoginAt,
  }).from(adminUsers);

  return result;
}

/**
 * Remove um administrador
 */
export async function deleteAdmin(id: number) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  await db.delete(adminUsers).where(eq(adminUsers.id, id));
}

export { ADMIN_COOKIE_NAME };
