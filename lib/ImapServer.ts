import './dirtyTricks';
// @ts-ignore
import { IMAPServer } from 'wildduck/imap-core';
// @ts-ignore
export { imapHandler } from 'wildduck/imap-core';
// @ts-ignore
export { default as parseMimeTree } from 'wildduck/imap-core/lib/indexer/parse-mime-tree';
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
    key?: string | Buffer;
    cert?: string | Buffer;
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
        callback: (err: Error | null, list?: Folder[]) => void,
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
            info?: {
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
        callback: (
            err: Error | null,
            success?: string | boolean,
            data?: number[],
        ) => void,
    ) => void;
    onStatus?: (
        path: string,
        session: ImapServerSession,
        callback: (
            err: Error | null,
            data?: {
                messages: number;
                uidNext: number;
                uidValidity: number;
                unseen: number;
                highestModseq: number;
            },
        ) => void,
    ) => void;
    onAppend?: (
        path: string,
        flags: string[],
        date: Date,
        raw: Buffer,
        session: ImapServerSession,
        callback: (
            err: Error | null,
            success?: string | boolean,
            data?: any,
        ) => void,
    ) => void;
}

export interface ImapServerSession {
    id: string;
    selected: boolean;
    remoteAddress: string;
    clientHostname: string;
    writeStream: WritableStream;
    socket: Socket;
    user: {
        id: number;
        [key: string]: any;
    };
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
    _id: number;
    uidList: number[];
    flags?: string[];
    uidNext?: number;
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
    private _port: number;
    constructor(options?: ImapServerOptions) {
        if (!options) {
            options = defaultOptions;
        } else {
            options = { ...defaultOptions, ...options };
        }
        this._port = options.port!;

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
        (
            [
                'onAuth',
                'onSelect',
                'onFetch',
                'onList',
                'onMove',
                'onExpunge',
                'onStore',
                'onStatus',
                'onAppend',
            ] as (keyof ImapServerOptions)[]
        ).forEach((event) => {
            if (options![event] && typeof options![event] === 'function') {
                if (event === 'onSelect') {
                    this.server.onOpen = options![event];
                } else {
                    this.server[event] = (options![event] as () => void).bind(
                        this,
                    );
                }
                if (event === 'onList') {
                    this.server.onLsub = options![event];
                }
            }
        });
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
    }
    getConnection(session: ImapServerSession) {
        for (const conn of this.server.connections) {
            if (conn.session.id === session.id) {
                return conn;
            }
        }
    }
    listen() {
        this.server.listen(this._port, () => {
            console.log(`IMAP server listening on port ${this._port}`);
        });
    }
    close(callback?: () => void) {
        this.server.close(callback || (() => {}));
    }
}

export default ImapServer;
