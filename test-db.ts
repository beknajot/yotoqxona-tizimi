require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

async function test() {
  const pool = new Pool({ 
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  const adapter = new PrismaPg(pool);
  const db = new PrismaClient({ adapter });

  try {
    const userCount = await db.user.count();
    console.log('Connection successful! User count:', userCount);
  } catch (err) {
    console.error('Connection failed:', err);
  } finally {
    await db.$disconnect();
  }
}

test();
