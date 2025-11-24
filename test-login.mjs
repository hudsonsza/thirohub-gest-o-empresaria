import bcrypt from 'bcryptjs';
import { drizzle } from 'drizzle-orm/mysql2';
import { storeSessions } from './drizzle/schema.ts';

const db = drizzle(process.env.DATABASE_URL);

// Buscar todas as sessões
const sessions = await db.select().from(storeSessions);

console.log('=== TESTANDO SENHAS ===\n');
console.log(`Total de sessões: ${sessions.length}\n`);

for (const session of sessions) {
  console.log(`Loja ID: ${session.storeId}`);
  console.log(`Email: ${session.email}`);
  console.log(`Hash: ${session.passwordHash.substring(0, 30)}...`);
  
  // Testar senhas possíveis
  const passwords = ['DJEHSbxv9#1*', 'Qv@xyZTTwZv4', 'KPd5i1zTVbTc'];
  
  let found = false;
  for (const pwd of passwords) {
    const match = await bcrypt.compare(pwd, session.passwordHash);
    if (match) {
      console.log(`✅ SENHA CORRETA: ${pwd}`);
      found = true;
      break;
    }
  }
  
  if (!found) {
    console.log(`❌ Nenhuma senha testada funcionou`);
  }
  
  console.log('\n---\n');
}

process.exit(0);
