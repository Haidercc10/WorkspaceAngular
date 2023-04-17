/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { DashBoard_FacturacionComponent } from './DashBoard_Facturacion.component';

describe('DashBoard_FacturacionComponent', () => {
  let component: DashBoard_FacturacionComponent;
  let fixture: ComponentFixture<DashBoard_FacturacionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DashBoard_FacturacionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DashBoard_FacturacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
