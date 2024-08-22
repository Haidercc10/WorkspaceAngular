import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VistasPermisosGuard } from 'src/app/Guards/vistas-permisos.guard';
import { Reempaque_ProduccionComponent } from 'src/app/Vistas/Reempaque_Produccion/Reempaque_Produccion.component';

const routes: Routes = [
  {
    path: '',
    component: Reempaque_ProduccionComponent,
    canActivate: [VistasPermisosGuard], 
    data: {nombre: 'Reempaque Sellado'}, 
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReempaqueSelladoRoutingModule { }
