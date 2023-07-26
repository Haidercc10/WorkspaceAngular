/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { Recibos_CajaComponent } from './Recibos_Caja.component';

describe('Recibos_CajaComponent', () => {
  let component: Recibos_CajaComponent;
  let fixture: ComponentFixture<Recibos_CajaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Recibos_CajaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Recibos_CajaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
