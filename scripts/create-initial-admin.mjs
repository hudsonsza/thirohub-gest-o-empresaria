import "dotenv/config";
import mysql from "mysql2/promise";
import bcrypt from "bcryptjs";

const INITIAL_ADMIN_EMAIL = "thiagor.oliveira.profissional@gmail.com";
const INITIAL_ADMIN_PASSWORD = "Thiro15112004!";
const INITIAL_ADMIN_NAME = "Thiago Rodrigues";

async function main() {
  const url = process.env.DATABASE_URL;

  if (!url) {
    console.error("❌ DATABASE_URL not set in environment");
    process.exit(1);
  }

  const connection = await mysql.createConnection(url);

  try {
    console.log("🔧 Resetando usuário admin inicial...");

    // Remove qualquer admin existente com esse email
    await connection.execute(
      "DELETE FROM adminUsers WHERE email = ?",
      [INITIAL_ADMIN_EMAIL]
    );

    const passwordHash = await bcrypt.hash(INITIAL_ADMIN_PASSWORD, 10);

    await connection.execute(
      "INSERT INTO adminUsers (email, passwordHash, name) VALUES (?, ?, ?)",
      [INITIAL_ADMIN_EMAIL, passwordHash, INITIAL_ADMIN_NAME]
    );

    console.log("✅ Admin inicial recriado com sucesso!");
    console.log(`📧 Email: ${INITIAL_ADMIN_EMAIL}`);
    console.log(`🔑 Password: ${INITIAL_ADMIN_PASSWORD}`);
  } catch (error) {
    console.error("❌ Error creating admin:", error);
    process.exitCode = 1;
  } finally {
    await connection.end().catch(() => {});
  }
}

main();
