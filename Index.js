const { Client, LocalAuth } = require('whatsapp-web.js');
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const qrcode = require('qrcode');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    },
});

app.use(express.static('public'));

client.on('qr', async (qr) => {
    const qrImageUrl = await qrcode.toDataURL(qr);
    io.emit('qr', qrImageUrl);
    io.emit('message', 'QR Code reçu, scannez avec WhatsApp');
});

client.on('ready', () => {
    io.emit('message', 'WhatsApp connecté !');
});

client.on('authenticated', () => {
    io.emit('message', 'Authentification réussie');
});

client.on('auth_failure', msg => {
    io.emit('message', 'Échec de l\'authentification : ' + msg);
});

client.initialize();

io.on('connection', (socket) => {
    socket.emit('message', 'Connexion au serveur...');
});

server.listen(3000, () => {
    console.log('Serveur démarré sur http://localhost:3000');
});
