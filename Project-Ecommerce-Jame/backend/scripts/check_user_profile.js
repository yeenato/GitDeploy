
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findUnique({
    where: { email: 'beelzebub132@gmail.com' },
    select: { id: true, name: true, email: true, profileImage: true, role: true }
  });
  console.log('User data:', user);
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
