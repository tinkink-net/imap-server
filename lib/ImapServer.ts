import './dirtyTricks';
// @ts-ignore
import { IMAPServer } from 'wildduck/imap-core';
import { MemoryNotifier } from './MemoryNotifier';
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

    onConnect?: (session: ImapServerSession) => void;
    onClose?: () => void;
    onAuth?: (
        login: {
            username: string;
            password: string;
        },
        session: any,
        callback: (err: Error | null, data?: Record<string, any>) => void,
    ) => void;
    onError?: (err: Error) => void;
    onSelect?: (
        path: string,
        session: ImapServerSession,
        callback: (err: Error | null, mailboxData?: Mailbox) => void,
    ) => void;
    onFetch?: (
        mailboxId: string,
        options: OnFetchOptions,
        session: ImapServerSession,
        callback: (
            err: Error | null,
            success: boolean,
            info: Record<string, any>,
        ) => void,
    ) => void;
    onList?: (
        query: any,
        session: ImapServerSession,
        callback: (err: Error | null, list: Folder[]) => void,
    ) => void;
    onMove?: (
        mailbox: number,
        update: Update,
        session: ImapServerSession,
        callback: (err: Error | null, data?: any) => void,
    ) => void;
    onCopy?: (
        mailbox: number,
        update: Update,
        session: ImapServerSession,
        callback: (
            err: Error | null,
            success: boolean,
            info: {
                uidValidity: number;
                sourceUid: number[];
                destinationUid: number[];
            },
        ) => void,
    ) => void;
    onExpunge?: (
        mailbox: number,
        update: Update,
        session: ImapServerSession,
        callback: (err: Error | null, data?: Error | string | boolean) => void,
    ) => void;
    onStore?: (
        mailbox: number,
        update: Update,
        session: ImapServerSession,
        callback: (err: Error | null, data?: any) => void,
    ) => void;
}

export interface ImapServerSession {
    id: string;
    selected: boolean;
    remoteAddress: string;
    clientHostname: string;
    writeStream: WritableStream;
    socket: Socket;
    // todo: imap-connection.js:L804
    formatResponse: (command: string, uid: number, data: any) => any;
    getQueryResponse: (query: QueryItem[], message: Message) => Value[];
}

export interface MimeTree {
    parsedHeader: {
        'content-type'?: {
            value:
                | 'text/plain'
                | 'image/png'
                | 'image/jpeg'
                | 'multipart/mixed';
            type: 'multipart' | 'text' | 'message' | 'application' | 'image';
            subtype:
                | 'rfc822'
                | 'plain'
                | 'octet-stream'
                | 'png'
                | 'jpeg'
                | 'mixed';
            hasParams?: boolean;
            params: {
                [key: string]: string;
            };
        };
        'content-id'?: string;
        'content-disposition'?: string;
        subject?: string;
    };
    size: number;
    message?: MimeTree;
    childNodes?: MimeTree[];
    multipart?: 'mixed' | false;
    boundary: string | false;
    lineCount: number;
    header: string[];
    body: string;
    text?: string;
}

export interface ValueLiteral {
    type: string;
    value: Value;
    expectedLength: number;
    startFrom: number;
    maxLength: number;
}
export type Value = number | Date | ValueLiteral | any[];

export interface FetchData {
    query: QueryItem[];
    values: Value[];
}

export interface Message {
    uid: number;
    flags: string[];
    modseq: number;
    idate: Date;
    mimeTree: MimeTree;
}

export interface Mailbox {
    _id: string;
    uidList: number[];
    modifyIndex?: number;
    uidValidity?: number;
}

export interface QueryItem {
    original: {
        partial: any[];
    };
    path?: string;
    type?: string;
    partial?: {
        startFrom: number;
        maxLength: number;
    };
    item:
        | 'uid'
        | 'modseq'
        | 'flags'
        | 'internaldate'
        | 'bodystructure'
        | 'envelope'
        | 'rfc822'
        | 'rfc822.size'
        | 'rfc822.header'
        | 'rfc822.text'
        | 'body';
    isLiteral: boolean;
}

export interface OnFetchOptions {
    bodystructureExist: boolean;
    rfc822sizeExist: boolean;
    envelopeExist: boolean;
    flagsExist: boolean;
    idateExist: boolean;
    metadataOnly: boolean;
    markAsSeen: boolean;
    messages: number[];
    query: QueryItem[];
    changedSince: number;
    isUid: boolean;
}

export interface FolderObject {
    path: string;
    flags: string[];
    specialUse?:
        | 'INBOX'
        | '\\Sent'
        | '\\Trash'
        | '\\Junk'
        | '\\Drafts'
        | '\\Flagged';
}

export type Folder = string | FolderObject;

export interface Update {
    destination: string;
    messages: number[];
    isUid?: boolean;
    silent?: boolean;
    value?: string[];
    unchangedSince?: number;
    action?: 'set' | 'add' | 'remove';
    type: 'flags';
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
    server: IMAPServer;
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
        if (options.onFetch) {
            this.server.onFetch = options.onFetch.bind(this);
        }
        if (options.onList) {
            this.server.onList = options.onList;
            this.server.onLsub = options.onList;
        }
        if (options.onMove) {
            this.server.onMove = options.onMove;
        }
        if (options.onCopy) {
            this.server.onCopy = (
                connection: any,
                mailbox: number,
                update: Update,
                session: ImapServerSession,
                callback: any,
            ) => {
                options!.onCopy!(mailbox, update, session, callback);
            };
        }
        if (options.onExpunge) {
            this.server.onExpunge = options.onExpunge;
        }
        if (options.onStore) {
            this.server.onStore = options.onStore;
        }

        this.server.listen(options.port, options.host, () => {
            console.log(`IMAP server listening on port ${options!.port}`);
        });
    }
    getConnection(session: ImapServerSession) {
        for (const conn of this.server.connections) {
            if (conn.session.id === session.id) {
                return conn;
            }
        }
    }
    close(callback?: () => void) {
        this.server.close(callback);
    }
}
