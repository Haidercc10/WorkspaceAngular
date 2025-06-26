export interface modelTrazabilidad_Produccion {
    Trz_Id? : number; 
    Trz_Etiqueta : number; 
    Trz_Ot : number; 
    Prod_Id : number; 
    Cli_Id : number; 
    Proceso_Id : string;
    Trz_Fecha : any;
    Trz_Hora : string;
    Trz_PesoNeto : number; 
    Trz_PesoBruto : number; 
    Trz_Cantidad : number; 
    Presentacion : string;
    Trz_Maquina : number; 
    Operario_1 : number; 
    Operario_2 : number; 
    Operario_3 : number; 
    Operario_4 : number; 
    Empacador_Id? : number;
    Turno_Id? : string;
    Trz_EtiquetaAnterior : number; 
    Trz_OtAnterior : number; 
    Prod_Anterior : number; 
    Proceso_Anterior : string;
    Autoriza_Id? : number;
}