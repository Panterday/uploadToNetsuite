const vscode = require("vscode");
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));
const fs = require("fs");
const headerOauth10Generator = require("./headerOauth10Generator");
const pathGenerator = require("./generatePathAndFile");
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  vscode.window.setStatusBarMessage(
    "La extensión Upload to Netsuite está activada",
    6000
  );
  // The command has been defined in the package.json file
  // Now provide the implementation of the command with  registerCommand
  // The commandId parameter must match the command field in package.json
  let disposableUpload = vscode.commands.registerCommand(
    "uploadtonetsuite.subirArchivo",
    () => {
      //TESTING values from user
      const contributorValues =
        vscode.workspace.getConfiguration("uploadToNetsuite");
      const realm = contributorValues.realm;
      const restletUrl = contributorValues.restletUrl;
      const consumerKey = contributorValues.consumerKey;
      const consumerSecret = contributorValues.consumerSecret;
      const tokenId = contributorValues.tokenId;
      const tokenSecret = contributorValues.tokenSecret;
      if (
        realm &&
        restletUrl &&
        consumerKey &&
        consumerSecret &&
        tokenId &&
        tokenSecret
      ) {
        const cargaArchivo = async (body) => {
          const url = new URL(restletUrl);
          const { Authorization } = headerOauth10Generator.oauth10(
            {
              url: url.toString(),
              method: "POST",
            },
            realm,
            consumerKey,
            consumerSecret,
            tokenId,
            tokenSecret
          );
          const config = {
            method: "POST",
            headers: {
              Authorization,
              Cookie: "NS_ROUTING_VERSION=LAGGING",
            },
            body,
            redirect: "follow",
          };
          const response = await fetch(url, config);
          if (response.ok) {
            const data = await response.json();
            if (data.code === 200) {
              vscode.window.setStatusBarMessage("Archivo cargado en NS", 6000);
            } else {
              vscode.window.showErrorMessage("Error " + data.data.path);
            }
          } else {
            vscode.window.showErrorMessage(
              "Error: revise que sus datos de conexión sean correctos"
            );
          }
        };
        const currentUserPath = vscode.window.activeTextEditor.document.uri;
        const pathFileInfo = pathGenerator.generatePathAndFile(currentUserPath);
        if (pathFileInfo.existeRuta) {
          cargaArchivo(pathFileInfo.body);
        } else {
          vscode.window.showErrorMessage(
            "Error: Este archivo no está dentro de la carpeta SuiteScripts"
          );
        }
      } else {
        vscode.window.showErrorMessage(
          "Error: Falta información en la configuración de la extensión Upload to Netsuite"
        );
      }
    }
  );
  context.subscriptions.push(disposableUpload);
}

// this method is called when your extension is deactivated
function deactivate() {}

module.exports = {
  activate,
  deactivate,
};
