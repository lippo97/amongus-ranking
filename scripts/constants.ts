export const ENDGAMEREPORT_SYMBOL = 'endGameReport';

const MQTT_PROCOL = 'tcp'
const MQTT_HOST = process.env.HOST || 'localhost';
const MQTT_PORT = parseInt(process.env.PORT || '1883');
export const MQTT_URI = `${MQTT_PROCOL}://${MQTT_HOST}:${MQTT_PORT}`;
export const DATA_DIR = 'data';
export const RANKING_FILE = `${DATA_DIR}/ranking.json`;
