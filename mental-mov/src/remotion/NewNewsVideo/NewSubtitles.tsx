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
}

export const NewSubtitles: React.FC<SubtitlesProps> = ({ source }) => {
  const [captions, setCaptions] = useState<Caption[]>([]);
  // const [handle] = useState(() => delayRender()); // Standard Remotion
  // But to avoid conflicts if useDelayRender is a thing, I will check what's going on.
  // Actually, standard is: import { delayRender } from 'remotion'.
  // I will assume standard API.
  
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

  return (
    <AbsoluteFill
      style={{
        justifyContent: "flex-end",
        alignItems: "center",
        paddingBottom: 50,
      }}
    >
      {currentCaption && (
        <div
          style={{
            fontSize: 40, // Reduced from 60
            color: "white",
            textShadow: "0px 2px 10px rgba(0,0,0,0.8)", // Softer but visible shadow
            textAlign: "center",
            padding: "10px 40px",
            fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
            background: "linear-gradient(to top, rgba(0,0,0,0.8), rgba(0,0,0,0))", // Gradient fade instead of box
            width: "100%", // Full width
            paddingBottom: "80px", // Align text higher up within the gradient
            fontWeight: 'bold',
          }}
        >
          {currentCaption.text}
        </div>
      )}
    </AbsoluteFill>
  );
};
