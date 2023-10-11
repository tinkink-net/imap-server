import { ImapServer, Message, ValueLiteral } from '../lib/ImapServer';
// @ts-ignore
import { imapHandler } from 'wildduck/imap-core';

const server = new ImapServer({
    onError: (err) => {
        console.log('error!!', err, typeof err);
    },
    onAuth: (login, session, callback) => {
        console.log('onAuth', login.username, session.id);
        if (login.username === 'a' && login.password === 'b') {
            callback(null, {
                user: {
                    id: 1,
                },
            });
        } else {
            callback(new Error('Invalid username or password'));
        }
    },
    onClose: () => {
        console.log('onClose');
    },
    onConnect: (session) => {
        console.log(
            `onConnect, id: ${session.id}, ip: ${session.remoteAddress}`,
        );
    },
    onSelect(path, session, callback) {
        console.log('onSelect', path, session.id);
        callback(null, {
            _id: '1',
            // uidList: [1, 2, 3],
            uidList: [4, 5],
            // uidList: [1],
        });
    },
    /**
     * example `options` from Apple Mail
     * {
     *    "bodystructureExist": false,
     *    "rfc822sizeExist": true,
     *    "envelopeExist": false,
     *    "flagsExist": true,
     *    "idateExist": true,
     *    "metadataOnly": false,
     *    "markAsSeen": false,
     *    "messages": [
     *        1,
     *        2,
     *        3
     *    ],
     *    "query": [
     *        {
     *        "query": "INTERNALDATE",
     *        "item": "internaldate",
     *        "original": {
     *            "type": "ATOM",
     *            "value": "INTERNALDATE"
     *        }
     *        },
     *        {
     *        "query": "UID",
     *        "item": "uid",
     *        "original": {
     *            "type": "ATOM",
     *            "value": "UID"
     *        }
     *        },
     *        {
     *        "query": "RFC822.SIZE",
     *        "item": "rfc822.size",
     *        "original": {
     *            "type": "ATOM",
     *            "value": "RFC822.SIZE"
     *        }
     *        },
     *        {
     *        "query": "FLAGS",
     *        "item": "flags",
     *        "original": {
     *            "type": "ATOM",
     *            "value": "FLAGS"
     *        }
     *        },
     *        {
     *        "query": "BODY[HEADER.FIELDS (date subject from to cc message-id in-reply-to references content-type x-priority x-uniform-type-identifier x-universally-unique-identifier list-id list-unsubscribe bimi-indicator bimi-location x-bimi-indicator-hash authentication-results dkim-signature)]",
     *        "item": "body",
     *        "original": {
     *            "type": "ATOM",
     *            "value": "BODY",
     *            "section": [
     *            {
     *                "type": "ATOM",
     *                "value": "HEADER.FIELDS"
     *            },
     *            [
     *                {
     *                "type": "ATOM",
     *                "value": "date"
     *                },
     *                {
     *                "type": "ATOM",
     *                "value": "subject"
     *                },
     *                {
     *                "type": "ATOM",
     *                "value": "from"
     *                },
     *                {
     *                "type": "ATOM",
     *                "value": "to"
     *                },
     *                {
     *                "type": "ATOM",
     *                "value": "cc"
     *                },
     *                {
     *                "type": "ATOM",
     *                "value": "message-id"
     *                },
     *                {
     *                "type": "ATOM",
     *                "value": "in-reply-to"
     *                },
     *                {
     *                "type": "ATOM",
     *                "value": "references"
     *                },
     *                {
     *                "type": "ATOM",
     *                "value": "content-type"
     *                },
     *                {
     *                "type": "ATOM",
     *                "value": "x-priority"
     *                },
     *                {
     *                "type": "ATOM",
     *                "value": "x-uniform-type-identifier"
     *                },
     *                {
     *                "type": "ATOM",
     *                "value": "x-universally-unique-identifier"
     *                },
     *                {
     *                "type": "ATOM",
     *                "value": "list-id"
     *                },
     *                {
     *                "type": "ATOM",
     *                "value": "list-unsubscribe"
     *                },
     *                {
     *                "type": "ATOM",
     *                "value": "bimi-indicator"
     *                },
     *                {
     *                "type": "ATOM",
     *                "value": "bimi-location"
     *                },
     *                {
     *                "type": "ATOM",
     *                "value": "x-bimi-indicator-hash"
     *                },
     *                {
     *                "type": "ATOM",
     *                "value": "authentication-results"
     *                },
     *                {
     *                "type": "ATOM",
     *                "value": "dkim-signature"
     *                }
     *            ]
     *            ]
     *        },
     *        "path": "",
     *        "type": "header.fields",
     *        "headers": [
     *            "date",
     *            "subject",
     *            "from",
     *            "to",
     *            "cc",
     *            "message-id",
     *            "in-reply-to",
     *            "references",
     *            "content-type",
     *            "x-priority",
     *            "x-uniform-type-identifier",
     *            "x-universally-unique-identifier",
     *            "list-id",
     *            "list-unsubscribe",
     *            "bimi-indicator",
     *            "bimi-location",
     *            "x-bimi-indicator-hash",
     *            "authentication-results",
     *            "dkim-signature"
     *        ],
     *        "isLiteral": true
     *        }
     *    ],
     *    "changedSince": 0,
     *    "isUid": false
     *    }
     */
    onFetch: (mailbox, options, session, callback) => {
        console.log(
            'onFetch',
            mailbox,
            typeof mailbox,
            JSON.stringify(options, null, 2),
            session.id,
        );
        // 1. getQuery from options.query
        const messageIds = options.messages;
        for (const id of messageIds) {
            // 2. get message
            const message: Message = {
                uid: id,
                flags: ['\\Seen'],
                modseq: id * 100,
                idate: new Date('2023-10-07 15:00:00'),
                // mimeTree: parseMimeTree(fs.readFileSync(__dirname + '/fixtures/ryan_finnie_mime_torture.eml')),
                mimeTree: {
                    childNodes: [
                        {
                            header: ['Content-Type: text/plain'],
                            parsedHeader: {
                                'content-type': {
                                    value: 'text/plain',
                                    type: 'text',
                                    subtype: 'plain',
                                    params: {},
                                },
                            },
                            body: 'Hello world!',
                            multipart: false,
                            boundary: false,
                            lineCount: 1,
                            size: 12,
                        },
                        {
                            header: ['Content-Type: image/png'],
                            parsedHeader: {
                                'content-type': {
                                    value: 'image/png',
                                    type: 'image',
                                    subtype: 'png',
                                    params: {},
                                },
                            },
                            body: 'BinaryContent',
                            multipart: false,
                            boundary: false,
                            lineCount: 1,
                            size: 13,
                        },
                    ],
                    header: [
                        'Subject: test' + id,
                        'Content-type: multipart/mixed; boundary=abc',
                    ],
                    parsedHeader: {
                        'content-type': {
                            value: 'multipart/mixed',
                            type: 'multipart',
                            subtype: 'mixed',
                            params: {
                                boundary: 'abc',
                            },
                            hasParams: true,
                        },
                        subject: 'test' + id,
                    },
                    body: '',
                    multipart: 'mixed',
                    boundary: 'abc',
                    lineCount: 1,
                    size: 0,
                    text: '--abc\r\nHello world!\r\n--abc\r\nBinaryContent\r\n--abc--\r\n',
                },
            };
            // 3. convert message to values
            // if with body, values[0].type === 'stream'
            const values = session.getQueryResponse(options.query, message);
            console.log('values:', values);

            // 4. formatResponse with { query, values }
            const data = session.formatResponse('FETCH', id, {
                query: options.query,
                values,
            });

            console.log('data:', data);
            let compiled;
            if ((values[0] as ValueLiteral)?.type === 'stream') {
                // with body, it's a stream (PassThrough)
                compiled = imapHandler.compileStream(data);
            } else {
                // only meta, it's a string (then wrap it in `compiled` property)
                compiled = { compiled: imapHandler.compiler(data) };
            }

            console.log('compiled:', compiled);

            // 5. write stream
            // @ts-ignore
            session.writeStream.write(compiled);
        }

        callback(null, true, {
            '1': {
                'body[]': 'hello world',
            },
        });
    },
    onList: (query, session, callback) => {
        console.log('onList', query);
        callback(null, [
            { path: 'Inbox', flags: [], specialUse: 'INBOX' },
            { path: 'Drafts', flags: [], specialUse: '\\Drafts' },
            { path: 'Sent', flags: [], specialUse: '\\Sent' },
            { path: 'Junk', flags: [], specialUse: '\\Junk' },
            { path: 'Trash', flags: [], specialUse: '\\Trash' },
        ]);
    },
});

/* setTimeout(() => {
    server.close(() => {
        console.log('server closed');
    });
}, 2000); */
