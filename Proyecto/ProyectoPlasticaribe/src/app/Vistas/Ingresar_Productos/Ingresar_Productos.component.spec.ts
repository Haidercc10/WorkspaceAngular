/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { Ingresar_ProductosComponent } from './Ingresar_Productos.component';

describe('Ingresar_ProductosComponent', () => {
  let component: Ingresar_ProductosComponent;
  let fixture: ComponentFixture<Ingresar_ProductosComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Ingresar_ProductosComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Ingresar_ProductosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
