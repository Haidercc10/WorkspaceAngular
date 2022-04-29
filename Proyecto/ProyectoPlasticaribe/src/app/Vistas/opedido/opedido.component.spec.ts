import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OpedidoComponent } from './opedido.component';

describe('OpedidoComponent', () => {
  let component: OpedidoComponent;
  let fixture: ComponentFixture<OpedidoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OpedidoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OpedidoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
