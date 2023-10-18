import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VistasPermisosGuard } from 'src/app/Guards/vistas-permisos.guard';
import { Gestion_TicketsComponent } from 'src/app/Vistas/Gestion_Tickets/Gestion_Tickets.component';

const routes: Routes = [
  {
    path: '',
    canActivate: [VistasPermisosGuard], 
    data: {nombre : 'Gestionar Tickets'}, 
    component: Gestion_TicketsComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GestionTicketsRoutingModule { }
