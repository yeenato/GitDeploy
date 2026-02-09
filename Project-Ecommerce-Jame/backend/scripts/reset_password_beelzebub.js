const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  const email = 'beelzebub132@gmail.com';
  const newPassword = 'password123'; // Setting a default strong-ish password

  console.log(`Resetting password for: ${email}`);
  
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    const user = await prisma.user.update({
      where: { email },
      data: {
        password: hashedPassword,
      },
    });

    console.log(`Password reset successfully for user ID: ${user.id}`);
    console.log(`New password is: ${newPassword}`);
  } catch (error) {
    console.error('Error resetting password:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
