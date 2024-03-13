/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { Crear_FallasComponent } from './Crear_Fallas.component';

describe('Crear_FallasComponent', () => {
  let component: Crear_FallasComponent;
  let fixture: ComponentFixture<Crear_FallasComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Crear_FallasComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Crear_FallasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
