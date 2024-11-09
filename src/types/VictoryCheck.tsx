import Pearl from "../components/Pearl"

export default interface VictoryCheck {
  won: "White" | "Black" | null
  alignedPearls: Pearl[]
}