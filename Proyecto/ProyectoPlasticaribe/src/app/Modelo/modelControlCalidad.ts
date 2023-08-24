export interface modelControlCalidad_Extrusion {
    CcExt_Id? : number;
    Turno_Id : string;
    Usua_Id : number;
    CcExt_Maquina : number;
    CcExt_Ronda : number;
    CcExt_OT : number;
    CcExt_Cliente : string;
    Prod_Id : string;
    Referencia : string;
    CcExt_Rollo : number;
    Pigmento_Id : number;
    CcExt_AnchoTubular : number;
    CcExt_PesoMetro : number;
    CcExt_Ancho : number;
    UndMed_Id : string;
    CcExt_CalibreMax : number;
    CcExt_CalibreMin : number;
    CcExt_CalibreProm : number;
    CcExt_Apariencia : string;
    CcExt_Tratado : string;
    CcExt_Rasgado : string;
    CcExt_TipoBobina : string;
    CcExt_Fecha : string;
    CcExt_Hora : string;
    CcExt_Observacion : string;  
}

export interface modelControlCalidad_Impresion {
    Id? : number;
    Usua_Id : number;
    Fecha_Registro : any;
    Hora_Registro : string;
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
    CcSel_Id? : number;
    Turno_Id : string;
    Usua_Id : number;
    CcSel_Maquina : number;
    CcSel_Ronda : string;
    CcSel_OT : number;
    Prod_Id : number;
    Referencia : string;
    CcSel_Calibre : number;
    CcSel_Ancho : number;
    CcSel_Largo : number;
    UndMed_AL : string;
    AnchoFuelle_Izq : number;
    AnchoFuelle_Der : number;
    AnchoFuelle_Abajo : number;
    UndMed_AF : string;
    CcSel_Rasgado : string;
    CcSel_PruebaFiltrado : string;
    CcSel_PruebaPresion : string;
    CcSel_Sellabilidad : string;
    CcSel_Impresion : string;
    CcSel_Precorte : string;
    CcSel_Perforacion : string;
    CcSel_CantBolsasxPaq : number;
    CcSel_Fecha : string;
    CcSel_Hora : string;
    CcSel_Observacion : string; 
}