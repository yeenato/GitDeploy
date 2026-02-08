const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    // Update User Role
    const email = 'beelzebub132@gmail.com';
    try {
        const user = await prisma.user.update({
            where: { email: email },
            data: { role: 'ADMIN' },
        });
        console.log(`SUCCESS: User ${email} updated to ADMIN.`);
        console.log(user);
    } catch (e) {
        console.error(`ERROR: Could not update user ${email}.`, e.message);
    }

    // Check Latest Product Images
    try {
        const latestProduct = await prisma.product.findFirst({
            orderBy: { id: 'desc' }
        });
        console.log('\n--- Latest Product Debug Info ---');
        console.log(latestProduct);
    } catch (e) {
        console.error('Error fetching latest product:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();