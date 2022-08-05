import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReporteEstadosOTComponent } from './reporte-estados-ot.component';

describe('ReporteEstadosOTComponent', () => {
  let component: ReporteEstadosOTComponent;
  let fixture: ComponentFixture<ReporteEstadosOTComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReporteEstadosOTComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReporteEstadosOTComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
