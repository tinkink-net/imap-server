import { ImapServer } from '../lib/ImapServer';

const server = new ImapServer({
    onError: (err) => {
        console.log('error!!', err, typeof err);
    },
    onAuth: () => {
        console.log('onAuth');
    },
    onClose: () => {
        console.log('onClose');
    },
    onConnect: () => {
        console.log('onConnect');
    },
});
