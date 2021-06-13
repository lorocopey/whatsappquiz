const pool = require("./database");

const start = () => {
  return "Bienvenido a QuizWhatsaapp 😃!\npara comenzar responde con la palabra *Jugar*, \n \nTen presente que solo debes responder con una de las opciones señaladas como respuestas validas, en dado caso que no quieras responder escribe *Pasar* y si no quiere seguir jugando escribe *Salir*";
};

const opciones = () => {
  return "📄*Jugar* = Comenzar o continuar jugando\n📄*Pasar* = Para no respoder una pregunta\n*Puntos* = Puntajes\n📄*Salir* = Terminar el juego";
};

const jugar = () => {
  return "👉 Aqui vamos con tu primera pregunta suerte!";
};



module.exports = { start, opciones, jugar };
