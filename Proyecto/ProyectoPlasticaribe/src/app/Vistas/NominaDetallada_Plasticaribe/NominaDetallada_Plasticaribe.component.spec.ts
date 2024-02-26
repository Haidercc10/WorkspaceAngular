/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { NominaDetallada_PlasticaribeComponent } from './NominaDetallada_Plasticaribe.component';

describe('NominaDetallada_PlasticaribeComponent', () => {
  let component: NominaDetallada_PlasticaribeComponent;
  let fixture: ComponentFixture<NominaDetallada_PlasticaribeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NominaDetallada_PlasticaribeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NominaDetallada_PlasticaribeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
