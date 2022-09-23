/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { PreIngresoRollosExtrusionComponent } from './PreIngresoRollosExtrusion.component';

describe('PreIngresoRollosExtrusionComponent', () => {
  let component: PreIngresoRollosExtrusionComponent;
  let fixture: ComponentFixture<PreIngresoRollosExtrusionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PreIngresoRollosExtrusionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PreIngresoRollosExtrusionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
