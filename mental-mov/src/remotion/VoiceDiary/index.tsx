import { Audio } from "@remotion/media";
import { AbsoluteFill, Img, Sequence, staticFile, useVideoConfig } from "remotion";
import { Subtitles } from "./Subtitles";

const images = [
    { src: "intro_desk.png", start: 0, duration: 9 }, // 0:00 - 0:09
    { src: "magazine_ageha.png", start: 9, duration: 11 }, // 0:09 - 0:20
    { src: "father_silhouette.png", start: 20, duration: 13 }, // 0:20 - 0:33
    { src: "void_chair.png", start: 33, duration: 6 }, // 0:33 - 0:39
    { src: "leaving_home.png", start: 39, duration: 16 }, // 0:39 - 0:55
    { src: "hourglass_time.png", start: 55, duration: 10 }, // 0:55 - ...
];

export const VoiceDiary: React.FC = () => {
    const { fps } = useVideoConfig();

    return (
        <AbsoluteFill style={{ backgroundColor: "black" }}>
            <AbsoluteFill>
                {images.map((img, index) => (
                    <Sequence 
                        key={index} 
                        from={img.start * fps} 
                        durationInFrames={(img.duration + 1) * fps} // Make sure no gaps
                    >
                        <Img 
                            src={staticFile(`generated_images/${img.src}`)} 
                            style={{ 
                                width: '100%', 
                                height: '100%', 
                                objectFit: 'cover',
                                filter: 'brightness(0.5)' 
                            }} 
                        />
                    </Sequence>
                ))}
            </AbsoluteFill>
            <Audio src={staticFile("temp_assets/2025-03-19-05-f-お父さんの自殺について.m4a")} />
            <Subtitles />
        </AbsoluteFill>
    );
};
