export type PlayerName = string;
export type Report = {
    crewmates: PlayerName[],
    impostors: PlayerName[],
    winners: 'crewmates' | 'impostors'
};
