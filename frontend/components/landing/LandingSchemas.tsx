import { SITE_URL, SITE_NAME } from "@/lib/site";

const courseSchema = {
    "@context": "https://schema.org",
    "@type": "Course",
    "@id": `${SITE_URL}/#course`,
    name: "The Mambo Guild — Salsa On2 Curriculum",
    description:
        "A structured Salsa On2 (New York Style Mambo) curriculum built on Learning Experience Design. 500+ classes covering footwork, body mechanics, timing, partner work, musicality, and advanced social dancing — organized as a visual Skill Tree that unlocks as you level up.",
    provider: {
        "@type": "EducationalOrganization",
        "@id": `${SITE_URL}#organization`,
        name: SITE_NAME,
        url: SITE_URL,
    },
    educationalLevel: "Beginner to Advanced",
    teaches: [
        "Salsa On2 footwork",
        "Shines (solo footwork)",
        "Partner work and lead/follow technique",
        "Musicality and Mambo timing",
        "History of Salsa and Mambo",
        "Motor learning principles for dancers",
    ],
    inLanguage: "en",
    availableLanguage: ["en", "fr", "it", "es", "pt", "de", "nl", "pl", "ru", "tr", "sr", "ar", "el", "ja", "ko", "zh"],
    courseMode: "online",
    hasCourseInstance: {
        "@type": "CourseInstance",
        courseMode: "online",
        courseWorkload: "PT30M",
    },
    offers: [
        {
            "@type": "Offer",
            name: "Rookie",
            price: "0",
            priceCurrency: "USD",
            category: "Free",
            availability: "https://schema.org/InStock",
        },
        {
            "@type": "Offer",
            name: "Pro",
            price: "39",
            priceCurrency: "USD",
            category: "Subscription",
            priceSpecification: {
                "@type": "UnitPriceSpecification",
                price: "39",
                priceCurrency: "USD",
                unitText: "MONTH",
            },
            availability: "https://schema.org/InStock",
            url: `${SITE_URL}/pricing`,
        },
        {
            "@type": "Offer",
            name: "Guild Master",
            price: "59",
            priceCurrency: "USD",
            category: "Subscription",
            priceSpecification: {
                "@type": "UnitPriceSpecification",
                price: "59",
                priceCurrency: "USD",
                unitText: "MONTH",
            },
            availability: "https://schema.org/LimitedAvailability",
            eligibleQuantity: {
                "@type": "QuantitativeValue",
                maxValue: 30,
            },
            url: `${SITE_URL}/pricing`,
        },
    ],
};

const videoSchema = {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: "The Mambo Guild — Silent Hero Demo",
    description:
        "A cinematic demonstration of Salsa On2 (Mambo) technique by founder Pavle Popovic, showcasing the quality and style of instruction inside The Mambo Guild curriculum.",
    thumbnailUrl: [`${SITE_URL}/assets/SilentHero-poster.jpg`],
    uploadDate: "2026-01-01",
    contentUrl:
        "https://pub-bad1fce3595144f2bac8492efa3aec64.r2.dev/hero/SilentHero.v5.desktop.mp4",
    publisher: {
        "@type": "EducationalOrganization",
        "@id": `${SITE_URL}#organization`,
        name: SITE_NAME,
        logo: {
            "@type": "ImageObject",
            url: `${SITE_URL}/assets/Logo.png`,
        },
    },
};

const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
        {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: SITE_URL,
        },
    ],
};

const escape = (obj: unknown) =>
    JSON.stringify(obj).replace(/</g, "\\u003c");

export default function LandingSchemas() {
    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: escape(courseSchema) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: escape(videoSchema) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: escape(breadcrumbSchema) }}
            />
        </>
    );
}
