import './dirtyTricks';
// @ts-ignore
import { IMAPServer } from 'wildduck/imap-core';
import { MemoryNotifier } from './MemoryNotifier'
import { type Socket } from 'node:net';

export interface ImapServerOptions {
    name?: string;
    version?: string;
    vendor?: string;

    host?: string;
    port?: number;

    secure?: boolean;
    secured?: boolean;
    disableSTARTTLS?: boolean;
    ignoreSTARTTLS?: boolean;
    useProxy?: boolean;
    ignoredHosts?: string[];

    maxMessage?: number;
    enableCompression?: boolean;

    onConnect?: (socket: Socket) => void,
    onClose?: () => void,
    onAuth?: (login: {
        username: string;
        password: string;
    }, session: any, callback: (err: Error|null, data?: Record<string, any>) => void) => void,
    onError?: (err: Error) => void,

}

const defaultOptions: ImapServerOptions = {
    name: 'Tinkink IMAP Server',
    version: '1.0.0',
    vendor: 'tinkink.net',

    host: '0.0.0.0',
    port: 143,

    secure: false,
    secured: false,

    disableSTARTTLS: true,
    ignoreSTARTTLS: true,
    useProxy: false,
    ignoredHosts: [],

    maxMessage: 25 * 1024 * 1024,
    enableCompression: true,


};

export class ImapServer {
    private server: IMAPServer;
    constructor(options?: ImapServerOptions) {
        if (!options) {
            options = defaultOptions;
        } else {
            options = { ...defaultOptions, ...options };
        }
        this.server = new IMAPServer(options);
        this.server.notifier = new MemoryNotifier({});

        if (options.onError) {
            this.server.on('error', options.onError);
        }
        if (options.onConnect) {
            // console.log(options.onConnect, this.server.server);
            this.server.server.on('connection', options.onConnect);
        }
        if (options.onClose) {
            this.server.on('close', options.onClose);
        }
        if (options.onAuth) {
            this.server.onAuth = options.onAuth;
        }

        this.server.listen(options.port, options.host, () => {
            console.log(`IMAP server listening on port ${options!.port}`);
        });
    }
}
