
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkCategories() {
    try {
        console.log('Checking categories in database...');
        const categories = await prisma.category.findMany();
        console.log('Categories found:', categories.length);
        console.log(JSON.stringify(categories, null, 2));
        
        if (categories.length === 0) {
            console.log('No categories found. Creating default categories...');
            const defaultCategories = [
                { name: 'Electronics', description: 'Electronic devices and accessories' },
                { name: 'Clothing', description: 'Apparel and fashion' },
                { name: 'Books', description: 'Books and literature' },
                { name: 'Home & Garden', description: 'Home decoration and gardening' },
                { name: 'Toys', description: 'Toys and games' },
                { name: 'Sports', description: 'Sports equipment' },
                { name: 'Other', description: 'Miscellaneous items' }
            ];
            
            for (const cat of defaultCategories) {
                await prisma.category.create({ data: cat });
            }
            console.log('Default categories created.');
        }
    } catch (error) {
        console.error('Error checking categories:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkCategories();
