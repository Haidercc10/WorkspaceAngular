/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { ControlCalidad_SelladoComponent } from './ControlCalidad_Sellado.component';

describe('ControlCalidad_SelladoComponent', () => {
  let component: ControlCalidad_SelladoComponent;
  let fixture: ComponentFixture<ControlCalidad_SelladoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ControlCalidad_SelladoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ControlCalidad_SelladoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
