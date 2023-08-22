export interface modelControlCalidad_Extrusion {

}

export interface modelControlCalidad_Impresion {
    Id? : number;
    Usua_Id : number;
    Fecha_Registro : any;
    Hora_Resgitros : string;
    Turno_Id : string;
    Maquina : string;
    Ronda : string;
    Orden_Trabajo : number;
    Cliente : string;
    Prod_Id : number;
    Nombre_Producto : string;
    LoteRollo_SinImpresion : string;
    Prueba_Tratado : string;
    Ancho_Rollo : number;
    Secuencia_Cian : string;
    Secuencia_Magenta : string;
    Secuencia_Amarillo : string;
    Secuencia_Negro : string;
    Secuencia_Base : string;
    Secuencia_Pantone1 : string;
    Secuencia_Pantone2 : string;
    Secuencia_Pantone3 : string;
    Secuencia_Pantone4 : string;
    Tipo_Embobinado : string;
    Codigo_Barras : string;
    Texto : string;
    Fotocelda_Izquierda : boolean;
    Fotcelda_Derecha : boolean;
    Registro_Colores : string;
    Adherencia_Tinta : string;
    Conformidad_Laminado : string;
    PasoGuia_Repetecion : string;
    Observacion : string;
}

export interface modelControlCalidad_CorteDoblado {
    Id? : number;
    Usua_Id : number;
    Fecha_Registro : any;
    Hora_Resgitros : string;
    Turno_Id : string;
    Maquina : string;
    Ronda : string;
    Orden_Trabajo : number;
    Cliente : string;
    Prod_Id : number;
    Nombre_Producto : string;
    Ancho : number;
    UndMed_Id : string;
    Calibre : number;
    Codigo_Barras : string;
    Tipo_Embobinado : string;
    PasoEntre_Guia : string;
    Observacion : string;
}

export interface modelControlCalidad_Sellado {
    
}