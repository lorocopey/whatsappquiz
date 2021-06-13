const pool = require("./database");
const qrcode = require("qrcode-terminal");
const { Client, MessageMedia } = require("whatsapp-web.js");
const fs = require("fs");
const ora = require("ora");
const clear = require("clear-screen");
var base64Img = require("base64-img");
const saveMediaFile = require("./saveMediaFile");
const { start, opciones, jugar, preguntar } = require("./quiz");

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
    //console.log(inboundMsg);

    const { from, to, body, hasMedia, id } = inboundMsg;
    console.log(from)
    // comprueba si es un media file
    if (hasMedia) {
      const mediafile = await inboundMsg.downloadMedia();
      const { saveMediaFile } = require("./saveMediaFile");
      saveMediaFile(mediafile, id);
    }

    //Chequeando Estado del Jugador
    pool.query(
      "SELECT COUNT(*) As cuenta FROM registro WHERE user=?",
      from,
      function (error, results, fields) {
        if (error) throw error;

        var cuenta = Number.parseInt(
          JSON.parse(JSON.stringify(results[0])).cuenta
        );
        
        var res = Number.parseInt(body);

        if (Number.isInteger(res) && res >= 1 && res <= 3) {
          if (cuenta == 0) {
            pool.query(
              "SELECT respuesta from preguntas Where id=?",
              1,
              function (error, results, fields) {
                if (error) throw error;
                var respuesta = Number.parseInt(results[0].respuesta);

                if (respuesta == res) {
                  pool.query(
                    "INSERT INTO registro SET ?",
                    { user: from, pregunta: 1, respuesta: res, correcta: "Y" },
                    function (error, results, fields) {
                      if (error) throw error;
                      if (results.insertId) {
                        sendMessage(from, "Respuesta Correcta!");
                      }
                      //Envia la proxima pregunta
                      pool.query(
                        "Select * from preguntas Where id = ?",
                        2,
                        function (error, results, fields) {
                          if (error) throw error;
                          var pregunta = results[0].pregunta.toString();
                          sendMessage(from, pregunta);
                        }
                      );
                    }
                  );
                } else {
                  pool.query(
                    "INSERT INTO registro SET ?",
                    { user: from, pregunta: 1, respuesta: res, correcta: "N" },
                    function (error, results, fields) {
                      if (error) throw error;
                      
                      if (results.insertId) {
                        sendMessage(from, "Respuesta Incorrecta!");
                      }
                      //Envia la proxima pregunta
                      pool.query(
                        "Select * from preguntas Where id = ?",
                        2,
                        function (error, results, fields) {
                          if (error) throw error;
                          var pregunta = results[0].pregunta.toString();
                          sendMessage(from, pregunta);
                        }
                      );
                    }
                  );
                }
              }
            );
          } else {
            var nro = cuenta + 1;
            pool.query(
              "SELECT respuesta from preguntas Where id=?",
              nro,
              function (error, results, fields) {
                if (error) throw error;
                if (results[0]) {
                  var respuesta = Number.parseInt(results[0].respuesta);

                  if (respuesta == res) {
                    pool.query(
                      "INSERT INTO registro SET ?",
                      {
                        user: from,
                        pregunta: nro,
                        respuesta: res,
                        correcta: "Y",
                      },
                      function (error, results, fields) {
                        if (error) throw error;
                        if (results.insertId) {
                          sendMessage(from, "Respuesta Correcta!");
                        }
                        //Envia la proxima pregunta
                        pool.query(
                          "Select * from preguntas Where id = ?",
                          nro + 1,
                          function (error, results, fields) {
                            if (error) throw error;
                            if (results[0]) {
                                var pregunta = results[0].pregunta.toString();
                                sendMessage(from, pregunta);  
                            }else{
                                sendMessage(from,"Fin del Juego\nEnvia *Puntos* para conocer tu puntaje")
                            }
                            
                          }
                        );
                      }
                    );
                  } else {
                    pool.query(
                      "INSERT INTO registro SET ?",
                      {
                        user: from,
                        pregunta: nro,
                        respuesta: res,
                        correcta: "N",
                      },
                      function (error, results, fields) {
                        if (error) throw error;
                        if (results.insertId) {
                          sendMessage(from, "Respuesta Incorrecta!");
                        }
                        //Envia la proxima pregunta
                        pool.query(
                          "Select * from preguntas Where id = ?",
                          nro + 1,
                          function (error, results, fields) {
                            if (error) throw error;
                            if (results[0]) {
                                var pregunta = results[0].pregunta.toString();
                            sendMessage(from, pregunta);
                            }else{
                                sendMessage(from,"Fin del Juego\nEnvia *Puntos* para conocer tu puntaje")
                            }
                            
                          }
                        );
                      }
                    );
                  }
                }else{
                    sendMessage(from,"Fin del Juego\nEnvia *Puntos* para conocer tu puntaje")
                }
              }
            );
          }
        } else if (body === "Opciones" && cuenta >= 1) {
          sendMessage(from, opciones());
        } else if (body === "Puntos" && cuenta >= 1){
            pool.query(
                "Select COUNT(*) As Puntos FROM registro Where correcta ='Y' and user='"+from +"'",function (error, results, fields) {
                    if (error) throw error;
                    var puntos = "Total Puntos: "+results[0].Puntos.toString();
                    sendMessage(from, puntos);
                  })
        }
        else if (body === "Jugar" && cuenta < 1) {
          jugar();
          sendMessage(from, jugar());
          var nro = 1;

          pool.query(
            "Select * from preguntas Where id = ?",
            nro,
            function (error, results, fields) {
              if (error) throw error;
              var pregunta = results[0].pregunta.toString();
              sendMessage(from, pregunta);
            }
          );
        } else if (body === "Jugar" && cuenta >= 1) {

            var nro = cuenta + 1;
            
            pool.query(
                "Select * from preguntas Where id = ?",
                nro,
                function (error, results, fields) {
                  if (error) throw error;
                  if (results[0]) {
                      var pregunta = results[0].pregunta.toString();
                      sendMessage(from, pregunta);  
                  }else{
                      sendMessage(from,"Fin del Juego\nEnvia *Puntos* para conocer tu puntaje")
                  }
                  
                }
              );

            /* pool.query(
                "SELECT respuesta from preguntas Where id=?",
                nro,
                function (error, results, fields) {
                  if (error) throw error;
                  if (results[0]) {
                    var respuesta = Number.parseInt(results[0].respuesta);
  
                    if (respuesta == res) {
                      pool.query(
                        "INSERT INTO registro SET ?",
                        {
                          user: from,
                          pregunta: nro,
                          respuesta: res,
                          correcta: "Y",
                        },
                        function (error, results, fields) {
                          if (error) throw error;
                          if (results.insertId) {
                            sendMessage(from, "Respuesta Correcta!");
                          }
                          //Envia la proxima pregunta
                          pool.query(
                            "Select * from preguntas Where id = ?",
                            nro + 1,
                            function (error, results, fields) {
                              if (error) throw error;
                              if (results[0]) {
                                  var pregunta = results[0].pregunta.toString();
                                  sendMessage(from, pregunta);  
                              }else{
                                  sendMessage(from,"Fin del Juego")
                              }
                              
                            }
                          );
                        }
                      );
                    } else {
                      pool.query(
                        "INSERT INTO registro SET ?",
                        {
                          user: from,
                          pregunta: nro,
                          respuesta: res,
                          correcta: "N",
                        },
                        function (error, results, fields) {
                          if (error) throw error;
                          if (results.insertId) {
                            sendMessage(from, "Respuesta Incorrecta!");
                          }
                          //Envia la proxima pregunta
                          pool.query(
                            "Select * from preguntas Where id = ?",
                            nro + 1,
                            function (error, results, fields) {
                              if (error) throw error;
                              if (results[0]) {
                                  var pregunta = results[0].pregunta.toString();
                              sendMessage(from, pregunta);
                              }else{
                                  sendMessage(from,"Fin del Juego")
                              }
                              
                            }
                          );
                        }
                      );
                    }
                  }else{
                      sendMessage(from,"Fin del Juego")
                  }
                }
              ); */
        } else {
          sendMessage(from, start());
        }
      }
    );
  });
};

const sendMessage = (to, outboundMsg) => {
  client.sendMessage(to, outboundMsg);
};

// inicializa el script
fs.existsSync(SESSION_FILE_PATH) ? withsession() : withoutsession();
