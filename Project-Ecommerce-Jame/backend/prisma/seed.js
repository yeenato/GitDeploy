const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  // Clear existing data
  await prisma.product.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.user.deleteMany({});

  // Hash passwords
  const password = await bcrypt.hash('password123', 10);
  const adminPassword = await bcrypt.hash('admin123', 10);

  // Create Categories
  const electronics = await prisma.category.create({
    data: {
      name: 'Electronics',
      description: 'Electronic devices and gadgets',
    },
  });

  const fashion = await prisma.category.create({
    data: {
      name: 'Fashion',
      description: 'Clothing, accessories, and fashion items',
    },
  });

  const books = await prisma.category.create({
    data: {
      name: 'Books',
      description: 'Books, magazines, and reading materials',
    },
  });

  // Additional Categories
  const categories = [
    { name: 'Home & Living', description: 'Furniture, decor, and household items' },
    { name: 'Beauty & Personal Care', description: 'Makeup, skincare, and grooming' },
    { name: 'Sports & Outdoors', description: 'Sporting goods and outdoor equipment' },
    { name: 'Toys & Games', description: 'Toys, board games, and puzzles' },
    { name: 'Automotive', description: 'Car accessories and parts' },
    { name: 'Health & Wellness', description: 'Vitamins, supplements, and health care' },
    { name: 'Collectibles & Art', description: 'Antiques, art, and collectibles' },
    { name: 'Pets', description: 'Pet food, accessories, and toys' },
    { name: 'Food & Beverages', description: 'Snacks, drinks, and packaged food' },
    { name: 'Stationery', description: 'Office supplies and school essentials' }
  ];

  for (const cat of categories) {
    await prisma.category.create({
      data: cat
    });
  }

  // Create Admin User
  const admin = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      password: adminPassword,
      name: 'Admin User',
      bio: 'System Administrator',
      role: 'ADMIN',
    },
  });

  // Create Regular Users
  const user1 = await prisma.user.create({
    data: {
      email: 'john@example.com',
      password,
      name: 'John Doe',
      bio: 'Loves trading gadgets.',
      role: 'USER',
      products: {
        create: [
          {
            title: 'iPhone 12',
            description: 'Used iPhone 12 in good condition.',
            status: 'available',
            categoryId: electronics.id,
          },
          {
            title: 'MacBook Air M1',
            description: 'Slightly used MacBook Air M1.',
            status: 'PENDING_APPROVAL',
            categoryId: electronics.id,
          },
        ],
      },
    },
  });

  const user2 = await prisma.user.create({
    data: {
      email: 'jane@example.com',
      password,
      name: 'Jane Smith',
      bio: 'Vintage collector.',
      role: 'USER',
      products: {
        create: [
          {
            title: 'Vintage Camera',
            description: 'Old film camera, working condition.',
            status: 'PENDING_APPROVAL',
            categoryId: electronics.id,
          },
          {
            title: 'Designer Handbag',
            description: 'Authentic Louis Vuitton handbag.',
            status: 'available',
            categoryId: fashion.id,
          },
        ],
      },
    },
  });

  console.log({ admin, user1, user2, electronics, fashion, books });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
