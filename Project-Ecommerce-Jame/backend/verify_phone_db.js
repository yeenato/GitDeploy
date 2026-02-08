const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  try {
    const email = 'beelzebub132@gmail.com';
    const phoneNumber = '099-999-9999';

    console.log(`Updating phone number for ${email}...`);
    const user = await prisma.user.update({
      where: { email },
      data: { phoneNumber },
    });

    console.log('Update successful!');
    console.log('User:', user);

    if (user.phoneNumber === phoneNumber) {
      console.log('Verification PASSED: Phone number matches.');
    } else {
      console.log('Verification FAILED: Phone number mismatch.');
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
})();
