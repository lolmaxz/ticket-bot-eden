import prisma from '../lib/prisma';

async function test(): Promise<void> {
  try {
    console.log('Testing database connection...');
    const count = await prisma.ticket.count();
    console.log(`✅ Database connected! Current ticket count: ${count}`);
    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

test();






