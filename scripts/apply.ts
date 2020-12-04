import * as a from 'fp-ts/lib/Array';
import * as e from 'fp-ts/lib/Either';
import { Either } from 'fp-ts/lib/Either';
import { pipe } from 'fp-ts/lib/function';
import * as ioe from 'fp-ts/lib/IOEither';
import * as fs from 'fs';
import { RANKING_FILE } from './constants';
import { enableOperations, loadFile, loadRanking, RankingOperations } from './ranking';
import { Report } from './types';
import { logError } from './utils';

const usage = [
    'Apply reports to the ranking file',
    `Usage: ${process.argv0} report1 [report2 [report3 [....]]]`
].join('\n\r')

function parseReport(obj: string): ioe.IOEither<Error, Report> {
    return ioe.tryCatch(() => JSON.parse(obj), e.toError);
}

function readReports(paths: string[]): ioe.IOEither<Error, Report[]> {
    return pipe(
        paths.map(loadFile),
        a.array.sequence(ioe.ioEither),
        ioe.chain(s => pipe(
            s.map(parseReport),
            a.array.sequence(ioe.ioEither),
        )),
    );
}

const applyReport = ({ crewmates, impostors, winners }: Report) => (ranking: RankingOperations): Either<Error, RankingOperations> => {
    try {
        if (!(winners === "crewmates" || winners === "impostors")) {
            return e.throwError(new TypeError('Couldn\'t read property \'winners\'.'))
        }
        const win = {
            crewmates: winners === 'crewmates' ? 1 : 0,
            impostors: winners === 'impostors' ? 1 : 0,
        }
        crewmates.forEach(name => {
            const player = ranking.getOrCreate(name);
            player.crewmateGames += 1;
            player.crewmateWins += win.crewmates;
        });

        impostors.forEach(name => {
            const player = ranking.getOrCreate(name);
            player.impostorGames += 1;
            player.impostorWins += win.impostors;
        })
        return e.right(ranking);
    } catch(err) {
        return e.left(new TypeError('Couldn\'t read one of the following properties: [\'impostors\', \'crewmates\', \'winners\'].'));
    }
}

const applyReports = (op: RankingOperations) => (reports: Report[]) => pipe(
    reports.map(applyReport).map(f => f(op)),
    a.array.sequence(e.either),
    ioe.fromEither
)

function removeFiles(paths: string[]): ioe.IOEither<Error, void[]> {
    return ioe.tryCatch(() => paths.map(fs.unlinkSync), e.toError);
}

function main(args: string[]) {
    if (args.length > 0) {
        pipe(
            loadRanking(RANKING_FILE),
            ioe.map(enableOperations),
            ioe.chain<Error, RankingOperations, RankingOperations[]>(op =>
                ioe.chain<Error, Report[], RankingOperations[]>(applyReports(op))(readReports(args))
            ),
            ioe.map(ops => ops[0]),
            ioe.chain(op => op.save(RANKING_FILE)),
            a => a(),
            e.mapLeft(e => {
                logError(e)
                return e;
            }),
            e.map(
                () => console.log('Saved successfully.')
            ),
            ioe.fromEither,
            ioe.chain(() => removeFiles(args)),
            a => a(),
            e.fold(
                logError,
                () => console.log('Files removed successfully')
            )
        )
    } else {
        console.log(usage)
    }
}

main(process.argv.slice(2))
