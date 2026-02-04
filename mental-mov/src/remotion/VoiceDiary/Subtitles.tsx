import { parseSrt, Caption } from "@remotion/captions";
import {
  useDelayRender,
  cancelRender,
  continueRender,
  staticFile,
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { useState, useEffect, useCallback, useMemo } from "react";

export const Subtitles: React.FC = () => {
  const [captions, setCaptions] = useState<Caption[]>([]);
  const { delayRender, continueRender, cancelRender } = useDelayRender();
  const [handle] = useState(() => delayRender());
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const fetchCaptions = useCallback(async () => {
    try {
      const res = await fetch(
        staticFile("temp_assets/2025-03-19-05-f-お父さんの自殺について.srt"),
      );
      const text = await res.text();
      const { captions } = parseSrt({ input: text });
      setCaptions(captions);
      continueRender(handle);
    } catch (e) {
      cancelRender(e);
    }
  }, [handle, continueRender, cancelRender]);

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
        paddingBottom: 100,
      }}
    >
      {currentCaption && (
        <div
          style={{
            fontSize: 40,
            color: "white",
            textShadow: "2px 2px 4px rgba(0,0,0,0.8)",
            textAlign: "center",
            padding: "0 40px",
            fontFamily: "sans-serif",
          }}
        >
          {currentCaption.text}
        </div>
      )}
    </AbsoluteFill>
  );
};
