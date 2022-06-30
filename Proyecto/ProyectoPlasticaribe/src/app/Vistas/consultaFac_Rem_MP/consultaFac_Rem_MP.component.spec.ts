/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { ConsultaFac_Rem_MPComponent } from './consultaFac_Rem_MP.component';

describe('ConsultaFac_Rem_MPComponent', () => {
  let component: ConsultaFac_Rem_MPComponent;
  let fixture: ComponentFixture<ConsultaFac_Rem_MPComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConsultaFac_Rem_MPComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConsultaFac_Rem_MPComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
