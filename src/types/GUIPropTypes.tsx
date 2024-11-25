import Pile from "../components/Pile";

export interface GUIProps {
  gameDataString: string;
  handleHistorySliding: (value: number) => void;
}
