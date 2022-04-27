import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule, Routes } from '@angular/router';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponentComponent } from './Vistas/login-component/login-component.component';
import { RegistroComponentComponent } from './Vistas/registro-component/registro-component.component';
import { PrincipalComponent } from './Vistas/principal/principal.component';
import { ReportesComponent } from './Vistas/reportes/reportes.component';
import { ReactiveFormsModule } from '@angular/forms';
import { InicioComponent } from './Vistas/inicio/inicio.component';
import { PprincipalComponent } from './Vistas/pprincipal/pprincipal.component';


export const routes: Routes = [

  {path: '', component: LoginComponentComponent},
  {path: 'registro', component: RegistroComponentComponent},
  {path: 'principal', component: PrincipalComponent},
  {path: 'inicio', component: InicioComponent},
  {path: 'reportes', component: ReportesComponent},
  {path: 'pprincipal', component: PprincipalComponent},

]

@NgModule({
  declarations: [
    AppComponent,
    RegistroComponentComponent,
    LoginComponentComponent,
    PrincipalComponent,
    InicioComponent,
    PprincipalComponent],

  imports: [
    BrowserModule,
    ReactiveFormsModule,
    AppRoutingModule,
    RouterModule.forRoot(routes)



  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
