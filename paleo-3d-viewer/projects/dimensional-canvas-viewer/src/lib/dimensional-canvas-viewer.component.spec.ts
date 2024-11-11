import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DimensionalCanvasViewerComponent } from './dimensional-canvas-viewer.component';

describe('DimensionalCanvasViewerComponent', () => {
  let component: DimensionalCanvasViewerComponent;
  let fixture: ComponentFixture<DimensionalCanvasViewerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DimensionalCanvasViewerComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DimensionalCanvasViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});