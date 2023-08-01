import { ImapServer } from '../lib/ImapServer';

const server = new ImapServer({
    onError: (err) => {
        console.log('error!!', err, typeof err);
    },
    onAuth: (login, session, callback) => {
        console.log('onAuth', login, session);
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
        console.log(`onConnect, id: ${session.id}, ip: ${session.remoteAddress}`);
    },
    onSelect(path, session, callback) {
        console.log('onSelect', path, session.id);
        callback(null, {
            _id: '1',
            uidList: [1, 2, 3],
        });
    },
});

/* setTimeout(() => {
    server.close(() => {
        console.log('server closed');
    });
}, 2000); */
