const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
    try {
        console.log('--- checking products ---');
        
        // 1. Create product with images
        const productWithImages = await prisma.product.create({
            data: {
                title: 'Test With Images ' + Date.now(),
                description: 'Description',
                ownerId: 11, // Ensure this user exists or use a valid one
                status: 'available',
                images: JSON.stringify(["/uploads/test1.png", "/uploads/test2.png"]),
            }
        });
        console.log('Created product with images:', productWithImages.id);

        // 2. Create product without images
        const productWithoutImages = await prisma.product.create({
            data: {
                title: 'Test Without Images ' + Date.now(),
                description: 'Description',
                ownerId: 11,
                status: 'available',
                images: null,
            }
        });
        console.log('Created product without images:', productWithoutImages.id);

        // 3. Simulate getProducts (Home Page)
        const homeProducts = await prisma.product.findMany({
            where: {
                status: 'available',
            },
            take: 10,
            orderBy: { createdAt: 'desc' },
        });
        console.log('Home Page Products count:', homeProducts.length);
        const foundWith = homeProducts.find(p => p.id === productWithImages.id);
        const foundWithout = homeProducts.find(p => p.id === productWithoutImages.id);
        console.log('Found product with images in Home:', !!foundWith);
        console.log('Found product without images in Home:', !!foundWithout);

        // 4. Simulate getMyProducts (My Items)
        const myProducts = await prisma.product.findMany({
            where: { ownerId: 11 },
        });
        console.log('My Products count:', myProducts.length);
        const myFoundWith = myProducts.find(p => p.id === productWithImages.id);
        const myFoundWithout = myProducts.find(p => p.id === productWithoutImages.id);
        console.log('Found product with images in My Items:', !!myFoundWith);
        console.log('Found product without images in My Items:', !!myFoundWithout);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

check();
