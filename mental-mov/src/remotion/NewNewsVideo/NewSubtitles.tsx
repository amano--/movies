import { parseSrt, Caption } from "@remotion/captions";
import {
  delayRender,
  cancelRender,
  continueRender,
  staticFile,
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { useState, useEffect, useCallback, useMemo } from "react";

interface SubtitlesProps {
    source: string;
    onMoodChange?: (mood: 'neutral' | 'smile' | 'sad' | 'excited' | 'angry') => void;
}

export const NewSubtitles: React.FC<SubtitlesProps> = ({ source, onMoodChange }) => {
  const [captions, setCaptions] = useState<Caption[]>([]);
  const [handle] = useState(() => delayRender());
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const fetchCaptions = useCallback(async () => {
    try {
      const res = await fetch(staticFile(source));
      const text = await res.text();
      const { captions } = parseSrt({ input: text });
      setCaptions(captions);
      continueRender(handle);
    } catch (e) {
      cancelRender(e);
    }
  }, [handle, source]);

  useEffect(() => {
    fetchCaptions();
  }, [fetchCaptions]);

  const currentCaption = useMemo(() => {
    return captions.find((c) => {
      const startFrame = (c.startMs / 1000) * fps;
      const endFrame = (c.endMs / 1000) * fps;
      return frame >= startFrame && frame <= endFrame;
    });
  }, [captions, frame, fps]);

  const opacity = useMemo(() => {
    if (!currentCaption) return 0;
    
    const startFrame = (currentCaption.startMs / 1000) * fps;
    const endFrame = (currentCaption.endMs / 1000) * fps;
    const durationInFrames = endFrame - startFrame;
    const fadeDuration = Math.min(10, durationInFrames / 2);

    const progress = frame - startFrame;

    if (progress < fadeDuration) {
        return progress / fadeDuration;
    }
    const timeRemaining = endFrame - frame;
    if (timeRemaining < fadeDuration) {
        return timeRemaining / fadeDuration;
    }
    
    return 1;
  }, [currentCaption, frame, fps]);

  const textToShow = useMemo(() => {
    if (!currentCaption) return "";
    const startFrame = (currentCaption.startMs / 1000) * fps;
    const endFrame = (currentCaption.endMs / 1000) * fps;
    const durationInFrames = endFrame - startFrame;
    const progress = frame - startFrame;
    
    const typeDuration = durationInFrames * 0.8; 
    const percent = Math.min(1, Math.max(0, progress / typeDuration));
    
    return currentCaption.text.slice(0, Math.floor(currentCaption.text.length * percent));
  }, [currentCaption, frame, fps]);
  // Mood detection
  useEffect(() => {
    if (!onMoodChange) return;
    
    let nextMood: 'neutral' | 'smile' | 'sad' | 'excited' | 'angry' = 'neutral';
    
    if (currentCaption) {
        const text = currentCaption.text;
        
        // Priority: Angry > Excited > Sad > Smile
        const isAngry = 
            text.includes("怒") || 
            text.includes("ふざけ") || 
            (text.includes("殺") && !text.includes("自殺")) || 
            text.includes("許さ") || 
            text.includes("ムカ") || 
            text.includes("くそ") || 
            text.includes("クソ");

        const isExcited = 
            text.includes("興奮") || 
            text.includes("すごい") || 
            text.includes("スゴイ") || 
            text.includes("凄い") || 
            text.includes("やばい") || 
            text.includes("ヤバ") || 
            text.includes("驚") || 
            text.includes("叫") || 
            text.includes("!") || 
            text.includes("！");

        const isSad = 
            text.includes("悲しい") || 
            text.includes("辛い") || 
            text.includes("つらい") || 
            text.includes("泣") || 
            text.includes("死") || 
            text.includes("自殺") || 
            text.includes("うつ") || 
            text.includes("鬱") || 
            text.includes("しんどい") || 
            text.includes("暗い") || 
            text.includes("涙") || 
            text.includes("哀") || 
            text.includes("切ない") || 
            text.includes(";;") || 
            text.includes("；；");

        const isSmile = 
            text.includes("笑") || 
            text.includes("www") || 
            text.includes("w") || 
            text.includes("ｗ") || 
            text.includes("嬉しい") || 
            text.includes("楽しい");

        if (isAngry) nextMood = 'angry';
        else if (isExcited) nextMood = 'excited';
        else if (isSad) nextMood = 'sad';
        else if (isSmile) nextMood = 'smile';
    }
    
    onMoodChange(nextMood);
  }, [currentCaption, onMoodChange]);

  if (!currentCaption) return null;

  return (
    <AbsoluteFill
      style={{
        justifyContent: "flex-end",
        alignItems: "flex-start", 
        paddingBottom: 10,
        paddingLeft: 40,
        paddingRight: 280, 
      }}
    >
      {currentCaption && (
        <div
          style={{
            opacity: opacity, 
            fontSize: 36, 
            color: "white",
            textShadow: "0px 2px 4px rgba(0,0,0,0.8)", 
            textAlign: "left",
            padding: "20px 40px", 
            background: "rgba(0,0,0,0.6)", 
            width: "auto", 
            borderRadius: 20, 
            marginBottom: 20,
            fontWeight: 'bold',
            border: '1px solid rgba(255,255,255,0.1)' 
          }}
        >
          {textToShow}
        </div>
      )}
    </AbsoluteFill>
  );
};
