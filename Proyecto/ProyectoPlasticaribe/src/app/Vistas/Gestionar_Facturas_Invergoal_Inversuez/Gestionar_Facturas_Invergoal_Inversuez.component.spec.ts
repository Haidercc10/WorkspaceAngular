/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { Gestionar_Facturas_Invergoal_InversuezComponent } from './Gestionar_Facturas_Invergoal_Inversuez.component';

describe('Gestionar_Facturas_Invergoal_InversuezComponent', () => {
  let component: Gestionar_Facturas_Invergoal_InversuezComponent;
  let fixture: ComponentFixture<Gestionar_Facturas_Invergoal_InversuezComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Gestionar_Facturas_Invergoal_InversuezComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Gestionar_Facturas_Invergoal_InversuezComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
