export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

/**
 * Application constants
 * These values are used throughout the application for branding and configuration
 */

// Branding
export const APP_TITLE = import.meta.env.VITE_APP_TITLE || "Thiro Vendas";
export const APP_LOGO = "/logo.svg"; // Update this path to your logo file

// Owner
export const OWNER_OPEN_ID = import.meta.env.VITE_OWNER_OPEN_ID || "";

// Colors - Thiro Vendas Brand
export const BRAND_COLORS = {
  primary: "#0F766E", // Teal/Petrol Blue
  secondary: "#F59E0B", // Gold
  primaryHover: "#0D5F58",
  secondaryHover: "#D97706",
};

// OAuth - Generate login URL at runtime so redirect URI reflects the current origin
export const getLoginUrl = () => {
  const oauthPortalUrl = import.meta.env.VITE_OAUTH_PORTAL_URL;
  const appId = import.meta.env.VITE_APP_ID;
  const redirectUri = `${window.location.origin}/api/oauth/callback`;
  const state = btoa(redirectUri);

  const url = new URL(`${oauthPortalUrl}/app-auth`);
  url.searchParams.set("appId", appId);
  url.searchParams.set("redirectUri", redirectUri);
  url.searchParams.set("state", state);
  url.searchParams.set("type", "signIn");

  return url.toString();
};

// Plans
export const PLANS = {
  basic: {
    name: "Basic",
    price: 109.90,
    features: [
      "Até 50 produtos",
      "Loja virtual personalizada",
      "Pedidos via WhatsApp",
      "Painel administrativo",
      "Suporte por email",
    ],
  },
  pro: {
    name: "Pro",
    price: 199.90,
    features: [
      "Produtos ilimitados",
      "Cupons de desconto",
      "Links rastreáveis",
      "Vídeos nos produtos",
      "Relatórios avançados",
      "Suporte prioritário",
    ],
  },
  platinum: {
    name: "Platinum",
    price: 349.90,
    features: [
      "Tudo do Pro +",
      "Sistema de afiliados",
      "Comissões automáticas",
      "API completa",
      "Domínio personalizado",
      "Suporte 24/7",
    ],
  },
};

// Store status
export const STORE_STATUS = {
  active: "Ativa",
  inactive: "Inativa",
  pending: "Pendente",
};

// Order status
export const ORDER_STATUS = {
  new: "Novo",
  confirmed: "Confirmado",
  shipped: "Enviado",
  delivered: "Entregue",
  cancelled: "Cancelado",
};

// Product status
export const PRODUCT_STATUS = {
  active: "Ativo",
  inactive: "Inativo",
};

// Coupon types
export const COUPON_TYPES = {
  percentage: "Percentual",
  fixed: "Valor Fixo",
};

// Affiliate status
export const AFFILIATE_STATUS = {
  active: "Ativo",
  inactive: "Inativo",
  pending: "Pendente",
};

// Utility functions
export function formatCurrency(cents: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(cents / 100);
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(d);
}

export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}

export function slugify(text: string): string {
  return text
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-');
}

export function generateWhatsAppLink(phone: string, message: string): string {
  const cleanPhone = phone.replace(/\D/g, '');
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
}
