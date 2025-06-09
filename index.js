const { Client, LocalAuth } = require('whatsapp-web.js');
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const qrcode = require('qrcode');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static('public'));

const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    headless: true,
    args: ['--no-sandbox']
  }
});

client.on('qr', async (qr) => {
  const imageUrl = await qrcode.toDataURL(qr);
  io.emit('qr', imageUrl);
  io.emit('message', 'QR code généré, scannez avec WhatsApp.');
});

client.on('authenticated', () => {
  io.emit('message', 'Authentifié avec succès.');
});

client.on('ready', () => {
  io.emit('message', 'Client WhatsApp prêt !');
});

client.on('auth_failure', () => {
  io.emit('message', 'Échec de l\'authentification.');
});

client.initialize();

io.on('connection', socket => {
  socket.emit('message', 'Connexion au serveur...');
});

server.listen(3000, () => {
  console.log('Serveur lancé sur http://localhost:3000');
});
