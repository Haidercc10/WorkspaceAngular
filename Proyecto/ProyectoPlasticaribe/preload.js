const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electron', {
    send: (channel, arg) => ipcRenderer.send(channel, arg),
    on: (event, data) => ipcRenderer.on(event, data)
});