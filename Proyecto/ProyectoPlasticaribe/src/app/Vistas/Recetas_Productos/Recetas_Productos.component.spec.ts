/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { Recetas_ProductosComponent } from './Recetas_Productos.component';

describe('Recetas_ProductosComponent', () => {
  let component: Recetas_ProductosComponent;
  let fixture: ComponentFixture<Recetas_ProductosComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Recetas_ProductosComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Recetas_ProductosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
