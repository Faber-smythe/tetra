import Pile from "../components/Pile";

export interface GUIProps {
  gameDataString: string;
  handleRestartGame: () => void;
  handleHistorySliding: (value: number) => void;
  devmode: boolean
}
