import { NgModule } from '@angular/core';
import { DimensionalCanvasViewerComponent } from './dimensional-canvas-viewer.component';
import { ControlsModule } from './controls/controls.module';
import { HelpersModule } from './helpers/helpers.module';
import { InteractionsModule } from './interactions/interactions.module';
import { HistogramModule } from './histogram/histogram.module';
import { ModelLoaderModule } from './model-loader/model-loader.module';
import { CommonModule } from '@angular/common';

@NgModule({
  declarations: [DimensionalCanvasViewerComponent],
  imports: [
    ControlsModule,
    HelpersModule,
    InteractionsModule,
    HistogramModule,
    ModelLoaderModule,
    CommonModule,
  ],
  exports: [DimensionalCanvasViewerComponent],
})
export class DimensionalCanvasViewerModule {}
