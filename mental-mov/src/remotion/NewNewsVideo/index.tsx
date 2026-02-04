import { AbsoluteFill, Audio, staticFile } from "remotion";
import { NewSubtitles } from "./NewSubtitles";
import { VisualStory } from "./VisualStory";

export const NewNewsVideo: React.FC = () => {
    return (
        <AbsoluteFill style={{ backgroundColor: 'black' }}>
            {/* Visual Story (Background images with motion) */}
            <VisualStory />

            {/* Subtitles (Clean cinematic style) */}
            <NewSubtitles source="project_2025_03/subtitles.srt" />

            {/* Audio */}
            <Audio src={staticFile('project_2025_03/audio.m4a')} />
        </AbsoluteFill>
    );
};
