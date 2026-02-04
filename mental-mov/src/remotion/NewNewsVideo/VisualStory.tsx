import React, { useMemo } from 'react';
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';

interface MovingImageProps {
    src: string;
    startFrame: number;
    endFrame: number;
    animationType?: 'zoomIn' | 'zoomOut' | 'panRight' | 'panLeft';
}

const MovingImage: React.FC<MovingImageProps> = ({ src, startFrame, endFrame, animationType = 'zoomIn' }) => {
    const frame = useCurrentFrame();
    const duration = endFrame - startFrame;
    const progress = frame - startFrame;

    const scale = useMemo(() => {
        if (animationType === 'zoomIn') {
            return interpolate(progress, [0, duration], [1, 1.15]);
        }
        if (animationType === 'zoomOut') {
            return interpolate(progress, [0, duration], [1.15, 1]);
        }
        return 1.1; // Default for pans
    }, [animationType, duration, progress]);

    const translateX = useMemo(() => {
        if (animationType === 'panRight') {
            return interpolate(progress, [0, duration], [-20, 20]);
        }
        if (animationType === 'panLeft') {
            return interpolate(progress, [0, duration], [20, -20]);
        }
        return 0;
    }, [animationType, duration, progress]);

    const opacity = useMemo(() => {
        // Fade in/out
        const fadeIn = interpolate(progress, [0, 30], [0, 1], { extrapolateRight: 'clamp' });
        // Fade out at end? No, usually next clip covers it or hard cut. Let's do crossfade logic in parent or just simple fade in.
        return fadeIn;
    }, [progress]);

    // Active only during its time
    if (frame < startFrame || frame > endFrame) return null;

    return (
        <AbsoluteFill style={{ overflow: 'hidden' }}>
            <Img
                src={staticFile(src)}
                style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    transform: `scale(${scale}) translateX(${translateX}px)`,
                    opacity: opacity,
                }}
            />
        </AbsoluteFill>
    );
};

import { STORY_MANIFEST } from './storyManifest';

export const VisualStory: React.FC = () => {
    const frame = useCurrentFrame();
    
    // Constants for 15-second rhythm
    const SCENE_DURATION_FRAMES = 450; // 15 seconds * 30fps
    const CHUNK_DURATION_FRAMES = 9000; // 5 minutes * 60s * 30fps
    
    // Calculate current Chunk and Scene indices
    // Chunks are 1-based (chunk_01, chunk_02...)
    // Scenes are 1-based (scene_01, scene_02... scene_20)
    
    const currentChunkIndex = Math.floor(frame / CHUNK_DURATION_FRAMES) + 1;
    const frameInChunk = frame % CHUNK_DURATION_FRAMES;
    const currentSceneIndex = Math.floor(frameInChunk / SCENE_DURATION_FRAMES) + 1;
    
    const safeChunkIdx = Math.min(Math.max(currentChunkIndex, 1), 6);
    const safeSceneIdx = Math.min(Math.max(currentSceneIndex, 1), 20);
    
    const pad = (num: number) => num.toString().padStart(2, '0');
    const chunkName = `chunk_${pad(safeChunkIdx)}`;
    
    // Lookup filename from Manifest
    // Manifest structure: { "chunk_01": [ "project/.../scene_01_name.png", ... ] }
    // Array is 0-indexed, so we use safeSceneIdx - 1
    const chunkFiles = STORY_MANIFEST[chunkName] || [];
    const fileIndex = safeSceneIdx - 1;
    
    // Graceful fallback if index out of bounds (though organise_assets ensures 20 slots)
    const imagePath = chunkFiles[fileIndex] || chunkFiles[0] || 'project_2025_03/mood_pondering.png';
    
    // Animation variation
    const animTypes: ('zoomIn' | 'zoomOut' | 'panRight' | 'panLeft')[] = ['zoomIn', 'panRight', 'zoomOut', 'panLeft'];
    const animType = animTypes[(safeSceneIdx + safeChunkIdx) % animTypes.length]; 
    
    // Key must change when path changes to reset animation
    const uniqueKey = imagePath; 
    
    const startFrameGlobal = (safeChunkIdx - 1) * CHUNK_DURATION_FRAMES + (safeSceneIdx - 1) * SCENE_DURATION_FRAMES;
    const endFrameGlobal = startFrameGlobal + SCENE_DURATION_FRAMES;

    return (
        <AbsoluteFill style={{ backgroundColor: 'black' }}>
             <MovingImage 
                 key={uniqueKey} 
                 src={imagePath} 
                 startFrame={startFrameGlobal} 
                 endFrame={endFrameGlobal} 
                 animationType={animType}
             />
        </AbsoluteFill>
    );
};
