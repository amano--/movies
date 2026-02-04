import { Img, staticFile, useCurrentFrame, interpolate, useVideoConfig } from "remotion";
import { Caption, parseSrt } from "@remotion/captions";
import { useState, useCallback, useEffect, useMemo } from "react";

interface CharacterProps {
    imageSrc?: string; // Kept for backward compat but unused if subtitleSource is present
    subtitleSource: string;
}

// Map of asset names
const ASSETS = {
    normal: 'project_2025_03/husky_normal.png', 
    talk_a: 'project_2025_03/husky_talk_a.png',
    talk_i: 'project_2025_03/husky_talk_i.png',
    talk_big: 'project_2025_03/husky_talk_big.png',
    closed: 'project_2025_03/husky_closed.png',
    happy: 'project_2025_03/husky_happy.png'
};

export const Character: React.FC<CharacterProps> = ({ subtitleSource }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig(); 
    const [captions, setCaptions] = useState<Caption[]>([]);

    const fetchCaptions = useCallback(async () => {
        try {
            const res = await fetch(staticFile(subtitleSource));
            const text = await res.text();
            const { captions } = parseSrt({ input: text });
            setCaptions(captions);
        } catch (e) {
            console.error("Failed to load captions for lip sync", e);
        }
    }, [subtitleSource]);

    useEffect(() => {
        fetchCaptions();
    }, [fetchCaptions]);

    // Check if currently speaking based on subtitles
    const currentCaption = useMemo(() => {
        return captions.find((c) => {
            const startFrame = (c.startMs / 1000) * fps;
            const endFrame = (c.endMs / 1000) * fps;
            return frame >= startFrame && frame <= endFrame;
        });
    }, [captions, frame, fps]);

    const isSpeaking = !!currentCaption;

    // Determine which image to show
    let currentImage = ASSETS.normal;

    if (isSpeaking) {
        // Pseudo random talking animation
        // Cycle: Normal -> A -> Big -> I -> A -> ...
        const cycle = Math.floor(frame / 3) % 4; // Change every 3 frames
        if (cycle === 0) currentImage = ASSETS.talk_a;
        else if (cycle === 1) currentImage = ASSETS.talk_big;
        else if (cycle === 2) currentImage = ASSETS.talk_i;
        else currentImage = ASSETS.talk_a;
    } else {
        // Idle animation: Blink every few seconds
        const blinkCycle = frame % 150; // Every 5 seconds (30fps)
        if (blinkCycle < 5) {
            currentImage = ASSETS.closed; // Blink for 5 frames
        } else {
            currentImage = ASSETS.normal;
        }
    }

    // Reaction Logic: Check keywords in current caption to override expression
    if (currentCaption) {
        const text = currentCaption.text;
        if (text.includes("笑") || text.includes("面白い") || text.includes("ハハ")) {
             // Happy / Laughing
             const cycle = Math.floor(frame / 4) % 2;
             currentImage = cycle === 0 ? ASSETS.happy : ASSETS.talk_i; 
        }
    }

    // "Over-reaction" animation
    // Rapid bobbing and rotation
    
    // Only bob aggressively when speaking
    
    const bobIntensity = isSpeaking ? 15 : 2;
    const rotIntensity = isSpeaking ? 1.5 : 0.2;

    const bob = interpolate(
        Math.sin(frame / 2),
        [-1, 1],
        [0, bobIntensity]
    );

    const rotation = interpolate(
        Math.sin(frame / 3),
        [-1, 1],
        [-rotIntensity, rotIntensity]
    );

    const scale = interpolate(
        Math.sin(frame / 1.5),
        [-1, 1],
        [1, 1.02]
    );
     // If speaking, modulate faster
    const speakingOpen = isSpeaking ? Math.sin(frame * 1.5) * 0.05 : 0;


    return (
        <div style={{
            position: 'absolute',
            bottom: -50,
            left: '30%', // Shift to right third? No, news caster usually sits center-right or center.
            // If image is 1152x1152 (full canvas), and video is 1152x648.
            // The image content (face) is at Top-Center of 1152x1152.
            // Top-Center of Image is aligned to... where?
            // We want face to be visible.
            
            // Image is square 1152x1152.
            // Video is 1152x648.
            // If we place at bottom 0, the top (face) might be cut off if it's high up?
            // In align_images, we put face at PADDING_TOP = 50.
            // So face is at y=50 in the 1152px image.
            
            // If we display this 1152px image in a 648px high video...
            // If we align bottom of image to bottom of video... y=0 of image starts way below video.
            // Wait, 1152 height > 648 height.
            // If bottom=0, the top of image (y=0) is at -504 relative to video top? (648 - 1152 = -504).
            // So y=50 (face) is at -454. It's off screen TOP.
            
            // We need to pull the image DOWN.
            // Top of image should be near Top of video.
            top: 0,
            width: '100%', // Match video width
            transform: `translateY(${bob}px) rotate(${rotation}deg) scale(${scale}) scaleY(${1 + speakingOpen})`,
            transformOrigin: 'bottom center',
        }}>
           <Img 
                src={staticFile(currentImage)}
                style={{
                    width: '100%',
                    height: 'auto',
                }}
           />
        </div>
    );
};

