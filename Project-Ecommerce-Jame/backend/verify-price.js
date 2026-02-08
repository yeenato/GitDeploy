
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Verifying price field...');
    try {
        // Create a dummy user first if needed, or find existing
        const user = await prisma.user.findFirst();
        if (!user) {
            console.log('No user found to create product');
            return;
        }

        // Create product with price
        const product = await prisma.product.create({
            data: {
                title: 'Test Price Product',
                description: 'Testing price persistence',
                ownerId: user.id,
                price: 999,
                status: 'available'
            }
        });

        console.log('Created product:', product);

        if (product.price === 999) {
            console.log('SUCCESS: Price was saved correctly.');
        } else {
            console.log('FAILURE: Price is ' + product.price);
        }

        // Cleanup
        await prisma.product.delete({ where: { id: product.id } });

    } catch (e) {
        console.error('Error:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
