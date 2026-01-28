
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('Updating legacy badge icons...')

    const updates = [
        { id: 'curious_mind_bronze', icon: '/badges/curious_mind_bronze.png' },
        { id: 'curious_mind_silver', icon: '/badges/curious_mind_silver.png' },
        { id: 'curious_mind_gold', icon: '/badges/curious_mind_gold.png' },
        { id: 'curious_mind_diamond', icon: '/badges/curious_mind_diamond.png' },
    ]

    for (const update of updates) {
        try {
            const res = await prisma.badge_definitions.update({
                where: { id: update.id },
                data: { icon_url: update.icon },
            })
            console.log(`Updated ${update.id}: ${res.icon_url}`)
        } catch (e: any) {
            console.log(`Could not update ${update.id} (might not exist):`, e.message)
        }
    }
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
