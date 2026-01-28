import React from "react";
import { AbsoluteFill } from "remotion";
import {
    TransitionSeries,
    linearTiming,
    springTiming,
} from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { wipe } from "@remotion/transitions/wipe";

import { NightSkyBackground } from "./components/NightSkyBackground";
import { AudioLayer } from "./components/AudioLayer";
import { IntroScene } from "./scenes/IntroScene";
import { VaultScene } from "./scenes/VaultScene";
import { SkillTreeScene } from "./scenes/SkillTreeScene";
import { CommunityScene } from "./scenes/CommunityScene";
import { LoginScene } from "./scenes/LoginScene";
import { SuccessScene } from "./scenes/SuccessScene";

// Timeline (17 seconds @ 30fps = 510 frames)
// Transitions overlap, so we add extra frames to account for transition durations
const TRANSITION_DURATION = 25; // frames (slower, smoother transitions)

// Scene durations (adjusted for overlaps)
const INTRO_DURATION = 60 + TRANSITION_DURATION; // 2s + overlap
const VAULT_DURATION = 90 + TRANSITION_DURATION; // 3s + overlap
const SKILL_TREE_DURATION = 105 + TRANSITION_DURATION; // 3.5s + overlap
const COMMUNITY_DURATION = 90 + TRANSITION_DURATION; // 3s + overlap
const LOGIN_DURATION = 75 + TRANSITION_DURATION; // 2.5s + overlap
const SUCCESS_DURATION = 90; // 3s (final scene, extended for full display)

export const MamboGuildPromo: React.FC = () => {
    return (
        <AbsoluteFill>
            {/* Background layer - always visible */}
            <NightSkyBackground />

            {/* Audio layer with sound effects */}
            <AudioLayer />

            {/* Scene transitions */}
            <TransitionSeries>
                {/* Scene 1: Intro Title */}
                <TransitionSeries.Sequence durationInFrames={INTRO_DURATION}>
                    <IntroScene />
                </TransitionSeries.Sequence>

                <TransitionSeries.Transition
                    presentation={wipe({ direction: "from-left" })}
                    timing={springTiming({
                        config: { damping: 200 },
                        durationInFrames: TRANSITION_DURATION,
                    })}
                />

                {/* Scene 2: The Vault Features */}
                <TransitionSeries.Sequence durationInFrames={VAULT_DURATION}>
                    <VaultScene />
                </TransitionSeries.Sequence>

                <TransitionSeries.Transition
                    presentation={slide({ direction: "from-bottom" })}
                    timing={springTiming({
                        config: { damping: 200 },
                        durationInFrames: TRANSITION_DURATION,
                    })}
                />

                {/* Scene 3: Skill Tree RPG */}
                <TransitionSeries.Sequence durationInFrames={SKILL_TREE_DURATION}>
                    <SkillTreeScene />
                </TransitionSeries.Sequence>

                <TransitionSeries.Transition
                    presentation={wipe({ direction: "from-right" })}
                    timing={springTiming({
                        config: { damping: 200 },
                        durationInFrames: TRANSITION_DURATION,
                    })}
                />

                {/* Scene 4: Community/The Stage */}
                <TransitionSeries.Sequence durationInFrames={COMMUNITY_DURATION}>
                    <CommunityScene />
                </TransitionSeries.Sequence>

                <TransitionSeries.Transition
                    presentation={slide({ direction: "from-right" })}
                    timing={springTiming({
                        config: { damping: 200 },
                        durationInFrames: TRANSITION_DURATION,
                    })}
                />

                {/* Scene 5: Login Flow */}
                <TransitionSeries.Sequence durationInFrames={LOGIN_DURATION}>
                    <LoginScene />
                </TransitionSeries.Sequence>

                <TransitionSeries.Transition
                    presentation={fade()}
                    timing={linearTiming({ durationInFrames: TRANSITION_DURATION })}
                />

                {/* Scene 6: Success Message */}
                <TransitionSeries.Sequence durationInFrames={SUCCESS_DURATION}>
                    <SuccessScene />
                </TransitionSeries.Sequence>
            </TransitionSeries>
        </AbsoluteFill>
    );
};

