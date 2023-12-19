import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VistasPermisosGuard } from 'src/app/Guards/vistas-permisos.guard';
import { PreIngresoProduccion_DespachoComponent } from 'src/app/Vistas/PreIngresoProduccion_Despacho/PreIngresoProduccion_Despacho.component';

const routes: Routes = [
  {
    path: '',
    canActivate: [VistasPermisosGuard],
    data: {nombre: 'Pre Ingreso Producción'}, 
    component : PreIngresoProduccion_DespachoComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PreIngresoProduccionDespachoRoutingModule { }
