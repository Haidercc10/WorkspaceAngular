import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrearUnidadesMedidasComponent } from './crear-unidades-medidas.component';

describe('CrearUnidadesMedidasComponent', () => {
  let component: CrearUnidadesMedidasComponent;
  let fixture: ComponentFixture<CrearUnidadesMedidasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CrearUnidadesMedidasComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CrearUnidadesMedidasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
