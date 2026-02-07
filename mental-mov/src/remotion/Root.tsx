import { Composition } from "remotion";
import { Main } from "./MyComp/Main";
import {
  COMP_NAME,
  defaultMyCompProps,
  DURATION_IN_FRAMES,
  VIDEO_FPS,
  VIDEO_HEIGHT,
  VIDEO_WIDTH,
} from "../../types/constants";
import { NextLogo } from "./MyComp/NextLogo";
import { NewNewsVideo } from "./NewNewsVideo";
import { DebugCaster } from "./NewNewsVideo/DebugCaster";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id={COMP_NAME}
        component={Main}
        durationInFrames={DURATION_IN_FRAMES}
        fps={VIDEO_FPS}
        width={VIDEO_WIDTH}
        height={VIDEO_HEIGHT}
        defaultProps={defaultMyCompProps}
      />
      <Composition
        id="NextLogo"
        component={NextLogo}
        durationInFrames={300}
        fps={30}
        width={140}
        height={140}
        defaultProps={{
          outProgress: 0,
        }}
      />
      <Composition
        id="NewNewsVideo"
        component={NewNewsVideo}
        durationInFrames={45500} // End at approx 25m 16s
        fps={30}
        width={1152}
        height={648}
      />
      <Composition
        id="DebugCaster"
        component={DebugCaster}
        durationInFrames={300}
        fps={30}
        width={1152}
        height={648}
      />
    </>
  );
};
