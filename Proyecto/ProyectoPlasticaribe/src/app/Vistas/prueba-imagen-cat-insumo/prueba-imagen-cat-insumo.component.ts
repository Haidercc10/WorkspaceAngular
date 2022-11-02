import { Component, OnInit, Input, Injectable } from '@angular/core';
import { ProductService } from './productservice';
import { ConfirmationService } from 'primeng/api';
import { MessageService } from 'primeng/api';

@Injectable({
  providedIn: 'root'
})

@Component({
  selector: 'app-prueba-imagen-cat-insumo',
  templateUrl: './prueba-imagen-cat-insumo.component.html',
  styleUrls: ['./prueba-imagen-cat-insumo.component.css']
})


export class PruebaImagenCatInsumoComponent implements OnInit {

  products: any

  selectedProducts:any [];
  first = 0;
  rows = 10;

  constructor(private productService: ProductService, private messageService: MessageService, private confirmationService: ConfirmationService) { }

  ngOnInit() {
    this.products = this.productService.getProducts();

  }

  click(){
    console.log(this.selectedProducts)
  }

}
