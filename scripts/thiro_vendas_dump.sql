-- ============================================================================
-- THIRO VENDAS - DUMP COMPLETO DO BANCO DE DADOS
-- ============================================================================
-- Banco de Dados: GHR3zrLANgGxQTdejEBqxn
-- Tipo: MySQL 8.0 / TiDB
-- Data: 2024-12-03
-- ============================================================================

-- ============================================================================
-- 1. TABELA: users
-- Descrição: Usuários do sistema (OAuth Manus)
-- ============================================================================
CREATE TABLE IF NOT EXISTS `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `openId` varchar(64) NOT NULL UNIQUE,
  `name` text,
  `email` varchar(320),
  `loginMethod` varchar(64),
  `role` enum('user','admin') NOT NULL DEFAULT 'user',
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `lastSignedIn` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `role` (`role`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================================
-- 2. TABELA: stores
-- Descrição: Lojas virtuais criadas pelos clientes
-- ============================================================================
CREATE TABLE IF NOT EXISTS `stores` (
  `id` int NOT NULL AUTO_INCREMENT,
  `userId` int NOT NULL,
  `name` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL UNIQUE,
  `ownerEmail` varchar(320) NOT NULL,
  `ownerName` varchar(255) NOT NULL,
  `ownerWhatsapp` varchar(20) NOT NULL,
  `cpfCnpj` varchar(20),
  `category` varchar(100),
  `plan` enum('basic','pro','platinum') NOT NULL DEFAULT 'basic',
  `logoUrl` text,
  `primaryColor` varchar(7) DEFAULT '#0F766E',
  `secondaryColor` varchar(7) DEFAULT '#F59E0B',
  `whatsapp` varchar(20) NOT NULL,
  `status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  `rejectionReason` text,
  `trialEndsAt` timestamp NULL,
  `accessCode` varchar(32) NOT NULL UNIQUE,
  `plainPassword` text,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `userId` (`userId`),
  KEY `status` (`status`),
  KEY `plan` (`plan`),
  FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 3. TABELA: products
