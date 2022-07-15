import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MateriasPrimasComponent } from './materias-primas.component';

describe('MateriasPrimasComponent', () => {
  let component: MateriasPrimasComponent;
  let fixture: ComponentFixture<MateriasPrimasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MateriasPrimasComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MateriasPrimasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
