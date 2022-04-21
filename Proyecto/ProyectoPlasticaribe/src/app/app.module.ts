import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule, Routes } from '@angular/router';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
<<<<<<< HEAD
<<<<<<< HEAD
import { LoginComponentComponent } from './Vista/login-component/login-component.component';
import { RegistroComponentComponent } from './Vista/registro-component/registro-component.component';
import { PrincipalComponent } from './Vista/principal/principal.component';
import { ReactiveFormsModule } from '@angular/forms';
=======
=======
>>>>>>> 3105bda35c236ac1c782e16715c4dee5dea1b8f0
import { LoginComponentComponent } from './Vistas/login-component/login-component.component';
import { RegistroComponentComponent } from './Vistas/registro-component/registro-component.component';
import { PrincipalComponent } from './Vistas/principal/principal.component';

<<<<<<< HEAD
>>>>>>> 239d2cf5c50c7a2bea9f29dd6b8d00abd7f5e1f7
=======
>>>>>>> 3105bda35c236ac1c782e16715c4dee5dea1b8f0


export const routes: Routes = [

  {path: '', component: LoginComponentComponent},
  {path: 'registro', component: RegistroComponentComponent},
  {path: 'principal', component: PrincipalComponent},


]

@NgModule({
  declarations: [
    AppComponent,
    RegistroComponentComponent,
    LoginComponentComponent,
    PrincipalComponent],


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
