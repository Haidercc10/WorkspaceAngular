/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { Inventario_Bodegas_RollosComponent } from './Inventario_Bodegas_Rollos.component';

describe('Inventario_Bodegas_RollosComponent', () => {
  let component: Inventario_Bodegas_RollosComponent;
  let fixture: ComponentFixture<Inventario_Bodegas_RollosComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Inventario_Bodegas_RollosComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Inventario_Bodegas_RollosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
