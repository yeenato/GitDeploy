const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkProduct() {
    try {
        // Create a test product with images to validate visibility
        const owner = await prisma.user.findFirst({ where: { email: 'john@example.com' } });
        const sampleImages = [
            '/uploads/images-1770189365347.png',
            '/uploads/images-1770189111788.png'
        ];
        const created = await prisma.product.create({
            data: {
                title: 'Test Product With Images',
                description: 'E2E sanity product',
                ownerId: owner?.id ?? 11,
                status: 'available',
                images: JSON.stringify(sampleImages),
                video: null
            }
        });
        console.log('Created test product:', created);

        const allProducts = await prisma.product.findMany({
            orderBy: { id: 'desc' },
            take: 5
        });
        console.log('Last 5 products:', allProducts);
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

checkProduct();
