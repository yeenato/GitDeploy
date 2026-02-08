
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const categories = [
    { name: 'Home & Living', description: 'Furniture, decor, and household items' },
    { name: 'Beauty & Personal Care', description: 'Makeup, skincare, and grooming' },
    { name: 'Sports & Outdoors', description: 'Sporting goods and outdoor equipment' },
    { name: 'Toys & Games', description: 'Toys, board games, and puzzles' },
    { name: 'Automotive', description: 'Car accessories and parts' },
    { name: 'Health & Wellness', description: 'Vitamins, supplements, and health care' },
    { name: 'Collectibles & Art', description: 'Antiques, art, and collectibles' },
    { name: 'Pets', description: 'Pet food, accessories, and toys' },
    { name: 'Food & Beverages', description: 'Snacks, drinks, and packaged food' },
    { name: 'Stationery', description: 'Office supplies and school essentials' }
];

async function main() {
    console.log('Start adding categories...');

    for (const cat of categories) {
        try {
            const category = await prisma.category.upsert({
                where: { name: cat.name },
                update: {}, // Don't update if exists
                create: {
                    name: cat.name,
                    description: cat.description
                },
            });
            console.log(`Upserted category: ${category.name}`);
        } catch (error) {
            console.error(`Error adding category ${cat.name}:`, error);
        }
    }

    console.log('Finished adding categories.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
