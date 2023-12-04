import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VistasPermisosGuard } from 'src/app/Guards/vistas-permisos.guard';
import { SalidaProduccion_DespachoComponent } from 'src/app/Vistas/SalidaProduccion_Despacho/SalidaProduccion_Despacho.component';

const routes: Routes = [
  {
    path: '',
    canActivate: [VistasPermisosGuard], 
    data: {nombre: 'Despacho de Mercancia'}, 
    component : SalidaProduccion_DespachoComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SalidaProduccionDespachoRoutingModule { }
