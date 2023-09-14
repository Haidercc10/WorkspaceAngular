export interface modelMateriaPrima{
  MatPri_Id : number;
  MatPri_Nombre : string;
  MatPri_Descripcion : string;
  MatPri_Stock : number;
  UndMed_Id : string;
  CatMP_Id : number;
  MatPri_Precio : number;
  TpBod_Id : number;
  MatPri_PrecioEstandar? : number;
}
