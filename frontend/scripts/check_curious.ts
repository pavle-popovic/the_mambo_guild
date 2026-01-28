
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const badges = await prisma.badge_definitions.findMany({
        where: {
            OR: [
                { name: { contains: 'Curious' } },
                { name: { contains: 'Beta' } },
                { name: { contains: 'Founder' } }
            ]
        }
    })

    console.log('Found badges:', badges)
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
