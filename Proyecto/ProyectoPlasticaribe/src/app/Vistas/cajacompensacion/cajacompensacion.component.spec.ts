import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CajacompensacionComponent } from './cajacompensacion.component';

describe('CajacompensacionComponent', () => {
  let component: CajacompensacionComponent;
  let fixture: ComponentFixture<CajacompensacionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CajacompensacionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CajacompensacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
