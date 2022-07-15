import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PruebaImagenCatInsumoComponent } from './prueba-imagen-cat-insumo.component';

describe('PruebaImagenCatInsumoComponent', () => {
  let component: PruebaImagenCatInsumoComponent;
  let fixture: ComponentFixture<PruebaImagenCatInsumoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PruebaImagenCatInsumoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PruebaImagenCatInsumoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
