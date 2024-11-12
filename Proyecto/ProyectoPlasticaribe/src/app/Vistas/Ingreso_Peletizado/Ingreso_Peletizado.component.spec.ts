/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { Ingreso_PeletizadoComponent } from './Ingreso_Peletizado.component';

describe('Ingreso_PeletizadoComponent', () => {
  let component: Ingreso_PeletizadoComponent;
  let fixture: ComponentFixture<Ingreso_PeletizadoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Ingreso_PeletizadoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Ingreso_PeletizadoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
