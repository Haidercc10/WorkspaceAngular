export interface IElectronAPI {
    loadPreferences: () => Promise<void>,
}
  
declare global {
    interface Window {
        electron: {
            send: (channel : string, data: any) => void;
            receive: (channel: string, func: (...args: any[]) => void) => void;
        };
    }
}