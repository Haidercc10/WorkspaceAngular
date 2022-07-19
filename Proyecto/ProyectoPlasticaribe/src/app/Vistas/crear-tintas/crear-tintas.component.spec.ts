import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrearTintasComponent } from './crear-tintas.component';

describe('CrearTintasComponent', () => {
  let component: CrearTintasComponent;
  let fixture: ComponentFixture<CrearTintasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CrearTintasComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CrearTintasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
