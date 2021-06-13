const fs = require("fs");

const saveMediaFile = (mediafile, id) => {
  var n = mediafile.mimetype.search("/");
  var type = mediafile.mimetype.slice(0, n);
  var lon = mediafile.mimetype.length;
  var extension = mediafile.mimetype.substr(lon - (n - 1), lon);
  extension = extension.replace("/", "");

  //definiendo la ruta

  var filepath = "./src/upload/" + id.id + "." + extension;

  //define el contenido

  const fileContents = Buffer.from(mediafile.data, "base64");

  //Guardando el archivo

  fs.writeFile(filepath, fileContents, (err) => {
    if (err) {
      console.error(err);
    }
    console.log("file saved to ", filepath);
    
  });
};

module.exports = { saveMediaFile };
