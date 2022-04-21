import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule, Routes } from '@angular/router';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { LoginComponentComponent } from './Vista/login-component/login-component.component';
import { RegistroComponentComponent } from './Vista/registro-component/registro-component.component';
import { PrincipalComponent } from './Vista/principal/principal.component';
import { ReactiveFormsModule } from '@angular/forms';
<<<<<<< Updated upstream




=======
>>>>>>> Stashed changes

export const routes: Routes = [

  {path: 'login', component: LoginComponentComponent},
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
