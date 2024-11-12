/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { Mov_IngresoPeletizadoComponent } from './Mov_IngresoPeletizado.component';

describe('Mov_IngresoPeletizadoComponent', () => {
  let component: Mov_IngresoPeletizadoComponent;
  let fixture: ComponentFixture<Mov_IngresoPeletizadoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Mov_IngresoPeletizadoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Mov_IngresoPeletizadoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
