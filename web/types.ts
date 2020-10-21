import { Player } from '../scripts/ranking';

export type EnhancedPlayer = {
    impostorPercentage: number,
    crewmatePercentage: number,
    totalWins: number,
    totalGames: number,
    totalPercentage: number,
} & Player;

export type SortType = 'total' | 'impostor' | 'crewmate';
export type SortOrder = 'increasing' | 'nonIncreasing';
export type SortCombined = {
    _type: SortType,
    order: SortOrder,
}
