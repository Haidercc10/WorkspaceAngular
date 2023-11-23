import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VistasPermisosGuard } from 'src/app/Guards/vistas-permisos.guard';
import { Produccion_SelladoComponent } from 'src/app/Vistas/Produccion_Sellado/Produccion_Sellado.component';

const routes: Routes = [
  {
    path: '',
    canActivate : [VistasPermisosGuard],
    data : { nombre : 'Producción Sellado'}, 
    component : Produccion_SelladoComponent
  }
]

@NgModule({
  declarations: [],
  imports: [RouterModule.forChild(routes)], 
  exports: [RouterModule]
})
export class ProduccionSelladoRoutingModule { }
