/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { Diferencias_InventarioComponent } from './Diferencias_Inventario.component';

describe('Diferencias_InventarioComponent', () => {
  let component: Diferencias_InventarioComponent;
  let fixture: ComponentFixture<Diferencias_InventarioComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Diferencias_InventarioComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Diferencias_InventarioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
