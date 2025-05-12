import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SolicitudRollosAreasComponent } from './solicitud-rollos-areas.component';

describe('SolicitudRollosAreasComponent', () => {
  let component: SolicitudRollosAreasComponent;
  let fixture: ComponentFixture<SolicitudRollosAreasComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SolicitudRollosAreasComponent]
    });
    fixture = TestBed.createComponent(SolicitudRollosAreasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
