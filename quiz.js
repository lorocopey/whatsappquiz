const pool = require("./database");

const start = () => {
  return "Bienvenido a QuizWhatsaapp ๐!\npara comenzar responde con la palabra *Jugar*, \n \nTen presente que solo debes responder con una de las opciones seรฑaladas como respuestas validas, en dado caso que no quieras responder escribe *Pasar* y si no quiere seguir jugando escribe *Salir*";
};

const opciones = () => {
  return "๐*Jugar* = Comenzar o continuar jugando\n๐*Pasar* = Para no respoder una pregunta\n*Puntos* = Puntajes\n๐*Salir* = Terminar el juego";
};

const jugar = () => {
  return "๐ Aqui vamos con tu primera pregunta suerte!";
};



module.exports = { start, opciones, jugar };
