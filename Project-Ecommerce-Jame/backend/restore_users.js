const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  // Create beelzebub132@gmail.com
  const email1 = 'beelzebub132@gmail.com';
  const passwordRaw1 = '22514883m';
  const passwordHash1 = await bcrypt.hash(passwordRaw1, 10);

  try {
    const user1 = await prisma.user.upsert({
      where: { email: email1 },
      update: {
        password: passwordHash1,
        role: 'ADMIN',
      },
      create: {
        email: email1,
        password: passwordHash1,
        name: 'Beelzebub 132',
        role: 'ADMIN',
        bio: 'Restored Admin User',
        phoneNumber: '099-999-9999' // Testing phone number init
      },
    });
    console.log(`Restored/Updated ${email1}:`, user1);
  } catch (e) {
    console.error(`Error restoring ${email1}:`, e);
  }

  // Create beelzebubrock2@gmail.com
  const email2 = 'beelzebubrock2@gmail.com';
  const passwordRaw2 = 'admin123';
  const passwordHash2 = await bcrypt.hash(passwordRaw2, 10);

  try {
    const user2 = await prisma.user.upsert({
      where: { email: email2 },
      update: {
        password: passwordHash2,
        role: 'ADMIN',
      },
      create: {
        email: email2,
        password: passwordHash2,
        name: 'Beelzebub Rock 2',
        role: 'ADMIN',
        bio: 'Restored Admin User 2'
      },
    });
    console.log(`Restored/Updated ${email2}:`, user2);
  } catch (e) {
    console.error(`Error restoring ${email2}:`, e);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
