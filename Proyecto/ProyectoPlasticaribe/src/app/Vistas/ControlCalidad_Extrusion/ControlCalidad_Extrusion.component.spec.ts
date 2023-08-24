/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { ControlCalidad_ExtrusionComponent } from './ControlCalidad_Extrusion.component';

describe('ControlCalidad_ExtrusionComponent', () => {
  let component: ControlCalidad_ExtrusionComponent;
  let fixture: ComponentFixture<ControlCalidad_ExtrusionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ControlCalidad_ExtrusionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ControlCalidad_ExtrusionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
