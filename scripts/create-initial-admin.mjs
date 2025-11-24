import { createAdmin } from '../server/adminAuth.js';

const INITIAL_ADMIN_EMAIL = 'Thiagor.oliveira.profissional@gmail.com';
const INITIAL_ADMIN_PASSWORD = 'Thiro15112004!';
const INITIAL_ADMIN_NAME = 'Thiago Rodrigues';

(async () => {
  try {
    console.log('🔧 Creating initial admin user...');
    
    await createAdmin(INITIAL_ADMIN_EMAIL, INITIAL_ADMIN_PASSWORD, INITIAL_ADMIN_NAME);
    
    console.log('✅ Initial admin created successfully!');
    console.log(`📧 Email: ${INITIAL_ADMIN_EMAIL}`);
    console.log(`🔑 Password: ${INITIAL_ADMIN_PASSWORD}`);
    
    process.exit(0);
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      console.log('ℹ️  Admin already exists, skipping...');
      process.exit(0);
    }
    console.error('❌ Error creating admin:', error);
    process.exit(1);
  }
})();
