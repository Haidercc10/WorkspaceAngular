/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { Gestion_DevolucionesOFComponent } from './Gestion_DevolucionesOF.component';

describe('Gestion_DevolucionesOFComponent', () => {
  let component: Gestion_DevolucionesOFComponent;
  let fixture: ComponentFixture<Gestion_DevolucionesOFComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Gestion_DevolucionesOFComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Gestion_DevolucionesOFComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
