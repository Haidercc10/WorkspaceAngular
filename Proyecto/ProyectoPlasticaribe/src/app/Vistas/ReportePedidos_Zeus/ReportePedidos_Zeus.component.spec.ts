/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { ReportePedidos_ZeusComponent } from './ReportePedidos_Zeus.component';

describe('ReportePedidos_ZeusComponent', () => {
  let component: ReportePedidos_ZeusComponent;
  let fixture: ComponentFixture<ReportePedidos_ZeusComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReportePedidos_ZeusComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReportePedidos_ZeusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
