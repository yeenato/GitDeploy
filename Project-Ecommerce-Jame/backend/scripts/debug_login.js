const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const email = 'beelzebub132@gmail.com';
  console.log(`Checking user: ${email}`);
  
  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (user) {
      console.log('User found:');
      console.log(`ID: ${user.id}`);
      console.log(`Role: ${user.role}`);
      console.log(`Password Hash (prefix): ${user.password ? user.password.substring(0, 10) : 'NO PASSWORD'}`);
      console.log(`Created At: ${user.createdAt}`);
    } else {
      console.log('User NOT found!');
    }
  } catch (error) {
    console.error('Error querying user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
