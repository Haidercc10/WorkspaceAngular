/*const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electron', {
    send: (channel, arg) => ipcRenderer.send(channel, arg),
    on: (event, data) => ipcRenderer.on(event, data),
    
});*/

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  send: (channel, data) => {
    ipcRenderer.send(channel, data);
  },

  receive: (channel, func) => {
    ipcRenderer.on(channel, (event, ...args) => func(...args));
  },

  once: (channel, func) => {
    ipcRenderer.once(channel, (event, ...args) => func(...args));
  }
});