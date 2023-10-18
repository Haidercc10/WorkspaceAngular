import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VistasPermisosGuard } from 'src/app/Guards/vistas-permisos.guard';
import { Gestionar_Facturas_Invergoal_InversuezComponent } from 'src/app/Vistas/Gestionar_Facturas_Invergoal_Inversuez/Gestionar_Facturas_Invergoal_Inversuez.component';

const routes: Routes = [
  {
    path: '',
    canActivate: [VistasPermisosGuard], 
    data: {nombre: 'Gestion de Facturas'}, 
    component: Gestionar_Facturas_Invergoal_InversuezComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GestionFacturasInvergoalInversuezRoutingModule { }
