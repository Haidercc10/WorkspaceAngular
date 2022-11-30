/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { Ventas_TemporalesComponent } from './Ventas_Temporales.component';

describe('Ventas_TemporalesComponent', () => {
  let component: Ventas_TemporalesComponent;
  let fixture: ComponentFixture<Ventas_TemporalesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Ventas_TemporalesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Ventas_TemporalesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
