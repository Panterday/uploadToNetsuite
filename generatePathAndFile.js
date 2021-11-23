const fs = require("fs");
const generatePathAndFile = (file) => {
  const absolutePathFile = file.path;
  if (absolutePathFile.indexOf("SuiteScripts/") != -1) {
    const pathArray = absolutePathFile.split("SuiteScripts/");
    const currentPath = pathArray[pathArray.length - 1];
    const fileContent = fs.readFileSync(file.fsPath, "utf8");
    if (fileContent) {
      const buff = Buffer.from(fileContent);
      const base64data = buff.toString("base64");
      return {
        existeRuta: true,
        path: currentPath,
        body: `{\r\n    \"path\": \"${currentPath}\",\r\n    \"body\": \"${base64data}\"\r\n}`,
      };
    } else {
      return {
        existeRuta: false,
        body: "No se encontró el archivo",
      };
    }
  } else {
    return {
      existeRuta: false,
    };
  }
};

module.exports = {
  generatePathAndFile,
};
