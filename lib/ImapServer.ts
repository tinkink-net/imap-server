import './dirtyTricks';
// @ts-ignore
import { IMAPServer } from 'wildduck/imap-core';

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

    onConnect?: () => void,
    onClose?: () => void,
    onAuth?: () => void,
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
        this.server.on('error', (err: any) => {
            console.log('error!!', err, typeof err);
        });
        this.server.listen(options.port, options.host, () => {
            console.log(`IMAP server listening on port ${options!.port}`);
        });
    }
    onConnect(callback: (...args: any[]) => void) {
        this.server.on('connect', callback);
    }
    onAuth(callback: (...args: any[]) => void) {
        this.server.on('auth', callback);
    }
    onClose(callback: (...args: any[]) => void) {
        this.server.on('close', callback);
    }
}
