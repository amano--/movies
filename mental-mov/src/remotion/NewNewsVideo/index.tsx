import { useState } from "react";
import { AbsoluteFill, Audio, staticFile } from "remotion";
import { NewSubtitles } from "./NewSubtitles";
import { VisualStory } from "./VisualStory";
import { Caster } from "./Caster";

export const NewNewsVideo: React.FC = () => {
    const [mood, setMood] = useState<'neutral' | 'smile' | 'sad' | 'excited' | 'angry'>('neutral');

    return (
        <AbsoluteFill style={{ backgroundColor: 'black' }}>
            {/* Visual Story (Background images with motion) */}
            <VisualStory />

            {/* Subtitles (Clean cinematic style, left aligned) */}
            <NewSubtitles 
                source="project_2025_03/source/subtitles.srt" 
                onMoodChange={setMood}
            />

             {/* Caster Wipe (Bottom Right) */}
            <Caster mood={mood} />

            {/* Audio */}
            <Audio src={staticFile('project_2025_03/source/audio.m4a')} />
        </AbsoluteFill>
    );
};
