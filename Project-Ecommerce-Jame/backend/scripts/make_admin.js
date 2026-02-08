const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

(async () => {
  const email = 'beelzebubrock2@gmail.com';
  let user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    const password = await bcrypt.hash('admin123', 10);
    user = await prisma.user.create({
      data: {
        email,
        password,
        name: 'Admin User',
        bio: 'System Administrator',
        role: 'ADMIN',
      },
    });
  } else if (user.role !== 'ADMIN') {
    user = await prisma.user.update({
      where: { email },
      data: { role: 'ADMIN' },
    });
  }
  console.log('ADMIN_USER', { id: user.id, email: user.email, role: user.role });
  await prisma.$disconnect();
})().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
