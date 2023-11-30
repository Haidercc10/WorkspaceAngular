import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root'
})

export class Web_ContactoCorreoService {

    readonly rutaPlasticaribeAPI = environment.rutaPlasticaribeAPI;

    constructor(private http : HttpClient) { }

    SendMail = (data : any) => this.http.post(`${this.rutaPlasticaribeAPI}/Web_ContactoCorreo/Envio_Correo`, data);
}
