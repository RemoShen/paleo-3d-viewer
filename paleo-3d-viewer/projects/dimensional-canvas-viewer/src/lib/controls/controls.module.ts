import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlsComponent } from './controls.component';
import { SharedStateService } from '../shared-state.service';

@NgModule({
  declarations: [ControlsComponent],
  imports: [CommonModule],
  exports: [ControlsComponent],
  providers: [SharedStateService]  // 提供服务
})
export class ControlsModule {}
