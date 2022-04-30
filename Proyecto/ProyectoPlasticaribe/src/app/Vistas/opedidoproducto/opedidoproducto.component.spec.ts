import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OpedidoproductoComponent } from './opedidoproducto.component';

describe('OpedidoproductoComponent', () => {
  let component: OpedidoproductoComponent;
  let fixture: ComponentFixture<OpedidoproductoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OpedidoproductoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OpedidoproductoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
