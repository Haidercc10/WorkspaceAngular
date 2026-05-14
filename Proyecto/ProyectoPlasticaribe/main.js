const { app, BrowserWindow, ipcMain } = require('electron/main');
const print = require('pdf-to-printer');
const Os = require('os');
const fs = require('fs');
const path = require('node:path');
const log = require('electron-log');

let appWin;

function createWindow() {
  appWin = new BrowserWindow({
    title: "Plasticaribe",
    resizable: true,
    icon: '/assets/Plascaribe_Icono2.png',
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: true,
      preload: path.join(__dirname, 'preload.js'),
      plugins: true,
    }
  });

  ipcMain.on('print-pdf', async (event, data) => {
    const pdfPath = path.join(Os.tmpdir(), `${data.nameTag}.pdf`);

    fs.writeFile(pdfPath, data.buffer, async (error) => {
      if (error) {
        event.reply('print-result', { success: false, error });
        return;
      }

      let options = {
        paperSize: 'PLASTICARIBE',
        orientation: 'landscape'
      }

      print.print(pdfPath, options).then(() => {
        event.reply('print-result', { success: true, data });
        log.info('PDF impreso con exito:', pdfPath);
        fs.unlink(pdfPath, (error) => {
          if (error) {
            console.warn('Error al eliminar el archivo PDF:', error);
          } else {
            console.warn('Archivo PDF eliminado con exito:', pdfPath);
          }
        });
      }).catch(error => {
        event.reply('print-result', { success: false, error : error.message, data });
        console.warn('Error al imprimir el PDF:', error);
      }); 
    });
  });


  const deleteFolderRecursively = function (directory_path) {
    if (fs.existsSync(directory_path)) {
      fs.readdirSync(directory_path).forEach(function (file, index) {
        var currentPath = path.join(directory_path, file);
        if (currentPath.endsWith('.pdf')) fs.unlinkSync(currentPath); // delete file
      });
    }
  };

  appWin.loadURL(`file://${__dirname}/dist/index.html`);

  appWin.setMenu(null);

  appWin.webContents.session.on('select-serial-port', (event, portList, webContents, callback) => {
    event.preventDefault()
    if (portList && portList.length > 0) callback(portList[0].portId);
    else callback('');
  });

  appWin.webContents.session.on('serial-port-added', (event, port) => console.log('serial-port-added FIRED WITH', port));

  appWin.webContents.session.on('serial-port-removed', (event, port) => console.log('serial-port-removed FIRED WITH', port));

  appWin.webContents.session.setPermissionCheckHandler((webContents, permission, requestingOrigin, details) => {
    if (permission === 'serial' && details.securityOrigin === 'file:///') return true;
  });

  appWin.webContents.session.setDevicePermissionHandler((details) => {
    if (details.deviceType === 'serial' && details.origin === 'file://') return true;
  });

  appWin.webContents.openDevTools();

  appWin.on("closed", () => appWin = null);

  appWin.maximize();
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
})

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});
