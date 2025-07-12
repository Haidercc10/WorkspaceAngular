export interface modelDt_OrdenFacturacion {
    Id?: number;
    Id_OrdenFacturacion: number;
    Numero_Rollo: number;
    Prod_Id: number;
    Cantidad: number;
    Presentacion: string;
    Consecutivo_Pedido?: string;
    Estado_Id : number;
    Pallet_Id? : number;
    OT? : number;
    Peso_Neto? : number;
    Peso_Bruto? : number;
    Ubicacion?: string;
}