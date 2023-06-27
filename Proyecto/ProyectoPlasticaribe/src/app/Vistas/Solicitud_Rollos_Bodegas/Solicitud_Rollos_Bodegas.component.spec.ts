/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { Solicitud_Rollos_BodegasComponent } from './Solicitud_Rollos_Bodegas.component';

describe('Solicitud_Rollos_BodegasComponent', () => {
  let component: Solicitud_Rollos_BodegasComponent;
  let fixture: ComponentFixture<Solicitud_Rollos_BodegasComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Solicitud_Rollos_BodegasComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Solicitud_Rollos_BodegasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
