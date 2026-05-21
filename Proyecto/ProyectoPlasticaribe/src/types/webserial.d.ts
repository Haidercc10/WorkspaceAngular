/*interface Navigator {
    serial: {
        requestPort(): Promise<any>;
        getPorts(): Promise<SerialPort[]>;
    };
}

interface SerialPort {
    open(options: {
        baudRate: number;
    }): Promise<void>;

    close(): Promise<void>;

    readable: ReadableStream;

    writable: WritableStream;
}

interface Serial {
    requestPort(): Promise<SerialPort>;

    getPorts(): Promise<SerialPort[]>;
}*/