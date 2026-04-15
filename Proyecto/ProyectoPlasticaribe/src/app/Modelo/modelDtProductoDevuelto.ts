export interface modelDtProductoDevuelto {
  DtDevProdFact_Id?: number;
  DevProdFact_Id: number;
  Prod_Id: number;
  Rollo_Id: number | undefined;
  DtDevProdFact_Cantidad: number;
  UndMed_Id: string;
  Falla_Id : number;
  DtDevprodFact_Factura?: string | null;
  DtDevprodFact_OT?: number | null;
  DtDevprodFact_PesoBruto?: number | null;
  DtDevprodFact_PesoNeto?: number | null;
  Of_Id?: number | null;
}
