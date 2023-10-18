import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VistasPermisosGuard } from 'src/app/Guards/vistas-permisos.guard';
import { AsignarProductosFacturasComponent } from 'src/app/Vistas/AsignarProductosFacturas/AsignarProductosFacturas.component';

const routes: Routes = [
  {
    path: '',
    canActivate: [VistasPermisosGuard], 
    data: {nombre: 'Facturar Rollos'}, 
    component : AsignarProductosFacturasComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FacturacionRollosRoutingModule { }
