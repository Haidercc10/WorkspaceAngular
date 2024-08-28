/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { Nomina_CorteComponent } from './Nomina_Corte.component';

describe('Nomina_CorteComponent', () => {
  let component: Nomina_CorteComponent;
  let fixture: ComponentFixture<Nomina_CorteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Nomina_CorteComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Nomina_CorteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
