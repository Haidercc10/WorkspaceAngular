export interface modelOrden_Trabajo {
  Ot_Id? : number;
  Numero_OT : number;
  SedeCli_Id : number;
  Prod_Id : number;
  UndMed_Id : string;
  Ot_FechaCreacion : any;
  Ot_Hora : string;
  Estado_Id : number;
  Usua_Id : number;
  PedExt_Id : number;
  Ot_Observacion : string;
  Ot_Cyrel : boolean;
  Ot_Corte : boolean;
  Mezcla_Id : number;
  Extrusion : boolean;
  Impresion : boolean;
  Rotograbado : boolean;
  Laminado : boolean;
  Sellado : boolean;
  Ot_MargenAdicional : number;
  Ot_CantidadPedida : number;
  Ot_ValorUnidad : number;
  Ot_PesoNetoKg : number;
  Ot_ValorKg : number;
  Ot_ValorOT : number;
  Id_Vendedor : number;
}
