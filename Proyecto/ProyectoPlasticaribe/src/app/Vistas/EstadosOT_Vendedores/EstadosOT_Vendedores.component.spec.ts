/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { EstadosOT_VendedoresComponent } from './EstadosOT_Vendedores.component';

describe('EstadosOT_VendedoresComponent', () => {
  let component: EstadosOT_VendedoresComponent;
  let fixture: ComponentFixture<EstadosOT_VendedoresComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EstadosOT_VendedoresComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EstadosOT_VendedoresComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
