/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { MovMaquilas_InternasComponent } from './MovMaquilas_Internas.component';

describe('MovMaquilas_InternasComponent', () => {
  let component: MovMaquilas_InternasComponent;
  let fixture: ComponentFixture<MovMaquilas_InternasComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MovMaquilas_InternasComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MovMaquilas_InternasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
