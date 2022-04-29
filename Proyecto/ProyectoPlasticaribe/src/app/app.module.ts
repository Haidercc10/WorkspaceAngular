import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule, Routes } from '@angular/router';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponentComponent } from './Vistas/login-component/login-component.component';
import { RegistroComponentComponent } from './Vistas/registro-component/registro-component.component';
import { PrincipalComponent } from './Vistas/principal/principal.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { AreasComponentComponent } from './Vistas/areas-component/areas-component.component';
import { ServicioAreasService } from './Servicios/servicio-areas.service';
import { ReportesComponent } from './Vistas/reportes/reportes.component';
import { InicioComponent } from './Vistas/inicio/inicio.component';
import { PprincipalComponent } from './Vistas/pprincipal/pprincipal.component';
import { RolesComponentComponent } from './Vistas/roles-component/roles-component.component';
import { FpensionComponent } from './Vistas/fpension/fpension.component';
import { EpsComponent } from './Vistas/eps/eps.component';
import { CajacompensacionComponent } from './Vistas/cajacompensacion/cajacompensacion.component';





export const routes: Routes = [

  {path: '', component: InicioComponent},
  {path: 'registro', component: RegistroComponentComponent},
  {path: 'principal', component: PrincipalComponent},
  {path: 'areas', component: AreasComponentComponent},
  {path: 'login', component: LoginComponentComponent},
  {path: 'reportes', component: ReportesComponent},
  {path: 'roles', component: RolesComponentComponent},
  {path: 'pprincipal', component: PprincipalComponent},


]

@NgModule({
  declarations: [
    AppComponent,
    RegistroComponentComponent,
    LoginComponentComponent,
    PrincipalComponent,
    InicioComponent,
    PprincipalComponent,
    AreasComponentComponent,
    InicioComponent,
    RolesComponentComponent,
    FpensionComponent,
    EpsComponent,
    CajacompensacionComponent],



  imports: [
    BrowserModule,
    ReactiveFormsModule,
    AppRoutingModule,
    RouterModule.forRoot(routes),
    HttpClientModule,
    FormsModule



  ],
  providers: [ServicioAreasService],
  bootstrap: [AppComponent]
})
export class AppModule { }
