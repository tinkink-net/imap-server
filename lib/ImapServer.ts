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

    onConnect?: (session: ImapServerSession) => void,
    onClose?: () => void,
    onAuth?: (login: {
        username: string;
        password: string;
    }, session: any, callback: (err: Error|null, data?: Record<string, any>) => void) => void,
    onError?: (err: Error) => void,
    onSelect?: (path: string, session: ImapServerSession, callback: (err: Error | null, mailboxData?: Mailbox) => void) => void,
}

export interface ImapServerSession {
    id: string;
    selected: boolean;
    remoteAddress: string;
    clientHostname: string;
    writeStream: WritableStream;
    socket: Socket;
}

export interface Mailbox {
    _id: string;
    uidList: number[];
    modifyIndex?: number;
    uidValidity?: number;
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
            this.server.server.on('connection', (socket: Socket) => {
                setTimeout(() => {
                    let connection;
                    for (const conn of this.server.connections) {
                        if (conn._socket === socket) {
                            connection = conn;
                            break;
                        }
                    }
                    if (!connection) {
                        console.log('no connection found');
                    }
                    options!.onConnect?.(connection.session);
                });
            });
        }
        if (options.onClose) {
            this.server.on('close', options.onClose);
        }
        if (options.onAuth) {
            this.server.onAuth = options.onAuth;
        }
        if (options.onSelect) {
            this.server.onOpen = options.onSelect;
        }

        this.server.listen(options.port, options.host, () => {
            console.log(`IMAP server listening on port ${options!.port}`);
        });
    }
    close(callback?: () => void) {
        this.server.close(callback);
    }
}
