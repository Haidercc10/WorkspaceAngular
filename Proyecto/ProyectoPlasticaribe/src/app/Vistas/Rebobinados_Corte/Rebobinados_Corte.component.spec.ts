/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { Rebobinados_CorteComponent } from './Rebobinados_Corte.component';

describe('Rebobinados_CorteComponent', () => {
  let component: Rebobinados_CorteComponent;
  let fixture: ComponentFixture<Rebobinados_CorteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Rebobinados_CorteComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Rebobinados_CorteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