-- Descrição: Produtos das lojas
-- ============================================================================
CREATE TABLE IF NOT EXISTS `products` (
  `id` int NOT NULL AUTO_INCREMENT,
  `storeId` int NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text,
  `price` int NOT NULL COMMENT 'Preço em centavos',
  `category` varchar(100),
  `images` json,
  `videoUrl` text,
  `stock` int NOT NULL DEFAULT 0,
  `status` enum('active','inactive') NOT NULL DEFAULT 'active',
  `featured` boolean NOT NULL DEFAULT false,
  `availableForAffiliates` boolean NOT NULL DEFAULT false,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `storeId` (`storeId`),
  KEY `status` (`status`),
  KEY `featured` (`featured`),
  FOREIGN KEY (`storeId`) REFERENCES `stores` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 4. TABELA: orders
-- Descrição: Pedidos dos clientes
-- ============================================================================
CREATE TABLE IF NOT EXISTS `orders` (
  `id` int NOT NULL AUTO_INCREMENT,
  `storeId` int NOT NULL,
  `orderNumber` varchar(50) NOT NULL UNIQUE,
  `customerName` varchar(255) NOT NULL,
  `customerEmail` varchar(320),
  `customerPhone` varchar(20) NOT NULL,
  `customerAddress` json,
  `items` json,
  `subtotal` int NOT NULL COMMENT 'Em centavos',
  `discount` int NOT NULL DEFAULT 0 COMMENT 'Em centavos',
  `shipping` int NOT NULL DEFAULT 0 COMMENT 'Em centavos',
  `total` int NOT NULL COMMENT 'Em centavos',
  `status` enum('new','confirmed','shipped','delivered','cancelled') NOT NULL DEFAULT 'new',
  `paymentMethod` varchar(50),
  `shippingMethod` varchar(50),
  `notes` text,
  `couponCode` varchar(50),
  `affiliateCode` varchar(50),
  `trackingLink` varchar(255),
  `source` varchar(100),
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `storeId` (`storeId`),
  KEY `status` (`status`),
  KEY `customerPhone` (`customerPhone`),
  KEY `affiliateCode` (`affiliateCode`),
  FOREIGN KEY (`storeId`) REFERENCES `stores` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 5. TABELA: coupons
-- Descrição: Cupons de desconto (Pro/Platinum)
-- ============================================================================
CREATE TABLE IF NOT EXISTS `coupons` (
  `id` int NOT NULL AUTO_INCREMENT,
  `storeId` int NOT NULL,
  `code` varchar(50) NOT NULL,
  `type` enum('percentage','fixed') NOT NULL,
  `value` int NOT NULL COMMENT 'Percentual (0-100) ou valor fixo em centavos',
  `minPurchase` int NOT NULL DEFAULT 0 COMMENT 'Em centavos',
  `maxUses` int NOT NULL DEFAULT 0 COMMENT '0 = ilimitado',
  `currentUses` int NOT NULL DEFAULT 0,
  `validFrom` timestamp NOT NULL,
  `validUntil` timestamp NOT NULL,
  `status` enum('active','inactive') NOT NULL DEFAULT 'active',
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `storeId` (`storeId`),
  KEY `code` (`code`),
  KEY `status` (`status`),
  FOREIGN KEY (`storeId`) REFERENCES `stores` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 6. TABELA: trackingLinks
-- Descrição: Links rastreáveis (Pro/Platinum)
-- ============================================================================
CREATE TABLE IF NOT EXISTS `trackingLinks` (
  `id` int NOT NULL AUTO_INCREMENT,
  `storeId` int NOT NULL,
  `name` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `targetUrl` text NOT NULL,
  `productId` int,
  `clicks` int NOT NULL DEFAULT 0,
  `conversions` int NOT NULL DEFAULT 0,
  `status` enum('active','inactive') NOT NULL DEFAULT 'active',
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `storeId` (`storeId`),
  KEY `slug` (`slug`),
  KEY `status` (`status`),
  FOREIGN KEY (`storeId`) REFERENCES `stores` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`productId`) REFERENCES `products` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 7. TABELA: affiliates
-- Descrição: Afiliados (Platinum)
-- ============================================================================
CREATE TABLE IF NOT EXISTS `affiliates` (
  `id` int NOT NULL AUTO_INCREMENT,
  `storeId` int NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(320) NOT NULL,
  `whatsapp` varchar(20),
  `commissionPercentage` int NOT NULL COMMENT '0-100',
  `affiliateCode` varchar(50) NOT NULL UNIQUE,
  `totalClicks` int NOT NULL DEFAULT 0,
  `totalSales` int NOT NULL DEFAULT 0,
  `totalCommission` int NOT NULL DEFAULT 0 COMMENT 'Em centavos',
  `status` enum('active','inactive','pending') NOT NULL DEFAULT 'pending',
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `storeId` (`storeId`),
  KEY `status` (`status`),
  FOREIGN KEY (`storeId`) REFERENCES `stores` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 8. TABELA: sales
-- Descrição: Vendas registradas para analytics
-- ============================================================================
CREATE TABLE IF NOT EXISTS `sales` (
  `id` int NOT NULL AUTO_INCREMENT,
  `storeId` int NOT NULL,
  `orderId` int NOT NULL,
  `affiliateCode` varchar(50),
  `affiliateId` int,
  `trackingLink` varchar(255),
  `saleValue` int NOT NULL COMMENT 'Em centavos',
  `commissionPercentage` int NOT NULL DEFAULT 0,
  `commissionValue` int NOT NULL DEFAULT 0 COMMENT 'Em centavos',
  `customerEmail` varchar(320),
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `storeId` (`storeId`),
  KEY `orderId` (`orderId`),
  KEY `affiliateId` (`affiliateId`),
  KEY `createdAt` (`createdAt`),
  FOREIGN KEY (`storeId`) REFERENCES `stores` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`orderId`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`affiliateId`) REFERENCES `affiliates` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 9. TABELA: storeSessions
-- Descrição: Sessões de login dos lojistas (autenticação própria)
-- ============================================================================
CREATE TABLE IF NOT EXISTS `storeSessions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `storeId` int NOT NULL,
  `email` varchar(320) NOT NULL,
  `passwordHash` text NOT NULL,
  `sessionToken` varchar(255) UNIQUE,
  `lastLoginAt` timestamp NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `storeId` (`storeId`),
  KEY `email` (`email`),
  FOREIGN KEY (`storeId`) REFERENCES `stores` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 10. TABELA: adminUsers
-- Descrição: Administradores do painel principal
-- ============================================================================
CREATE TABLE IF NOT EXISTS `adminUsers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(320) NOT NULL UNIQUE,
  `passwordHash` text NOT NULL,
  `name` varchar(255),
  `sessionToken` varchar(255) UNIQUE,
  `lastLoginAt` timestamp NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email_adminUsers` (`email`),
  UNIQUE KEY `sessionToken_adminUsers` (`sessionToken`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- ÍNDICES ADICIONAIS PARA PERFORMANCE
-- ============================================================================


-- ============================================================================
-- DADOS INICIAIS
-- ============================================================================

-- Admin padrão (senha: Thiago1511!)
-- Hash bcrypt: $2b$10$... (gerar com bcrypt)
INSERT INTO `adminUsers` (`email`, `passwordHash`, `name`, `createdAt`, `updatedAt`) 
VALUES ('Thiagor.oliveira.profissional@gmail.com', '$2b$10$...', 'Thiago Rodrigues', NOW(), NOW())
ON DUPLICATE KEY UPDATE `updatedAt` = NOW();

-- ============================================================================
-- VIEWS ÚTEIS
-- ============================================================================

-- View: Resumo de vendas por loja
CREATE OR REPLACE VIEW `vw_store_sales_summary` AS
SELECT 
  s.id,
  s.name,
  s.slug,
  COUNT(DISTINCT o.id) as total_orders,
  SUM(o.total) as total_revenue,
  COUNT(DISTINCT o.customerPhone) as unique_customers,
  MAX(o.createdAt) as last_order_date
FROM `stores` s
LEFT JOIN `orders` o ON s.id = o.storeId
GROUP BY s.id, s.name, s.slug;

-- View: Performance de afiliados
CREATE OR REPLACE VIEW `vw_affiliate_performance` AS
SELECT 
  a.id,
  a.name,
  a.email,
  a.affiliateCode,
  a.commissionPercentage,
  COUNT(DISTINCT sal.id) as total_sales,
  SUM(sal.saleValue) as total_revenue,
  SUM(sal.commissionValue) as total_commission,
  a.totalClicks as clicks
FROM `affiliates` a
LEFT JOIN `sales` sal ON a.id = sal.affiliateId
GROUP BY a.id, a.name, a.email, a.affiliateCode, a.commissionPercentage, a.totalClicks;

-- ============================================================================
-- PROCEDURES ÚTEIS
-- ============================================================================

-- ============================================================================
-- TRIGGERS
-- ============================================================================


-- ============================================================================
-- GRANTS (Permissões)
-- ============================================================================

-- Criar usuário para aplicação (opcional)
-- CREATE USER 'thiro_app'@'localhost' IDENTIFIED BY 'senha_segura';
-- GRANT SELECT, INSERT, UPDATE, DELETE ON GHR3zrLANgGxQTdejEBqxn.* TO 'thiro_app'@'localhost';
-- FLUSH PRIVILEGES;

-- ============================================================================
-- FIM DO DUMP
-- ============================================================================
-- Total de Tabelas: 10
-- Total de Views: 2
-- Total de Procedures: 2
-- Total de Triggers: 2
-- ============================================================================
