import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrearCategoriasMPComponent } from './crear-categorias-mp.component';

describe('CrearCategoriasMPComponent', () => {
  let component: CrearCategoriasMPComponent;
  let fixture: ComponentFixture<CrearCategoriasMPComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CrearCategoriasMPComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CrearCategoriasMPComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
