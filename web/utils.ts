import { EnhancedPlayer } from "./types";

export function formatRecord(num: number, den: number): string {
    return `${num} - ${num + den}`;
}

export function getPercentage(num: number, den: number): number {
    if (den == 0) {
        return 0;
    }
    return num / den * 100;
}

export function formatPercentage(num: number): string {
    return num.toFixed(2) + "%";
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
