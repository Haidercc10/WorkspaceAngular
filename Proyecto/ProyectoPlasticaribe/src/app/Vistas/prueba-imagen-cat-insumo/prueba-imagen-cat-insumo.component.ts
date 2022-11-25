import { Component, OnInit, Input, Injectable } from '@angular/core';
import { ProductService } from './productservice';
import { ConfirmationService, ConfirmEventType } from 'primeng/api';
import { MessageService } from 'primeng/api';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})

@Component({
  selector: 'app-prueba-imagen-cat-insumo',
  templateUrl: './prueba-imagen-cat-insumo.component.html',
  styleUrls: ['./prueba-imagen-cat-insumo.component.css']
})


export class PruebaImagenCatInsumoComponent implements OnInit {
  position: string;

  constructor(private confirmationService: ConfirmationService, private messageService: MessageService) {}
  ngOnInit(): void {
    // throw new Error('Method not implemented.');
  }

  confirm1() {
    this.confirmationService.confirm({
      message: 'a',
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        // this.messageService.add({severity:'info', summary:'Confirmed', detail:'You have accepted'});
        console.log(3)
      },
      reject: (type) => {
        switch(type) {
          case ConfirmEventType.REJECT:
            // this.messageService.add({severity:'error', summary:'Rejected', detail:'You have rejected'});
            console.log(1)
          break;
          case ConfirmEventType.CANCEL:
            // this.messageService.add({severity:'warn', summary:'Cancelled', detail:'You have cancelled'});
            console.log(2)
          break;
        }
      }
    });
  }

}
