/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { Modal_RptRecuperadoMPComponent } from './Modal_RptRecuperadoMP.component';

describe('Modal_RptRecuperadoMPComponent', () => {
  let component: Modal_RptRecuperadoMPComponent;
  let fixture: ComponentFixture<Modal_RptRecuperadoMPComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Modal_RptRecuperadoMPComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Modal_RptRecuperadoMPComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
