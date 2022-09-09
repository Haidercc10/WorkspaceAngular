/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { Entrada_TintasComponent } from './Entrada_Tintas.component';

describe('Entrada_TintasComponent', () => {
  let component: Entrada_TintasComponent;
  let fixture: ComponentFixture<Entrada_TintasComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Entrada_TintasComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Entrada_TintasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
