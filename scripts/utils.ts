import { Server } from 'net';

export const logError = (error: Error) => console.error(error);

export async function listen(server: Server, port: number) : Promise<void> {
    return new Promise((resolve, _reject) => {
        server.listen(port, function() {
            resolve();
        });
    })
}
