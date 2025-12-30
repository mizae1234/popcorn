
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const videos = await prisma.video.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: { id: true, prompt: true, createdAt: true }
    });
    console.log('Recent videos:', JSON.stringify(videos, null, 2));
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
