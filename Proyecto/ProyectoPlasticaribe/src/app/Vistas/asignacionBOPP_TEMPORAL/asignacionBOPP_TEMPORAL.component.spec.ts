/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { AsignacionBOPP_TEMPORALComponent } from './asignacionBOPP_TEMPORAL.component';

describe('AsignacionBOPP_TEMPORALComponent', () => {
  let component: AsignacionBOPP_TEMPORALComponent;
  let fixture: ComponentFixture<AsignacionBOPP_TEMPORALComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AsignacionBOPP_TEMPORALComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AsignacionBOPP_TEMPORALComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
