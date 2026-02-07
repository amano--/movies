import React from 'react';
import { AbsoluteFill, Img, staticFile, useCurrentFrame } from 'remotion';

interface CasterProps {
    mood?: 'neutral' | 'smile' | 'sad' | 'excited' | 'angry';
}

export const Caster: React.FC<CasterProps> = ({ mood = 'neutral' }) => {
    const frame = useCurrentFrame();
    
    let basePath = 'project_2025_03/caster/husky/neutral/frames';
    if (mood === 'smile') basePath = 'project_2025_03/caster/husky/smile/frames';
    if (mood === 'sad') basePath = 'project_2025_03/caster/husky/sad/frames';
    if (mood === 'excited') basePath = 'project_2025_03/caster/husky/excited/frames';
    if (mood === 'angry') basePath = 'project_2025_03/caster/husky/angry/frames';

    return (
        <AbsoluteFill style={{
            justifyContent: 'flex-end',
            alignItems: 'flex-end',
            padding: 0, // No padding, stick to corner
        }}>
            <div style={{
                width: 300, 
                height: 300,
                overflow: 'hidden',
                zIndex: 100,
            }}>
                <Img
                    src={staticFile(`${basePath}/frame_${String((frame % 181) + 1).padStart(3, '0')}.png`)}
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                    }}
                />
            </div>
        </AbsoluteFill>
    );
};
