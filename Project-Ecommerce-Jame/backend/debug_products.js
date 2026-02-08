const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const products = await prisma.product.findMany({
      take: 5,
      select: {
        id: true,
        title: true,
        images: true
      }
    });
    console.log('--- Products Sample ---');
    products.forEach(p => {
      console.log(`ID: ${p.id}, Title: ${p.title}`);
      console.log(`Images (${typeof p.images}):`, p.images);
    });
  } catch (error) {
    console.error('Error fetching products:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
