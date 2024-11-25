import Slider from "@mui/material/Slider";
import { GUIProps } from "../types/GUIPropTypes";
import { useEffect, useState } from "react";
import Pile from "./Pile";

export default function GUI({
  gameDataString,
  handleHistorySliding
}: GUIProps) {
  //   let positionIndex = gameDataString.length;
  const [positionIndex, setPositionIndex] = useState(gameDataString.length);

  useEffect(() => {
    setPositionIndex(gameDataString.length);
  }, [gameDataString]);

  const handleSlide = (e: Event, value: number | number[]) => {
    setPositionIndex(value as number);
    handleHistorySliding(value as number);
  };
  return (
    <>
      <div className="top-GUI"></div>
      <div id="bottom-GUI">
        <Slider
          aria-label="Game turns"
          value={positionIndex}
          onChange={handleSlide}
          step={1}
          marks
          min={0}
          max={gameDataString.length}
          valueLabelDisplay="on"
        ></Slider>
      </div>
    </>
  );
}
