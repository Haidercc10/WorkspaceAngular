export interface modelPedidoExterno_Productos {
    PedExt_Id : number;
    Prod_Id : number;
    PedExtProd_Cantidad : number;
    UndMed_Id : string;
    PedExtProd_PrecioUnitario : number;
    PedExtProd_FechaEntrega : any;
    PedExtProd_CantidadFacturada : number;
    PedExtProd_CantidadFaltante : number;
    Codigo? : number;
    Estado_Id : number;
    PedExtProd_OT : number;
    PedExtProd_Observacion : string;
    PedExtProd_Referencia : string;
}