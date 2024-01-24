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
        icon: '/assets/Plascaribe_Icono.png',
        webPreferences: {
            contextIsolation: true,
            nodeIntegration: true,
            preload: path.join(__dirname, 'preload.js'),
            plugins: true,
        }
    });

    ipcMain.on('print-pdf', async (event, buffer) => {
        const pdfPath = path.join(Os.tmpdir(), 'output.pdf');
        fs.writeFile(pdfPath, buffer, async (error) => {
            if (error) throw error;
            let options = {
                paperSize: 'PLASTICARIBE',
                orientation: 'landscape'
            }
            print.print(pdfPath, options).then(log.info(pdfPath)).catch(error => log.error(error));
        });
    });

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