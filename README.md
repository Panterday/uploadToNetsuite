# uploadtonetsuite README

Upload to Netsuite es una pequeña herramienta para cargar archivos a Netsuite desde Visual Studio Code.

## Features

Para garantizar el buen funcionamiento de esta extensión, es necesario crear un registro de integración en Netsuite;
además de generar un token de acceso en alguna cuenta con permisos de edición de registros.

Se requiere el consumer key (registro de integración), consumer secret (registro de integración),
token id (token de usuario), token secret (token de usuario), el realm (id de subsidiaria) y también es necesario cargar e
implementar este Script de tipo restlet, pues será necesaria la URL pública del restlet.

Se debe crear una carpeta SuiteScripts, dentro de ella se almacenarán todos los archivos y directorios.

La carpeta SuiteScripts local, coincide con la carpeta SuiteScripts en Netsuite.

Para cargar un archivo de cualquier tipo a Netsuite, basta con dar click derecho sobre el archivo, "Subir archivo a Netsuite";
también es posible usar el atajo "Ctrl + u".

## Extension Settings

Se debe configurar la información para la conexión a Netsuite, en la configuración de extensiones, Upload to Netsuite.

## Release Notes

### 1.0.0

Primera versión de esta extensión.
