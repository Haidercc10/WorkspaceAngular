export interface modelServicios_Produccion {
    SvcProd_Id : number;
    SvcProd_Nombre : string;
    SvcProd_Descripcion? : number;
    SvcProd_ValorDia : number;
    SvcProd_ValorNoche : number;
    SvcProd_ValorDomFest : number;
    Proceso_Crea : number;
    Proceso_Solicita : number;
    Impreso : boolean;
    Material_Id : number;
}