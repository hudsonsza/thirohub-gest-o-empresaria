import { describe, it, expect, beforeAll } from 'vitest';
import * as db from './db';

describe('Database Helpers', () => {
  describe('Utility Functions', () => {
    it('should generate unique access codes', () => {
      const code1 = db.generateAccessCode();
      const code2 = db.generateAccessCode();
      
      expect(code1).toBeTruthy();
      expect(code2).toBeTruthy();
      expect(code1).not.toBe(code2);
      expect(code1.length).toBeGreaterThan(10);
    });

    it('should generate unique order numbers', () => {
      const order1 = db.generateOrderNumber();
      const order2 = db.generateOrderNumber();
      
      expect(order1).toMatch(/^ORD-/);
      expect(order2).toMatch(/^ORD-/);
      expect(order1).not.toBe(order2);
    });

    it('should generate affiliate codes from names', () => {
      const code1 = db.generateAffiliateCode('João Silva');
      const code2 = db.generateAffiliateCode('Maria Santos');
      
      expect(code1).toMatch(/^JOOSIL/);
      expect(code2).toMatch(/^MARIAS/);
      expect(code1.length).toBeGreaterThan(6);
      expect(code2.length).toBeGreaterThan(6);
    });
  });

  describe('Database Connection', () => {
    it('should get database instance', async () => {
      const dbInstance = await db.getDb();
      expect(dbInstance).toBeTruthy();
    });
  });
});

describe('Store Operations', () => {
  it('should have store CRUD functions', () => {
    expect(typeof db.createStore).toBe('function');
    expect(typeof db.getStoreById).toBe('function');
    expect(typeof db.getStoreBySlug).toBe('function');
    expect(typeof db.getStoreByAccessCode).toBe('function');
    expect(typeof db.getStoresByUserId).toBe('function');
    expect(typeof db.updateStore).toBe('function');
    expect(typeof db.deleteStore).toBe('function');
  });
});

describe('Product Operations', () => {
  it('should have product CRUD functions', () => {
    expect(typeof db.createProduct).toBe('function');
    expect(typeof db.getProductById).toBe('function');
    expect(typeof db.getProductsByStoreId).toBe('function');
    expect(typeof db.getActiveProductsByStoreId).toBe('function');
    expect(typeof db.updateProduct).toBe('function');
    expect(typeof db.deleteProduct).toBe('function');
  });
});

describe('Order Operations', () => {
  it('should have order CRUD functions', () => {
    expect(typeof db.createOrder).toBe('function');
    expect(typeof db.getOrderById).toBe('function');
    expect(typeof db.getOrderByNumber).toBe('function');
    expect(typeof db.getOrdersByStoreId).toBe('function');
    expect(typeof db.updateOrder).toBe('function');
  });
});

describe('Coupon Operations', () => {
  it('should have coupon CRUD functions', () => {
    expect(typeof db.createCoupon).toBe('function');
    expect(typeof db.getCouponById).toBe('function');
    expect(typeof db.getCouponByCode).toBe('function');
    expect(typeof db.getCouponsByStoreId).toBe('function');
    expect(typeof db.updateCoupon).toBe('function');
    expect(typeof db.deleteCoupon).toBe('function');
  });
});

describe('Tracking Link Operations', () => {
  it('should have tracking link CRUD functions', () => {
    expect(typeof db.createTrackingLink).toBe('function');
    expect(typeof db.getTrackingLinkById).toBe('function');
    expect(typeof db.getTrackingLinkBySlug).toBe('function');
    expect(typeof db.getTrackingLinksByStoreId).toBe('function');
    expect(typeof db.updateTrackingLink).toBe('function');
    expect(typeof db.incrementTrackingLinkClick).toBe('function');
    expect(typeof db.deleteTrackingLink).toBe('function');
  });
});

describe('Affiliate Operations', () => {
  it('should have affiliate CRUD functions', () => {
    expect(typeof db.createAffiliate).toBe('function');
    expect(typeof db.getAffiliateById).toBe('function');
    expect(typeof db.getAffiliateByCode).toBe('function');
    expect(typeof db.getAffiliatesByStoreId).toBe('function');
    expect(typeof db.updateAffiliate).toBe('function');
    expect(typeof db.deleteAffiliate).toBe('function');
  });
});

describe('Sales Operations', () => {
  it('should have sales functions', () => {
    expect(typeof db.createSale).toBe('function');
    expect(typeof db.getSalesByStoreId).toBe('function');
    expect(typeof db.getSalesByAffiliateId).toBe('function');
  });
});
