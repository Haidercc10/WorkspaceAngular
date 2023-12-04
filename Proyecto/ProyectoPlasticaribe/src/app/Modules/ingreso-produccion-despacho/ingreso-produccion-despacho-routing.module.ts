import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VistasPermisosGuard } from 'src/app/Guards/vistas-permisos.guard';
import { IngresoProduccion_DespachoComponent } from 'src/app/Vistas/IngresoProduccion_Despacho/IngresoProduccion_Despacho.component';

const routes: Routes = [
  {
    path: '',
    canActivate: [VistasPermisosGuard], 
    data: {nombre: 'Ingreso a Despacho'}, 
    component : IngresoProduccion_DespachoComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class IngresoProduccionDespachoRoutingModule { }
