import { pipe, Lazy } from 'fp-ts/lib/function';
import * as ioe from 'fp-ts/lib/IOEither';
import * as e from 'fp-ts/lib/Either';
import * as o from 'fp-ts/lib/Option';
import { Either } from 'fp-ts/lib/Either';
import { enableOperations, loadRanking, Name, Player, RankingOperations, Score } from './ranking';

type Map2<A, B, C> = (a: A, b: B) => C
const map2 = <A, B, C>(f: (a: A, b: B) => C) => (a: A, b: B) => f(a, b)

const RANKING_FILE = 'data/ranking.json';

export const combineScores: Map2<Score, Score, Score> = (main: Score, alias: Score) => ({
    impostorGames: main.impostorGames + alias.impostorGames,
    impostorWins: main.impostorWins + alias.impostorWins,
    crewmateGames: main.crewmateGames + alias.crewmateGames,
    crewmateWins: main.crewmateWins + alias.crewmateWins,
})

export const combinePlayers: Map2<Player, Player, Player> = (original: Player, alias: Player) => {
    const { name } = original
    return { ...map2(combineScores)(original, alias), name };
}

const couldntFindError = (name: string): Lazy<Error> => () => new Error(`Couldn't find ${name}.`)
const couldntUpdateError = (name: string): Lazy<Error> => () => new Error(`Couldn't update ${name}.`)
const couldntRemoveError = (name: string): Lazy<Error> => () => new Error(`Couldn't remove ${name}.`)

export const getPlayers: (n1: Name, n2: Name) => (op: RankingOperations) => Either<Error, [Player, Player]> =
    (name, alias) => (op) => {
        return pipe(
            op.get(name),
            e.fromOption(couldntFindError(name)),
            e.chain((n) =>
                e.map<Player, [Player, Player]>((a: Player) => [n, a])
                    (e.fromOption(couldntFindError(alias))(op.get(alias)))
            ),
        )
    }

const mergePlayers = (name: Name, alias: Name) => (op: RankingOperations) =>
    pipe(
        getPlayers(name, alias)(op),
        e.map(([p1, p2]: [Player, Player]) => combinePlayers(p1, p2)),
        e.chain((updated) => e.fromOption(couldntUpdateError(name))(op.update(name)(updated))),
        e.chain(() => e.fromOption(couldntRemoveError(alias))(op.remove(alias)))
    )

const logError = (error: Error) => console.error(error);

function whoAreYou(name: Name, alias: Name) {
    return pipe(
        loadRanking(RANKING_FILE),
        ioe.map(enableOperations),
        ioe.chain(op =>
            pipe(
                ioe.fromEither(mergePlayers(name, alias)(op)),
                ioe.chain(() => op.save(RANKING_FILE))
            )
        ),
    )
}

const usage = [
    'Who are you? (merge your main account score with your alias one)',
    `Usage: ${process.argv0} <name> <alias>`
].join('\n\r')

function main(args: string[]) {
    const name = e.fromNullable(usage)(args[2])
    const alias = e.fromNullable(usage)(args[3])

    pipe(
        name,
        e.chain((n) =>
            e.map((a: string) => [n, a])(alias)
        ),
        e.fold(
            (error) => console.log(error),
            ([n, a]) => pipe(
                whoAreYou(n, a)(),
                e.fold(logError, () => console.log('Saved successfully.'))
            )
        ),
    )
}

main(process.argv)
