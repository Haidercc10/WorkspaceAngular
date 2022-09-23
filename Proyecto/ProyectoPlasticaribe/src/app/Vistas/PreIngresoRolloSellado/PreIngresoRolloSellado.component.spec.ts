/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { PreIngresoRolloSelladoComponent } from './PreIngresoRolloSellado.component';

describe('PreIngresoRolloSelladoComponent', () => {
  let component: PreIngresoRolloSelladoComponent;
  let fixture: ComponentFixture<PreIngresoRolloSelladoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PreIngresoRolloSelladoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PreIngresoRolloSelladoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
