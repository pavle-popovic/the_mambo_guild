import { Composition } from "remotion";
import { FullPromo } from "./FullPromo";
import { MamboGuildPromo } from "./MamboGuildPromo";

// Video durations
const ENTRANCE_DURATION = 185; // 8s at 1.3x speed
const MAIN_CONTENT_DURATION = 510; // 17 seconds
const EXIT_DURATION = 185; // 8s at 1.3x speed
const FULL_DURATION = ENTRANCE_DURATION + MAIN_CONTENT_DURATION + EXIT_DURATION; // 880 frames = ~29.3s

export const RemotionRoot = () => {
    return (
        <>
            {/* Full promo with entrance and exit videos */}
            <Composition
                id="FullPromo"
                component={FullPromo}
                durationInFrames={FULL_DURATION}
                fps={30}
                width={1080}
                height={1920}
            />

            {/* Original promo without entrance/exit (for quick preview) */}
            <Composition
                id="MamboGuildPromo"
                component={MamboGuildPromo}
                durationInFrames={510} // 17 seconds @ 30fps
                fps={30}
                width={1080}
                height={1920}
            />
        </>
    );
};
