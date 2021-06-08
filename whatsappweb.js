const pool = require("./database");
const qrcode = require("qrcode-terminal");
const { Client, MessageMedia } = require("whatsapp-web.js");
const fs = require("fs");
const ora = require("ora");
const clear = require("clear-screen");
var base64Img = require('base64-img');

const SESSION_FILE_PATH = "./session.json";
let client;
let sessionData;

const withsession = () => {
  const spinner = ora("Loading Validating whatsapp session");
  sessionData = require(SESSION_FILE_PATH);
  spinner.start();

  client = new Client({
    session: sessionData,
  });

  client.on("ready", async () => {
    spinner.stop();
    clear();
    console.log("Client is Ready!");

    listenMessage();
  });

  client.on("auth_failure", () => {
    spinner.stop();
    console.log("Error de autenticaciòn");
  });

  client.initialize();
};

const withoutsession = () => {
  console.log("No session initialized");
  client = new Client();
  client.on("qr", (qr) => {
    qrcode.generate(qr, { small: true });
  });

  client.on("authenticated", (session) => {
    sessionData = session;
    fs.writeFile(SESSION_FILE_PATH, JSON.stringify(session), function (err) {
      if (err) {
        console.log(err);
      }
    });
  });
  client.initialize();
};

const listenMessage = () => {
  client.on("message", async (inboundMsg) => {
    console.log(inboundMsg);

    const { from, to, body, hasMedia, mediaKey } = inboundMsg;

    if (hasMedia) {
      const mediafile = await inboundMsg.downloadMedia();
      console.log(
        mediafile.mimetype,
        mediafile.filename,
        mediafile.data.length
      );
        
      //How to save that object as a file? =====================================

      fs.writeFile('./upload/', JSON.stringify(mediafile.data), function (err) {
        if (err) {
          console.log(err);
        }
      });

      //========================================================================


      var post = {
        message: body,
        direction: "inbound",
        number: from,
        media: "mymediafile",
      };
      var query = pool.query(
        "INSERT INTO chat SET ?",
        post,
        function (error, results, fields) {
          if (error) throw error;
          console.log(from, to, body, hasMedia);
        }
      );
    } else {
      var post = {
        message: body,
        direction: "inbound",
        number: from,
      };
      var query = pool.query(
        "INSERT INTO chat SET ?",
        post,
        function (error, results, fields) {
          if (error) throw error;
          console.log(from, to, body);
        }
      );
    }
  });
};

const sendMessage = (to, outboundMsg) => {
  var post = {
    message: outboundMsg,
    direction: "outbound",
    number: to,
  };
  var query = pool.query(
    "INSERT INTO chat SET ?",
    post,
    function (error, results, fields) {
      if (error) throw error;
      client.sendMessage(to, outboundMsg);
    }
  );
};

const sendMedia = (to, file) => {
  const mediaFile = MessageMedia.fromFilePath(file);
  client.sendMessage(to, mediaFile);
};

fs.existsSync(SESSION_FILE_PATH) ? withsession() : withoutsession();
