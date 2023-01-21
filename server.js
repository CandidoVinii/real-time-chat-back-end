const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server, {
  origins: '*' 
});
const mongoose = require('mongoose');
const cors = require('cors');

mongoose.connect('mongodb+srv://admin:admin@cluster0.t76sydz.mongodb.net/?retryWrites=true&w=majority', { useNewUrlParser: true });

const Message = mongoose.model('Message', {
    text: String,
    username: String,
    createdAt: Date
});

io.on('connection', (socket) => {
  console.log(`Nova conexão: ${socket.id}`);

  socket.on('new message', (data) => {
      const message = new Message({
          text: data.text,
          username: data.username,
          createdAt: new Date()
      });

      message.save((err) => {
          if (err) {
              console.error(err);
          } else {
              io.emit('new message', message);
          }
      });
  });

  Message.find().sort('-createdAt').limit(100).exec((err, messages) => {
      if (err) {
          console.error(err);
      } else {
          socket.emit('initial messages', messages);
      }
  });
});

server.listen(3000, () => {
  console.log('Servidor iniciado na porta 3000');
});