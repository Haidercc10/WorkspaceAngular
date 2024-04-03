/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { OrdenFacturacion_PalletsComponent } from './OrdenFacturacion_Pallets.component';

describe('OrdenFacturacion_PalletsComponent', () => {
  let component: OrdenFacturacion_PalletsComponent;
  let fixture: ComponentFixture<OrdenFacturacion_PalletsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OrdenFacturacion_PalletsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OrdenFacturacion_PalletsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
