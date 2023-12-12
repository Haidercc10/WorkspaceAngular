export interface modelProduccion_Procesos {
     Id? : number;
     Numero_Rollo : number;
     Prod_Id : number;
     Cli_Id : number;
     Operario1_Id : number;
     Operario2_Id  : number;
     Operario3_Id : number;
     Operario4_Id : number;
     Pesado_Entre : number;
     Maquina : number;
     Cono_Id  : string;
     Ancho_Cono : number;
     Tara_Cono : number;
     Peso_Bruto : number;
     Peso_Neto : number;
     Cantidad : number;
     Peso_Teorico : number;
     Desviacion : number;
     Precio : number;
     Presentacion : string;
     Proceso_Id : string;
     Turno_Id : string;
     Envio_Zeus : number;
     Datos_Etiqueta : string;
     Fecha : any;
     Hora : any;
     Creador_Id : number;
}