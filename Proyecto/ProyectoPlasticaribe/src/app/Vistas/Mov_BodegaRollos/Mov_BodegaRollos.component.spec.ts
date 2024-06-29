/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { Mov_BodegaRollosComponent } from './Mov_BodegaRollos.component';

describe('Mov_BodegaRollosComponent', () => {
  let component: Mov_BodegaRollosComponent;
  let fixture: ComponentFixture<Mov_BodegaRollosComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Mov_BodegaRollosComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Mov_BodegaRollosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
