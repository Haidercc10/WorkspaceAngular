import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardCalidadComponent } from './dashboard-calidad.component';

describe('DashboardCalidadComponent', () => {
  let component: DashboardCalidadComponent;
  let fixture: ComponentFixture<DashboardCalidadComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DashboardCalidadComponent]
    });
    fixture = TestBed.createComponent(DashboardCalidadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
