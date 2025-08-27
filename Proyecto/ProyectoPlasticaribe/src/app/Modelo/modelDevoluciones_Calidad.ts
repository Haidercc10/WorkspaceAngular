export interface modelDevoluciones_Calidad {
  Dvc_Id? : number;
  Dvc_Fecha : any;
  Dvc_Ano : number;
  Dvc_Mes : string;
  Dvc_OT : number;
  Cli_Id : number;
  Prod_Id : number;
  Falla_Id : number;
  Proceso_Id : string;
  Req_Id : number;
  Dvc_TipoRechazo : string;
  Dvc_PesoBruto : number;
  Dvc_PesoNeto : number;
  Dvc_Precio : number;
  Dvc_Subtotal : number; 
  Dvc_FechaProduccion : any;
  Dvc_Observacion? : string;
  Dvc_FechaRegistro : any;
  Dvc_Hora : string;
}