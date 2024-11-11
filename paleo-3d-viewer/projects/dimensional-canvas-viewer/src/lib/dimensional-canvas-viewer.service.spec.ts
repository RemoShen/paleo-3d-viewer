import { TestBed } from '@angular/core/testing';

import { DimensionalCanvasViewerService } from './dimensional-canvas-viewer.service';

describe('DimensionalCanvasViewerService', () => {
  let service: DimensionalCanvasViewerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DimensionalCanvasViewerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
