/**
 *@NApiVersion 2.1
 *@NScriptType Restlet
 */
define(["N/record", "N/encode", "N/file", "N/search"], (
  record,
  encode,
  file,
  search
) => {
  const keepAfter = (str, element) => {
    if (str) {
      const index = str.indexOf(element);
      if (index != -1) {
        const newStr = str.slice(index + 1);
        return newStr;
      } else return null;
    } else {
      return null;
    }
  };
  const saveFile = (nameFile, folderId, content) => {
    const script = encode.convert({
      string: content,
      inputEncoding: encode.Encoding.BASE_64,
      outputEncoding: encode.Encoding.UTF_8,
    });
    log.debug("SCRIPT", script);
    const currentScript = file.create({
      name: nameFile,
      fileType: file.Type.JAVASCRIPT,
      contents: script,
      folder: folderId,
    });
    return currentScript.save();
  };
  const createFolder = (name, parentName) => {
    const folderRecord = record.create({
      type: record.Type.FOLDER,
    });
    folderRecord.setValue({
      fieldId: "name",
      value: name,
    });
    folderRecord.setValue({
      fieldId: "parent",
      value: parentName,
    });
    const folderId = folderRecord.save({
      enableSourcing: true,
      ignoreMandatoryFields: true,
    });
    return folderId;
  };
  //===========================POST FILE==========================//
  const _post = (context) => {
    const contextParsed = JSON.parse(context);
    const path = contextParsed.path;
    const folders = path.split("/");
    let parentFolderObj = {
      name: "SuiteScripts",
      id: "-15",
    };
    let tempPath = "SuiteScripts/";
    if (folders.length < 2) {
      //Saving by default in SuiteScripts folder
      log.debug("PATH", "SuiteScripts/file.js");
      let isSaved = saveFile(folders[0], "-15", contextParsed.body);
      if (isSaved) {
        log.debug("SUCCESS", tempPath);
        return JSON.stringify({
          otro: "SUCCESS",
        });
      } else {
        return JSON.stringify({
          otro: "ERROR",
        });
      }
    } else {
      for (let i = 0; i < folders.length; i++) {
        if (keepAfter(folders[i], ".")) {
          //Is file
          let file = folders[i];
          if (parentFolderObj.id) {
            //Saving the file
            let isSaved = saveFile(
              file,
              parentFolderObj.id,
              contextParsed.body
            );
            if (isSaved) {
              return JSON.stringify({
                error: false,
                code: 200,
                data: {
                  msg: "Script cargado con éxito",
                  path: tempPath + file,
                },
              });
            } else {
              return JSON.stringify({
                error: true,
                code: 401,
                data: {
                  msg: "Error al cargar el script",
                  path: tempPath + file,
                },
              });
            }
          }
        } else {
          //Is folder
          tempPath += folders[i] + "/";
          const folderSearchObj = search.create({
            type: "folder",
            filters: [
              ["parent", "anyof", parentFolderObj.id],
              "AND",
              ["name", "is", folders[i]],
            ],
            columns: ["internalid"],
          });
          if (folderSearchObj.runPaged().count > 0) {
            folderSearchObj.run().each((result) => {
              //The folder exists
              const currentId = result.getValue({
                name: "internalid",
              });
              parentFolderObj.id = currentId;
              parentFolderObj.name = folders[i];
            });
          } else {
            //Creating folder if it does not exist.
            let newCreatedFolderId = createFolder(
              folders[i],
              parentFolderObj.id
            );
            parentFolderObj.id = newCreatedFolderId;
            parentFolderObj.name = folders[i];
          }
        }
      }
    }
    return JSON.stringify({
      response: "test",
    });
  };
  return {
    post: _post,
  };
});
