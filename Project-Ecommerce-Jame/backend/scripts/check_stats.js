const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const userCount = await prisma.user.count();
  const productCount = await prisma.product.count();
  const pendingProductCount = await prisma.product.count({
    where: { status: 'PENDING_APPROVAL' }
  });
  const categoryCount = await prisma.category.count();

  console.log('Database Stats:');
  console.log(`Users: ${userCount}`);
  console.log(`Products: ${productCount}`);
  console.log(`Pending Products: ${pendingProductCount}`);
  console.log(`Categories: ${categoryCount}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
