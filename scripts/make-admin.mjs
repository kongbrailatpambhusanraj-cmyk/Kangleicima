import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function makeAdmin(userId) {
  const role = await prisma.userRole.upsert({
    where: { userId },
    update: { role: 'admin' },
    create: { userId, role: 'admin' },
  });
  console.log('User role updated:', role);
}

// Usage: node scripts/make-admin.mjs <userId>
const userId = process.argv[2];
if (!userId) {
  console.error('Please provide a userId');
  process.exit(1);
}

makeAdmin(userId).catch(console.error);
