import { describe, it, expect } from 'vitest';
import * as storeAuth from './storeAuth';

describe('Store Authentication', () => {
  describe('Password Hashing', () => {
    it('should hash passwords', async () => {
      const password = 'test123456';
      const hash = await storeAuth.hashPassword(password);
      
      expect(hash).toBeTruthy();
      expect(hash).not.toBe(password);
      expect(hash.length).toBeGreaterThan(20);
    });

    it('should verify correct password', async () => {
      const password = 'test123456';
      const hash = await storeAuth.hashPassword(password);
      const isValid = await storeAuth.verifyPassword(password, hash);
      
      expect(isValid).toBe(true);
    });

    it('should reject incorrect password', async () => {
      const password = 'test123456';
      const hash = await storeAuth.hashPassword(password);
      const isValid = await storeAuth.verifyPassword('wrongpassword', hash);
      
      expect(isValid).toBe(false);
    });
  });

  describe('Session Token Generation', () => {
    it('should generate unique session tokens', () => {
      const token1 = storeAuth.generateSessionToken();
      const token2 = storeAuth.generateSessionToken();
      
      expect(token1).toBeTruthy();
      expect(token2).toBeTruthy();
      expect(token1).not.toBe(token2);
      expect(token1.length).toBeGreaterThan(32);
    });
  });

  describe('Store Session Functions', () => {
    it('should have all CRUD functions', () => {
      expect(typeof storeAuth.createStoreSession).toBe('function');
      expect(typeof storeAuth.getStoreSessionByEmail).toBe('function');
      expect(typeof storeAuth.getStoreSessionByToken).toBe('function');
      expect(typeof storeAuth.getStoreSessionByStoreId).toBe('function');
      expect(typeof storeAuth.updateStoreSession).toBe('function');
      expect(typeof storeAuth.deleteStoreSession).toBe('function');
      expect(typeof storeAuth.deleteStoreSessionByToken).toBe('function');
    });
  });

  describe('Auth Operations', () => {
    it('should have register function', () => {
      expect(typeof storeAuth.registerStoreOwner).toBe('function');
    });

    it('should have login function', () => {
      expect(typeof storeAuth.loginStoreOwner).toBe('function');
    });

    it('should have logout function', () => {
      expect(typeof storeAuth.logoutStoreOwner).toBe('function');
    });

    it('should have validate function', () => {
      expect(typeof storeAuth.validateStoreSession).toBe('function');
    });

    it('should have update password function', () => {
      expect(typeof storeAuth.updateStorePassword).toBe('function');
    });
  });
});
