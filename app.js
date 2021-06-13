require('dotenv').config();

const express = require('express');

const app  = express();

const port = !process.env.PORT ? 3000 : process.env.PORT;

app.use(express.urlencoded({ extended: true }))

app.listen(port);

console.log('Server On Port '+port)

//const {sendMedia,sendMessage,listenMessage}=require('./whatsappweb');

require('./whatsappquiz');

