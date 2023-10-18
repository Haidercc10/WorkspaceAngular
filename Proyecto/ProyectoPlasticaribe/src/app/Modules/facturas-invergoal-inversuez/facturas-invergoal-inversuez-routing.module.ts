import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VistasPermisosGuard } from 'src/app/Guards/vistas-permisos.guard';
import { Facturas_Invergoal_InversuezComponent } from 'src/app/Vistas/Facturas_Invergoal_Inversuez/Facturas_Invergoal_Inversuez.component';

const routes: Routes = [
  {
    path: '',
    canActivate: [VistasPermisosGuard], 
    data: {nombre: 'Ingreso de Facturas'}, 
    component: Facturas_Invergoal_InversuezComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FacturasInvergoalInversuezRoutingModule { }
