export interface modelProduccionProcesos {
    Id? : number;
    OT : number;
    Numero_Rollo : number;
    Prod_Id : number;
    Cli_Id : number;
    Operario1_Id : number;
    Operario2_Id : number;
    Operario3_Id : number;
    Operario4_Id : number;
    Pesado_Entre : number;
    Maquina : number;
    Cono_Id : string;
    Ancho_Cono : number;
    Tara_Cono : number;
    Peso_Bruto : number;
    Peso_Neto : number;
    Cantidad : number;
    Peso_Teorico : number;
    Desviacion : number;
    Precio : number;
    Presentacion : string;
    Proceso_Id : 'EXT' | 'IMP' | 'ROT' | 'LAM' | 'DBLD' | 'CORTE' | 'EMP' | 'SELLA' | 'WIKE';
    Turno_Id : string;
    Envio_Zeus : boolean;
    Datos_Etiqueta : string;
    Fecha : any;
    Hora : string;
    Creador_Id : number;
}