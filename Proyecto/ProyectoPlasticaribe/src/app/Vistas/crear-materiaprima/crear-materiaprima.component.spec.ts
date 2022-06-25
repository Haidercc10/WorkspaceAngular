import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrearMateriaprimaComponent } from './crear-materiaprima.component';

describe('CrearMateriaprimaComponent', () => {
  let component: CrearMateriaprimaComponent;
  let fixture: ComponentFixture<CrearMateriaprimaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CrearMateriaprimaComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CrearMateriaprimaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
