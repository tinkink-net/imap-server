import { ImapServer } from '../lib/ImapServer';

const server = new ImapServer({
    onError: (err) => {
        console.log('error!!', err, typeof err);
    },
    onAuth: (login, session, callback) => {
        console.log('onAuth', login);
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
    onConnect: () => {
        console.log('onConnect');
    },
});
