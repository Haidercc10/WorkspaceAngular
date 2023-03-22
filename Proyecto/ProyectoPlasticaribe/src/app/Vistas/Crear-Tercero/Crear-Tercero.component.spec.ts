/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { CrearTerceroComponent } from './Crear-Tercero.component';

describe('CrearTerceroComponent', () => {
  let component: CrearTerceroComponent;
  let fixture: ComponentFixture<CrearTerceroComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CrearTerceroComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CrearTerceroComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
