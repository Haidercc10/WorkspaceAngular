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

  productDialog: boolean;

  products: any

  product: any;

  selectedProducts:any [];

  submitted: boolean;

  constructor(private productService: ProductService, private messageService: MessageService, private confirmationService: ConfirmationService) { }

  ngOnInit() {
    this.products = this.productService.getProducts();
  }

  openNew() {
    this.product = {};
    this.submitted = false;
    this.productDialog = true;
  }

  deleteSelectedProducts() {
    this.confirmationService.confirm({
        message: 'Are you sure you want to delete the selected products?',
        header: 'Confirm',
        icon: 'pi pi-exclamation-triangle',
        accept: () => {
            this.products = this.products.filter(val => !this.selectedProducts.includes(val));
            this.selectedProducts = null;
            this.messageService.add({severity:'success', summary: 'Successful', detail: 'Products Deleted', life: 3000});
        }
    });
  }

  editProduct(product) {
    this.product = {...product};
    this.productDialog = true;
    console.log(product)
  }

  deleteProduct(product) {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete ' + product.name + '?',
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.products = this.products.filter(val => val.id !== product.id);
        this.product = {};
        this.messageService.add({severity:'success', summary: 'Successful', detail: 'Product Deleted', life: 3000});
      }
    });
  }

  hideDialog() {
    this.productDialog = false;
    this.submitted = false;
  }

  saveProduct() {
    this.submitted = true;

    if (this.product.name.trim()) {
      if (this.product.id) {
        this.products[this.findIndexById(this.product.id)] = this.product;
        this.messageService.add({severity:'success', summary: 'Successful', detail: 'Product Updated', life: 3000});
      }
      else {
        this.product.id = this.createId();
        this.product.image = 'product-placeholder.svg';
        this.products.push(this.product);
        this.messageService.add({severity:'success', summary: 'Successful', detail: 'Product Created', life: 3000});
      }

      this.products = [...this.products];
      this.productDialog = false;
      this.product = {};
    }
  }

  findIndexById(id: string): number {
    let index = -1;
    for (let i = 0; i < this.products.length; i++) {
      if (this.products[i].id === id) {
        index = i;
        break;
      }
    }

    return index;
  }

  createId(): string {
    let id = '';
    var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for ( var i = 0; i < 5; i++ ) {
      id += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return id;
  }

  // products1: any;

  // products2: any;

  // statuses: any [];

  // clonedProducts: { [s: string]: any; } = {};

  // constructor(private productService: ProductService, private messageService: MessageService) { }

  // ngOnInit() {
  //   this.products1 = this.productService.getProducts();
  //   this.products2 = this.productService.getProducts();

  //   this.statuses = [{label: 'In Stock', value: 'INSTOCK'},{label: 'Low Stock', value: 'LOWSTOCK'},{label: 'Out of Stock', value: 'OUTOFSTOCK'}]
  // }

  // onRowEditInit(product: any) {
  //   this.clonedProducts[product.id] = {...product};
  // }

  // onRowEditSave(product: any) {
  //   if (product.price > 0) {
  //     delete this.clonedProducts[product.id];
  //     this.messageService.add({severity:'success', summary: 'Success', detail:'Product is updated'});
  //   }
  //   else {
  //     this.messageService.add({severity:'error', summary: 'Error', detail:'Invalid Price'});
  //   }
  // }

  // onRowEditCancel(product: any, index: number) {
  //   this.products2[index] = this.clonedProducts[product.id];
  //   delete this.products2[product.id];
  // }
}
