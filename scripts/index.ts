import mqtt from 'async-mqtt';
import * as e from 'fp-ts/lib/Either';
import moment from 'moment';
import { pipe } from 'fp-ts/lib/function';
import * as ioe from 'fp-ts/lib/IOEither';
import { IOEither } from 'fp-ts/lib/IOEither';
import { ENDGAMEREPORT_SYMBOL, MQTT_URI, DATA_DIR } from './constants';
import { saveFile } from './ranking';
import { Report } from './types';

function logError(e: Error): void {
    console.error(e);
}

function getNewReportFilename(): string {
	const dateFormat = moment().format('yyyy-MM-DDTHH-mm');
    return path.join('data', dateFormat + '.json');
}

const sendReport = (report: Report): IOEither<Error, void> => {
    console.log("Received report: ")
    console.log(report)
    return saveFile(getNewReportFilename())(JSON.stringify(report))
}

const client = mqtt.connect(MQTT_URI);

client.on('connect', function() {
    client.subscribe(ENDGAMEREPORT_SYMBOL);
});

client.on('message', function(topic: string, message: any) {
    if (topic == ENDGAMEREPORT_SYMBOL) {
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
