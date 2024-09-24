/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { Maquilas_InternasComponent } from './Maquilas_Internas.component';

describe('Maquilas_InternasComponent', () => {
  let component: Maquilas_InternasComponent;
  let fixture: ComponentFixture<Maquilas_InternasComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Maquilas_InternasComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Maquilas_InternasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
