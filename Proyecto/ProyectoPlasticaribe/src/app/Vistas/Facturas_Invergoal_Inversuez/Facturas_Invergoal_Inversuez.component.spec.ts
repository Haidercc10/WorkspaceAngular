/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { Facturas_Invergoal_InversuezComponent } from './Facturas_Invergoal_Inversuez.component';

describe('Facturas_Invergoal_InversuezComponent', () => {
  let component: Facturas_Invergoal_InversuezComponent;
  let fixture: ComponentFixture<Facturas_Invergoal_InversuezComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Facturas_Invergoal_InversuezComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Facturas_Invergoal_InversuezComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
