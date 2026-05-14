import { TestBed } from '@angular/core/testing';

import { UnifiedJwtInterceptor } from './unified-jwt.interceptor';

describe('UnifiedJwtInterceptor', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      UnifiedJwtInterceptor
      ]
  }));

  it('should be created', () => {
    const interceptor: UnifiedJwtInterceptor = TestBed.inject(UnifiedJwtInterceptor);
    expect(interceptor).toBeTruthy();
  });
});
