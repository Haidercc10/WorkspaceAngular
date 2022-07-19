import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AsignacionBOPPComponent } from './asignacion-bopp.component';

describe('AsignacionBOPPComponent', () => {
  let component: AsignacionBOPPComponent;
  let fixture: ComponentFixture<AsignacionBOPPComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AsignacionBOPPComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AsignacionBOPPComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
