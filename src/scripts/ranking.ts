import * as fs from 'fs';
import * as ioe from 'fp-ts/lib/IOEither';
import { pipe } from 'fp-ts/lib/function';
import { toError } from 'fp-ts/lib/Either';
import * as e from 'fp-ts/lib/Either';
import { IOEither, tryCatch } from 'fp-ts/lib/IOEither';
import * as o from 'fp-ts/lib/Option';
import { Option } from 'fp-ts/lib/Option';

export type Name = string;

export type Player = {
    name: Name,
    impostorGames: number,
    impostorWins: number,
    crewmateGames: number,
    crewmateWins: number,
}

export type RankingDatabase = {
    [_: string]: Player | undefined,
}

export type RankingOperations = {
    get: (_: Name) => Option<Player>,
    getOrCreate: (_: Name) => Player,
    save: (path: string) => IOEither<Error, void>,
}

// type Ranking = RankingDatabase & RankingOperations;

export function loadRanking(path: string): IOEither<Error, RankingDatabase> {
    return pipe(
        loadFile(path),
        ioe.chain<Error, string, RankingDatabase>(parseRanking)
    )
}

function loadFile(path: string): IOEither<Error, string> {
    return tryCatch(() => fs.readFileSync(path, 'utf8'), toError);
}

const saveFile = (path: string) => (data: string) =>
    tryCatch(() => fs.writeFileSync(path, data), toError)

function parseRanking(obj: string): IOEither<Error, RankingDatabase> {
    return tryCatch(() => JSON.parse(obj), toError);
}

export function enableOperations(database: RankingDatabase): RankingOperations {
    const get = (name: Name) => o.fromNullable(database[name])
    const getOrCreate = (name: Name) => pipe(
        get(name),
        o.getOrElse<Player>(() => {
            const player = createPlayer(name)
            database[name] = player;
            return player;
        }),
    )

    const save = (path: string) => pipe(
        database,
        d => JSON.stringify(d, undefined, 4),
        saveFile(path)
    );

    return {
        get,
        getOrCreate,
        save,
    };
}

const createPlayer: (_: Name) => Player = (name) => ({
    name,
    crewmateGames: 0,
    crewmateWins: 0,
    impostorGames: 0,
    impostorWins: 0
})

export const action = pipe(
    loadRanking('ranking.json'),
)

// try {
//     const action = pipe(
//         loadRanking('ranking.json'),
//         ioe.map(enableOperations),
//     );
//     const res = e.fold<Error, RankingOperations, void>(e => console.log(e), r => {
//         const ugo = r.getOrCreate('Ello');
//         ugo.crewmateGames += 1;
//         ugo.crewmateWins += 1;
//         console.log('ugo modificato', ugo)
//         console.log('the original one', r.getOrCreate('Ello'))
//         r.save('ranking2.json')()
//     })(action())
//     console.log(res)
// } catch(err) {
//     console.error('errore', err)
// }
// action()
// console.log(res);
