import { lower_bound_wilson } from "./statistics";
import { EnhancedPlayer } from "./types";

export function formatRecord(win: number, total: number): string {
    return `${win} - ${total - win}`;
}

export function getScore(num: number, den: number): number {
    return lower_bound_wilson(num, den);
}

export function formatScore(num: number): string {
    return num.toFixed(4);
}

export type Extractor = {
    ([a, b]: [EnhancedPlayer, EnhancedPlayer]): [number, number]
};

export function totalPercentage([a, b]: [EnhancedPlayer, EnhancedPlayer]): [number, number] {
    return [a.totalPercentage, b.totalPercentage]
}

export function impostorPercentage([a, b]: [EnhancedPlayer, EnhancedPlayer]): [number, number] {
    return [a.impostorPercentage, b.impostorPercentage]
}

export function crewmatePercentage([a, b]: [EnhancedPlayer, EnhancedPlayer]): [number, number] {
    return [a.crewmatePercentage, b.crewmatePercentage]
}

export function increasing([a, b]: [number, number]): number {
    return a - b;
}

export function nonIncreasing(args: [number, number]): number {
    return -(increasing(args));
}


export const combine = <A, B, C>(f: (_:A) => B) => (g: (__: B) => C): (___: A) => C =>
    (a) => g(f(a));

export const pair = <A>(a: A) => (b: A): [A, A] => [a, b];

export const applyAsTuple = <A, B, C>(f: (_ac: [A, B]) => C) => (a: A, b: B) => f([a, b]);
