import React from "react";
import { Sequence, staticFile, Audio } from "remotion";

// Transition timing based on user's exact timestamps (SS:FF format -> frames @ 30fps)
// First transition at start is good, keeping it at 0
const TRANSITION_0_START = 0;   // Video start - Intro entrance
const TRANSITION_1_START = 65;  // 02:05 - Intro -> Vault
const TRANSITION_2_START = 153; // 05:03 - Vault -> SkillTree  
const TRANSITION_3_START = 260; // 08:20 - SkillTree -> Community
const TRANSITION_4_START = 345; // 11:15 - Community -> Login

// Keyboard typing from 12:05 to 13:20 (frames 365 to 410)
const KEYBOARD_START = 365;     // 12:05
const KEYBOARD_DURATION = 45;   // Until 13:20 (410 - 365 = 45 frames)

// Mouse click timing stays relative to keyboard end
const MOUSE_CLICK_START = 410;  // After typing ends
const SUCCESS_START = 465;      // Success scene (delayed to match 40-frame animation delay)

export const AudioLayer: React.FC = () => {
    return (
        <>
            {/* Opening transition sound - video start */}
            <Sequence from={TRANSITION_0_START} durationInFrames={30}>
                <Audio
                    src={staticFile("sounds/transition.mp3")}
                    volume={2.5}
                />
            </Sequence>

            {/* Transition 1: Intro -> Vault at 02:05 */}
            <Sequence from={TRANSITION_1_START} durationInFrames={30}>
                <Audio
                    src={staticFile("sounds/transition.mp3")}
                    volume={2.5}
                />
            </Sequence>

            {/* Transition 2: Vault -> SkillTree at 05:03 */}
            <Sequence from={TRANSITION_2_START} durationInFrames={30}>
                <Audio
                    src={staticFile("sounds/transition.mp3")}
                    volume={2.5}
                />
            </Sequence>

            {/* Transition 3: SkillTree -> Community at 08:20 */}
            <Sequence from={TRANSITION_3_START} durationInFrames={30}>
                <Audio
                    src={staticFile("sounds/transition.mp3")}
                    volume={2.5}
                />
            </Sequence>

            {/* Transition 4: Community -> Login at 11:15 */}
            <Sequence from={TRANSITION_4_START} durationInFrames={30}>
                <Audio
                    src={staticFile("sounds/transition.mp3")}
                    volume={2.5}
                />
            </Sequence>

            {/* Keyboard typing from 12:05 to 13:20 */}
            <Sequence from={KEYBOARD_START} durationInFrames={KEYBOARD_DURATION}>
                <Audio
                    src={staticFile("sounds/real-typing.mp3")}
                    volume={0.5}
                />
            </Sequence>

            {/* Mouse click after typing ends */}
            <Sequence from={MOUSE_CLICK_START} durationInFrames={20}>
                <Audio
                    src={staticFile("sounds/real-click.mp3")}
                    volume={0.65}
                />
            </Sequence>

            {/* Success notification sound on final scene */}
            <Sequence from={SUCCESS_START} durationInFrames={60}>
                <Audio
                    src={staticFile("sounds/mission-complete.wav")}
                    volume={0.35}
                />
            </Sequence>
        </>
    );
};
