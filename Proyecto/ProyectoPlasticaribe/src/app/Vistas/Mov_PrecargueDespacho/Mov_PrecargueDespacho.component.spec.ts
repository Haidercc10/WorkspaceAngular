/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { Mov_PrecargueDespachoComponent } from './Mov_PrecargueDespacho.component';

describe('Mov_PrecargueDespachoComponent', () => {
  let component: Mov_PrecargueDespachoComponent;
  let fixture: ComponentFixture<Mov_PrecargueDespachoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Mov_PrecargueDespachoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Mov_PrecargueDespachoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
