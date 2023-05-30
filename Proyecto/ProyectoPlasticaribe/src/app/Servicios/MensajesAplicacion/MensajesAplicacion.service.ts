import { Injectable } from '@angular/core';
import { MessageService } from 'primeng/api';

@Injectable({ providedIn: 'root'})

export class MensajesAplicacionService {

  constructor(private messageService: MessageService,) { }

  mensajeError = (titulo : string, detalles : string) => this.messageService.add({severity:'error', summary: titulo, detail: detalles });

  mensajeAdvertencia = (titulo : string, detalles : string) => this.messageService.add({severity:'warn', summary: titulo, detail: detalles });

  mensajeConfirmación = (titulo : string, detalles : string) => this.messageService.add({severity:'success', summary: titulo, detail: detalles });
}
