/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { ReporteBodegaExtrusionComponent } from './ReporteBodegaExtrusion.component';

describe('ReporteBodegaExtrusionComponent', () => {
  let component: ReporteBodegaExtrusionComponent;
  let fixture: ComponentFixture<ReporteBodegaExtrusionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReporteBodegaExtrusionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReporteBodegaExtrusionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
