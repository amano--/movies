import { Img, staticFile, useCurrentFrame } from "remotion";

const NEWS_TOPICS = [
    { start: 0, src: 'project_2025_03/topic_1_ageha.png', title: '小悪魔アゲハ？' },   // 0:00 - ~0:27
    { start: 810, src: 'project_2025_03/topic_2_silence.png', title: '父は「無」' }, // 0:27 (27*30=810) - ~0:45
    { start: 1350, src: 'project_2025_03/topic_3_tokyo.png', title: '上京と疎遠' },   // 0:45 (45*30=1350) - ...
];

export const NewsFrame: React.FC = () => {
    const frame = useCurrentFrame();
    // const { fps } = useVideoConfig(); // Unused

    const currentTopic = [...NEWS_TOPICS].reverse().find(t => frame >= t.start) || NEWS_TOPICS[NEWS_TOPICS.length - 1];

    return (
        <div style={{
            position: 'absolute',
            top: 50,
            left: 50,
            width: '768px',
            height: '432px',
            backgroundColor: '#002',
            border: '5px solid #fff',
            borderRadius: '10px',
            overflow: 'hidden',
            boxShadow: '0 10px 20px rgba(0,0,0,0.5)',
            display: 'flex',
            flexDirection: 'column',
        }}>
            {/* Header */}
            <div style={{
                backgroundColor: '#d00',
                color: 'white',
                padding: '10px 20px',
                fontWeight: 'bold',
                fontSize: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
            }}>
                <span>NEWS LIVE</span>
                <span style={{ fontSize: '16px', opacity: 0.8 }}>🔴 LIVE</span>
            </div>

            {/* Image Content */}
            <div style={{ flex: 1, position: 'relative' }}>
                <Img 
                    src={staticFile(currentTopic.src)}
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        opacity: 0.9
                    }}
                />
                
                {/* Overlay Text */}
                <div style={{
                    position: 'absolute',
                    bottom: 0,
                    width: '100%',
                    background: 'rgba(0,0,0,0.7)',
                    color: 'white',
                    padding: '10px',
                    fontSize: '24px',
                    fontWeight: 'bold'
                }}>
                    {currentTopic.title}
                </div>
            </div>
        </div>
    );
};
