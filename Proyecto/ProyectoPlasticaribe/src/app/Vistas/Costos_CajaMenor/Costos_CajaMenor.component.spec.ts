/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { Costos_CajaMenorComponent } from './Costos_CajaMenor.component';

describe('Costos_CajaMenorComponent', () => {
  let component: Costos_CajaMenorComponent;
  let fixture: ComponentFixture<Costos_CajaMenorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Costos_CajaMenorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Costos_CajaMenorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
