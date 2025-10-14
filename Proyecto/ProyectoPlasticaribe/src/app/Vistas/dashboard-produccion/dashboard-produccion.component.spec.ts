import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardProduccionComponent } from './dashboard-produccion.component';

describe('DashboardProduccionComponent', () => {
  let component: DashboardProduccionComponent;
  let fixture: ComponentFixture<DashboardProduccionComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DashboardProduccionComponent]
    });
    fixture = TestBed.createComponent(DashboardProduccionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
