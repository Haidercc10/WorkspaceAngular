import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VistasPermisosGuard } from 'src/app/Guards/vistas-permisos.guard';
import { MovTrazabilidadProduccionComponent } from 'src/app/Vistas/mov-trazabilidad-produccion/mov-trazabilidad-produccion.component';

const routes: Routes = [
  {
      path: '',
      canActivate: [VistasPermisosGuard], 
      data: { nombre: 'Reposiciones Carta' }, 
      component : MovTrazabilidadProduccionComponent,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReporteTrazabilidadProduccionRoutingModule { }
