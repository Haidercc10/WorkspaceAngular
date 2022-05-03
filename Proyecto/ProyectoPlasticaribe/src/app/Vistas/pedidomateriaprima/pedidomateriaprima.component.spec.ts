import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PedidomateriaprimaComponent } from './pedidomateriaprima.component';

describe('PedidomateriaprimaComponent', () => {
  let component: PedidomateriaprimaComponent;
  let fixture: ComponentFixture<PedidomateriaprimaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PedidomateriaprimaComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PedidomateriaprimaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
