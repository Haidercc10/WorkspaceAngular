/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { DevolucionesMPComponent } from './devolucionesMP.component';

describe('DevolucionesMPComponent', () => {
  let component: DevolucionesMPComponent;
  let fixture: ComponentFixture<DevolucionesMPComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DevolucionesMPComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DevolucionesMPComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
