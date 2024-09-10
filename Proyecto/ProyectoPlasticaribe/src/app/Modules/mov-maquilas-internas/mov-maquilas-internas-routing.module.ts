import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VistasPermisosGuard } from 'src/app/Guards/vistas-permisos.guard';
import { MovMaquilas_InternasComponent } from 'src/app/Vistas/MovMaquilas_Internas/MovMaquilas_Internas.component';

const routes: Routes = [
  {
    path: '',
    canActivate: [VistasPermisosGuard], 
    data: {nombre: 'Mov. Maquilas Internas'}, 
    component : MovMaquilas_InternasComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MovMaquilasInternasRoutingModule { }
