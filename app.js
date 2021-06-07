require('dotenv').config();

const express = require('express');

const app  = express();

const port = !process.env.PORT ? 3000 : process.env.PORT;

app.listen(port);

console.log('Server On Port '+port)

require('./whatsappweb');

