import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VistasPermisosGuard } from 'src/app/Guards/vistas-permisos.guard';
import { Movimientos_DespachoComponent } from 'src/app/Vistas/Movimientos_Despacho/Movimientos_Despacho.component';

const routes: Routes = [
  {
    path: '',
    canActivate: [VistasPermisosGuard], 
    data: {nombre: 'Movimientos Despacho'}, 
    component : Movimientos_DespachoComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MovimientosDespachoRoutingModule { }
