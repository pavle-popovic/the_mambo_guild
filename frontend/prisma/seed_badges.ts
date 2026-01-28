import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Enum mapping for consistency with DB
// NOTE: Using const objects instead of TypeScript enums to avoid issues with some Node loaders/strip-types
const Tier = {
    BRONZE: 'bronze',
    SILVER: 'silver',
    GOLD: 'gold',
    DIAMOND: 'diamond'
} as const

const Category = {
    COMMUNITY: 'community',
    LAB: 'lab',
    PERFORMANCE: 'performance', // Using performance to map to STREAK logic if needed, or stick to 'community'
    COURSE: 'course'
} as const

async function main() {
    console.log('Start seeding badge definitions...')

    const badges = [
        // --- COMMUNITY ---
        // Firestarter (Fire reactions received)
        {
            id: 'firestarter-bronze',
            name: 'Firestarter',
            description: 'Your dancing is heating up the stage.',
            category: Category.COMMUNITY,
            icon_url: '/badges/firestarter_bronze.png',
            tier: Tier.BRONZE,
            requirement_type: 'reactions_received', // Assuming generic receive or specific type
            threshold: 10,
        },
        {
            id: 'firestarter-silver',
            name: 'Firestarter',
            description: 'Your dancing is heating up the stage.',
            category: Category.COMMUNITY,
            icon_url: '/badges/firestarter_silver.png',
            tier: Tier.SILVER,
            requirement_type: 'reactions_received',
            threshold: 50,
        },
        {
            id: 'firestarter-gold',
            name: 'Firestarter',
            description: 'Your dancing is heating up the stage.',
            category: Category.COMMUNITY,
            icon_url: '/badges/firestarter_gold.png',
            tier: Tier.GOLD,
            requirement_type: 'reactions_received',
            threshold: 200,
        },
        {
            id: 'firestarter-diamond',
            name: 'Firestarter',
            description: 'The stage is ablaze with your talent!',
            category: Category.COMMUNITY,
            icon_url: '/badges/firestarter_diamond.png',
            tier: Tier.DIAMOND,
            requirement_type: 'reactions_received',
            threshold: 1000,
        },
        // Human Metronome (Metronome/Ruler reactions received)
        {
            id: 'human-metronome-bronze',
            name: 'Human Metronome',
            description: 'Impeccable timing acknowledged by peers.',
            category: Category.COMMUNITY,
            icon_url: '/badges/human_metronome_bronze.png',
            tier: Tier.BRONZE,
            requirement_type: 'reactions_received',
            threshold: 15,
        },
        {
            id: 'human-metronome-silver',
            name: 'Human Metronome',
            description: 'Impeccable timing acknowledged by peers.',
            category: Category.COMMUNITY,
            icon_url: '/badges/human_metronome_silver.png',
            tier: Tier.SILVER,
            requirement_type: 'reactions_received',
            threshold: 60,
        },
        {
            id: 'human-metronome-gold',
            name: 'Human Metronome',
            description: 'Impeccable timing acknowledged by peers.',
            category: Category.COMMUNITY,
            icon_url: '/badges/human_metronome_gold.png',
            tier: Tier.GOLD,
            requirement_type: 'reactions_received',
            threshold: 250,
        },
        {
            id: 'human-metronome-diamond',
            name: 'Human Metronome',
            description: 'Your timing is legendary, absolute perfection.',
            category: Category.COMMUNITY,
            icon_url: '/badges/human_metronome_diamond.png',
            tier: Tier.DIAMOND,
            requirement_type: 'reactions_received',
            threshold: 1200,
        },
        // Crowd Favorite (Clap reactions received)
        {
            id: 'crowd-favorite-bronze',
            name: 'Crowd Favorite',
            description: 'Recognized for great effort and spirit.',
            category: Category.COMMUNITY,
            icon_url: '/badges/crowd_favorite_bronze.png',
            tier: Tier.BRONZE,
            requirement_type: 'reactions_received',
            threshold: 20,
        },
        {
            id: 'crowd-favorite-silver',
            name: 'Crowd Favorite',
            description: 'Recognized for great effort and spirit.',
            category: Category.COMMUNITY,
            icon_url: '/badges/crowd_favorite_silver.png',
            tier: Tier.SILVER,
            requirement_type: 'reactions_received',
            threshold: 80,
        },
        {
            id: 'crowd-favorite-gold',
            name: 'Crowd Favorite',
            description: 'Recognized for great effort and spirit.',
            category: Category.COMMUNITY,
            icon_url: '/badges/crowd_favorite_gold.png',
            tier: Tier.GOLD,
            requirement_type: 'reactions_received',
            threshold: 300,
        },
        {
            id: 'crowd-favorite-diamond',
            name: 'Crowd Favorite',
            description: 'A standing ovation every time you perform!',
            category: Category.COMMUNITY,
            icon_url: '/badges/crowd_favorite_diamond.png',
            tier: Tier.DIAMOND,
            requirement_type: 'reactions_received',
            threshold: 1500,
        },
        // Talent Scout (Reactions Given)
        {
            id: 'talent-scout-bronze',
            name: 'Talent Scout',
            description: 'Supporting the community with feedback.',
            category: Category.COMMUNITY,
            icon_url: '/badges/talent_scout_bronze.png',
            tier: Tier.BRONZE,
            requirement_type: 'reactions_given',
            threshold: 10,
        },
        {
            id: 'talent-scout-silver',
            name: 'Talent Scout',
            description: 'Supporting the community with feedback.',
            category: Category.COMMUNITY,
            icon_url: '/badges/talent_scout_silver.png',
            tier: Tier.SILVER,
            requirement_type: 'reactions_given',
            threshold: 100,
        },
        {
            id: 'talent-scout-gold',
            name: 'Talent Scout',
            description: 'Supporting the community with feedback.',
            category: Category.COMMUNITY,
            icon_url: '/badges/talent_scout_gold.png',
            tier: Tier.GOLD,
            requirement_type: 'reactions_given',
            threshold: 500,
        },
        {
            id: 'talent-scout-diamond',
            name: 'Talent Scout',
            description: 'A true pillar of the community, lifting everyone up!',
            category: Category.COMMUNITY,
            icon_url: '/badges/talent_scout_diamond.png',
            tier: Tier.DIAMOND,
            requirement_type: 'reactions_given',
            threshold: 2000,
        },
        // Center Stage (Videos Posted)
        {
            id: 'center-stage-bronze',
            name: 'Center Stage',
            description: 'Sharing your journey on The Stage.',
            category: Category.COMMUNITY,
            icon_url: '/badges/center_stage_bronze.png',
            tier: Tier.BRONZE,
            requirement_type: 'videos_posted',
            threshold: 1,
        },
        {
            id: 'center-stage-silver',
            name: 'Center Stage',
            description: 'Sharing your journey on The Stage.',
            category: Category.COMMUNITY,
            icon_url: '/badges/center_stage_silver.png',
            tier: Tier.SILVER,
            requirement_type: 'videos_posted',
            threshold: 10,
        },
        {
            id: 'center-stage-gold',
            name: 'Center Stage',
            description: 'Sharing your journey on The Stage.',
            category: Category.COMMUNITY,
            icon_url: '/badges/center_stage_gold.png',
            tier: Tier.GOLD,
            requirement_type: 'videos_posted',
            threshold: 50,
        },
        {
            id: 'center-stage-diamond',
            name: 'Center Stage',
            description: 'You own the spotlight, a prolific performer!',
            category: Category.COMMUNITY,
            icon_url: '/badges/center_stage_diamond.png',
            tier: Tier.DIAMOND,
            requirement_type: 'videos_posted',
            threshold: 100,
        },

        // --- THE LAB ---
        // The Professor (Accepted Solutions)
        {
            id: 'the-professor-bronze',
            name: 'The Professor',
            description: 'Providing verified solutions to community questions.',
            category: Category.LAB,
            icon_url: '/badges/the_professor_bronze.png',
            tier: Tier.BRONZE,
            requirement_type: 'solutions_accepted',
            threshold: 1,
        },
        {
            id: 'the-professor-silver',
            name: 'The Professor',
            description: 'Providing verified solutions to community questions.',
            category: Category.LAB,
            icon_url: '/badges/the_professor_silver.png',
            tier: Tier.SILVER,
            requirement_type: 'solutions_accepted',
            threshold: 5,
        },
        {
            id: 'the-professor-gold',
            name: 'The Professor',
            description: 'Providing verified solutions to community questions.',
            category: Category.LAB,
            icon_url: '/badges/the_professor_gold.png',
            tier: Tier.GOLD,
            requirement_type: 'solutions_accepted',
            threshold: 20,
        },
        {
            id: 'the-professor-diamond',
            name: 'The Professor',
            description: 'The oracle of dance knowledge, revered by all.',
            category: Category.LAB,
            icon_url: '/badges/the_professor_diamond.png',
            tier: Tier.DIAMOND,
            requirement_type: 'solutions_accepted',
            threshold: 50,
        },
        // The Socialite (Comments posted)
        {
            id: 'the-socialite-bronze',
            name: 'The Socialite',
            description: 'Active participant in discussions.',
            category: Category.LAB,
            icon_url: '/badges/the_socialite_bronze.png',
            tier: Tier.BRONZE,
            requirement_type: 'comments_posted',
            threshold: 10,
        },
        {
            id: 'the-socialite-silver',
            name: 'The Socialite',
            description: 'Active participant in discussions.',
            category: Category.LAB,
            icon_url: '/badges/the_socialite_silver.png',
            tier: Tier.SILVER,
            requirement_type: 'comments_posted',
            threshold: 50,
        },
        {
            id: 'the-socialite-gold',
            name: 'The Socialite',
            description: 'Active participant in discussions.',
            category: Category.LAB,
            icon_url: '/badges/the_socialite_gold.png',
            tier: Tier.GOLD,
            requirement_type: 'comments_posted',
            threshold: 200,
        },
        {
            id: 'the-socialite-diamond',
            name: 'The Socialite',
            description: 'The life of the party, always engaging and connecting!',
            category: Category.LAB,
            icon_url: '/badges/the_socialite_diamond.png',
            tier: Tier.DIAMOND,
            requirement_type: 'comments_posted',
            threshold: 1000,
        },

        // --- STREAKS ---
        // Unstoppable (Daily Login Streak)
        {
            id: 'unstoppable-bronze',
            name: 'Unstoppable',
            description: 'Consistent dedication to showing up.',
            category: Category.PERFORMANCE,
            icon_url: '/badges/unstoppable_bronze.png',
            tier: Tier.BRONZE,
            requirement_type: 'streak',
            threshold: 3,
        },
        {
            id: 'unstoppable-silver',
            name: 'Unstoppable',
            description: 'Consistent dedication to showing up.',
            category: Category.PERFORMANCE,
            icon_url: '/badges/unstoppable_silver.png',
            tier: Tier.SILVER,
            requirement_type: 'streak',
            threshold: 14,
        },
        {
            id: 'unstoppable-gold',
            name: 'Unstoppable',
            description: 'Consistent dedication to showing up.',
            category: Category.PERFORMANCE,
            icon_url: '/badges/unstoppable_gold.png',
            tier: Tier.GOLD,
            requirement_type: 'streak',
            threshold: 30,
        },
        {
            id: 'unstoppable-diamond',
            name: 'Unstoppable',
            description: 'An iron will, absolutely unbreakable dedication!',
            category: Category.PERFORMANCE,
            icon_url: '/badges/unstoppable_diamond.png',
            tier: Tier.DIAMOND,
            requirement_type: 'streak',
            threshold: 100,
        },

        // --- COURSE ---
        // Curious Mind (Lessons Completed)
        {
            id: 'curious-mind-bronze',
            name: 'Curious Mind',
            description: 'Starting your learning journey with passion.',
            category: Category.COURSE,
            icon_url: '/badges/curious_mind_bronze.png',
            tier: Tier.BRONZE,
            requirement_type: 'lessons_completed',
            threshold: 5,
        },
        {
            id: 'curious-mind-silver',
            name: 'Curious Mind',
            description: 'Diving deeper into dance knowledge.',
            category: Category.COURSE,
            icon_url: '/badges/curious_mind_silver.png',
            tier: Tier.SILVER,
            requirement_type: 'lessons_completed',
            threshold: 25,
        },
        {
            id: 'curious-mind-gold',
            name: 'Curious Mind',
            description: 'A dedicated student of the craft.',
            category: Category.COURSE,
            icon_url: '/badges/curious_mind_gold.png',
            tier: Tier.GOLD,
            requirement_type: 'lessons_completed',
            threshold: 100,
        },
        {
            id: 'curious-mind-diamond',
            name: 'Curious Mind',
            description: 'A true scholar of dance, absorbing all knowledge!',
            category: Category.COURSE,
            icon_url: '/badges/curious_mind_diamond.png',
            tier: Tier.DIAMOND,
            requirement_type: 'lessons_completed',
            threshold: 500,
        },

        // --- SPECIAL / LEGACY ---
        // Beta Tester (Special award for early testers)
        {
            id: 'beta-tester',
            name: 'Beta Tester',
            description: 'A pioneer who helped shape the platform.',
            category: Category.COMMUNITY,
            icon_url: '/badges/beta_tester.png',
            tier: Tier.GOLD,
            requirement_type: 'special',
            threshold: 1, // Manually awarded
        },
        // Founder (Special award for founding members)
        {
            id: 'founder',
            name: 'Founder',
            description: 'An original founding member of The Mambo Guild.',
            category: Category.COMMUNITY,
            icon_url: '/badges/founder_diamond.png',
            tier: Tier.DIAMOND,
            requirement_type: 'special',
            threshold: 1, // Manually awarded
        },
    ]

    for (const badge of badges) {
        // Upsert into badge_definitions
        const b = await prisma.badge_definitions.upsert({
            where: { id: badge.id },
            update: {
                name: badge.name,
                description: badge.description,
                tier: badge.tier,
                icon_url: badge.icon_url,
                category: badge.category,
                requirement_type: badge.requirement_type,
                threshold: badge.threshold,
                created_at: new Date()
            },
            create: {
                id: badge.id,
                name: badge.name,
                description: badge.description,
                tier: badge.tier,
                icon_url: badge.icon_url,
                category: badge.category,
                requirement_type: badge.requirement_type,
                threshold: badge.threshold,
                created_at: new Date()
            },
        })
        // console.log(`Upserted badge definition: ${b.id}`)
    }

    console.log('Seeding finished. Upserted 38 badges.')
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
