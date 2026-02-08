const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

(async () => {
  const email = 'beelzebub132@gmail.com';
  const newPassword = '22514883m';
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  try {
    const user = await prisma.user.update({
      where: { email },
      data: { password: hashedPassword },
    });
    console.log(`Password for ${email} has been reset to: ${newPassword}`);
    console.log('Updated User:', user);
  } catch (error) {
    console.error('Error resetting password:', error);
  } finally {
    await prisma.$disconnect();
  }
})();
