/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { Facturacion_OrdenMaquilaComponent } from './Facturacion_OrdenMaquila.component';

describe('Facturacion_OrdenMaquilaComponent', () => {
  let component: Facturacion_OrdenMaquilaComponent;
  let fixture: ComponentFixture<Facturacion_OrdenMaquilaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Facturacion_OrdenMaquilaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Facturacion_OrdenMaquilaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
