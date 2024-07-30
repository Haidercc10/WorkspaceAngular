/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { Precargue_RollosDespachoComponent } from './Precargue_RollosDespacho.component';

describe('Precargue_RollosDespachoComponent', () => {
  let component: Precargue_RollosDespachoComponent;
  let fixture: ComponentFixture<Precargue_RollosDespachoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Precargue_RollosDespachoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Precargue_RollosDespachoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
