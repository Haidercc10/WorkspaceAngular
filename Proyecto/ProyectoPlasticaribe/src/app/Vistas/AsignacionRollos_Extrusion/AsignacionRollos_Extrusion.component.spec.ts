/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { AsignacionRollos_ExtrusionComponent } from './AsignacionRollos_Extrusion.component';

describe('AsignacionRollos_ExtrusionComponent', () => {
  let component: AsignacionRollos_ExtrusionComponent;
  let fixture: ComponentFixture<AsignacionRollos_ExtrusionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AsignacionRollos_ExtrusionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AsignacionRollos_ExtrusionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
