import { AbsoluteFill, Video, staticFile } from "remotion";

export const DebugCaster: React.FC = () => {
    return (
        <AbsoluteFill style={{ 
            backgroundColor: 'red', 
            justifyContent: 'flex-end', 
            alignItems: 'flex-end',
            padding: 30
        }}>
            {/* Simple Video Test */}
            <Video 
                src={staticFile("project_2025_03/caster.mp4")} 
                style={{
                    width: 500, // Explicit size
                    border: '5px solid blue', // Visible border
                }}
            />
        </AbsoluteFill>
    );
};
