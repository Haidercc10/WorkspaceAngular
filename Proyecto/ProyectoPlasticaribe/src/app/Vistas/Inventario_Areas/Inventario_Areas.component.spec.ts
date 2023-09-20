/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { Inventario_AreasComponent } from './Inventario_Areas.component';

describe('Inventario_AreasComponent', () => {
  let component: Inventario_AreasComponent;
  let fixture: ComponentFixture<Inventario_AreasComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Inventario_AreasComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Inventario_AreasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
