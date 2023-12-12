const { app, BrowserWindow, ipcMain } = require('electron/main');
const Os = require( 'os' );
const fs = require('fs');
const path = require('node:path')

let appWin;

function createWindow(){
    appWin = new BrowserWindow({
        width: 800,
        height: 800,
        title: "Plasticaribe",
        resizable: true,
        icon: '/assets/Plascaribe_Icono.png',
        webPreferences: {
            contextIsolation: true,
            nodeIntegration: false,
            preload: path.join(__dirname, 'preload.js'),
        }
    });

    ipcMain.on('print-pdf', (event, buffer) => {
        const pdfPath = path.join(Os.tmpdir(), 'output.pdf');
        fs.writeFile(pdfPath, buffer, (error) => {
            if (error) {
                console.error(error);
                return;
            }
            let win = new BrowserWindow({ 
                show: false,
            });
            win.loadURL('file://' + pdfPath);
            win.webContents.on('did-finish-load', async () => {
                let printersInfo = await win.webContents.getPrintersAsync();
                let printer = printersInfo.filter(printer => printer.isDefault === true)[0];

                const options = {
                    silent: true,
                    deviceName: printer.name,
                }

                win.webContents.print(options, () => {
                    win.destroy();
                });
            });
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

    // appWin.webContents.openDevTools();

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