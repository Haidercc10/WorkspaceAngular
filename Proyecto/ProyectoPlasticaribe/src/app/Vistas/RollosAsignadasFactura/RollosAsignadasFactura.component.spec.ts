/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { RollosAsignadasFacturaComponent } from './RollosAsignadasFactura.component';

describe('RollosAsignadasFacturaComponent', () => {
  let component: RollosAsignadasFacturaComponent;
  let fixture: ComponentFixture<RollosAsignadasFacturaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RollosAsignadasFacturaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RollosAsignadasFacturaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
