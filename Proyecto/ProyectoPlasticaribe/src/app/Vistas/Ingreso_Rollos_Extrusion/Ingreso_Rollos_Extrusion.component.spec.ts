/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { Ingreso_Rollos_ExtrusionComponent } from './Ingreso_Rollos_Extrusion.component';

describe('Ingreso_Rollos_ExtrusionComponent', () => {
  let component: Ingreso_Rollos_ExtrusionComponent;
  let fixture: ComponentFixture<Ingreso_Rollos_ExtrusionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Ingreso_Rollos_ExtrusionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Ingreso_Rollos_ExtrusionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
