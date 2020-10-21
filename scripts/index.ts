import mqtt from 'async-mqtt';
import * as e from 'fp-ts/lib/Either';
import * as ioe from 'fp-ts/lib/IOEither';
import { IOEither } from 'fp-ts/lib/IOEither';
import { Either } from 'fp-ts/lib/Either';
import { pipe } from 'fp-ts/lib/function';
import { endGameReport } from './constants';
import server from './mqtt-server';
import { enableOperations, loadRanking, RankingOperations, RankingDatabase } from './ranking';
import { listen } from './utils';

const MQTT_PROCOL = 'tcp'
const MQTT_HOST = process.env.HOST || 'localhost';
const MQTT_PORT = parseInt(process.env.PORT || '1883');
const MQTT_URI = `${MQTT_PROCOL}://${MQTT_HOST}:${MQTT_PORT}`;
const RANKING_FILE = 'data/ranking.json';

type PlayerName = string;
type Report = {
    crewmates: PlayerName[],
    impostors: PlayerName[],
    winners: 'crewmates' | 'impostors'
};

function logError(e: Error): void {
    console.error(e);
}

const applyReport = ({ crewmates, impostors, winners }: Report) => (ranking: RankingOperations): Either<Error, RankingOperations> => {
    try {
        if (winners === undefined) {
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

const sendReport = (report: Report): IOEither<Error, void> => {
    console.log("Received report: ")
    console.log(report)
    return pipe(
        loadRanking(RANKING_FILE),
        ioe.map(enableOperations),
        ioe.chain(ranking => ioe.fromEither(applyReport(report)(ranking))),
        ioe.chain(ranking => ranking.save(RANKING_FILE))
    )
}

(async () => {
    await listen(server, MQTT_PORT);
    console.log(`Server listening on ${MQTT_PORT}.`);

    const client = mqtt.connect(MQTT_URI);

    client.on('connect', async function() {
        await client.subscribe('endGameReport');
    });

    client.on('message', function(topic: string, message: any) {
        if (topic == endGameReport) {
            pipe(
                message.toString(),
                s => ioe.tryCatch(() => JSON.parse(s), e.toError),
                ioe.chain(sendReport),
                a => a(),
                e.fold<Error, void, void>(logError, () => console.log('Saved successfully'))
            )
        }
    })

    console.log('Started!');
})();
