const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const users = await prisma.user.findMany();
    console.log('--- All Users in Database ---');
    console.log(`Total count: ${users.length}`);
    users.forEach(user => {
      console.log({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        phoneNumber: user.phoneNumber,
        profileImage: user.profileImage,
        createdAt: user.createdAt
      });
    });
  } catch (error) {
    console.error('Error fetching users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
