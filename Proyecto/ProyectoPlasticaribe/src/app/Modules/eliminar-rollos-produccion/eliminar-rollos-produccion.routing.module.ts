import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { VistasPermisosGuard } from 'src/app/Guards/vistas-permisos.guard';
import { EliminarRollos_ProduccionComponent } from 'src/app/Vistas/EliminarRollos_Produccion/EliminarRollos_Produccion.component';

const routes: Routes = [
  {
    path: '',
    canActivate: [VistasPermisosGuard], 
    data: {nombre: 'Eliminar Rollos Produccion'}, 
    component : EliminarRollos_ProduccionComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EliminarRollos_ProduccionRoutingModule{ }
