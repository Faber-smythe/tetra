import { GUIProps } from "../types/GUIPropTypes";
import { useEffect, useState } from "react";
import Slider from "@mui/material/Slider";
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { themeOptions } from "../utils";
import AltRouteIcon from '@mui/icons-material/AltRoute';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import ShareIcon from '@mui/icons-material/Share';

export default function GUI({
  gameDataString,
  handleHistorySliding,
  handleRestartGame,
}: GUIProps) {
  //   let positionIndex = gameDataString.length;
  const [positionIndex, setPositionIndex] = useState(gameDataString.length);
  const [sliderWidth, setSliderWidth] = useState(60);

  useEffect(() => {
    setPositionIndex(gameDataString.length);

    // adapt slider width to game length
    console.log(60 + gameDataString.length * 30)
    if (60 + gameDataString.length * 30 < window.innerWidth * .9) {
      setSliderWidth(60 + gameDataString.length * 30)
    }
  }, [gameDataString]);

  // const handleSlide = (value: number | number[]) => {
  const handleSlide = (value: number) => {
    setPositionIndex(value as number);
    handleHistorySliding(value as number);
  };

  const forkGame = () => {
    const targetGameData = gameDataString.slice(0, positionIndex)
    console.log("forking at : ", targetGameData)
    window.open(`/?gameData=${targetGameData}`, "_blank")
  }

  const copyGameLink = () => {
    navigator.clipboard.writeText(window.location.href)
    window.alert("The link to this game has been copied to your clipboard. Send it to someone or open it in any browser !")
  }

  const theme = createTheme(themeOptions);
  return (
    <ThemeProvider theme={theme}>
      <div id="top-GUI">
        <div>
          <span title="Recommencer la partie">
            <RestartAltIcon className="UI-icon" onClick={handleRestartGame} color="primary"></RestartAltIcon>
          </span>
          <span title="Copier l'état actuel dans un nouvel onglet">
            <AltRouteIcon className="UI-icon" onClick={forkGame} color="primary"></AltRouteIcon>
          </span>
        </div>
        <div>
          <span title="Partager la partie">
            <ShareIcon className="UI-icon" onClick={copyGameLink} color="primary"></ShareIcon>
          </span>
        </div>
      </div>
      <div id="bottom-GUI" style={{ width: `${sliderWidth}px` }}>
        <span title="Coup précédent" style={{ visibility: (positionIndex > 0 ? "visible" : "hidden") }}>
          <ArrowBackIosNewIcon className="UI-icon" color="secondary" onClick={(e) => { handleSlide(positionIndex - 1) }} />
        </span>
        <Slider
          aria-label="Game turns"
          value={positionIndex}
          onChange={(e) => { handleSlide((e.target as HTMLInputElement).value as any as number) }}
          step={1}
          marks
          min={0}
          max={gameDataString.length}
          valueLabelDisplay="on"
        ></Slider>
        <span title="Coup suivant" style={{ marginLeft: ".5rem", visibility: (positionIndex < gameDataString.length ? "visible" : "hidden") }}>
          <ArrowForwardIosIcon className="UI-icon" color="secondary" onClick={(e) => { handleSlide(positionIndex + 1) }} />
        </span>
      </div>
    </ThemeProvider >
  );
}
