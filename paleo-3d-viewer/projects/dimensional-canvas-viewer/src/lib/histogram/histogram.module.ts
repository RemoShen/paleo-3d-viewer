import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HistogramComponent } from './histogram.component';  // 导入 HistogramComponent
import { SharedStateService } from '../shared-state.service';
@NgModule({
  declarations: [HistogramComponent],  // 声明组件
  imports: [CommonModule],  // 导入 Angular 的 CommonModule
  exports: [HistogramComponent],  // 导出组件，以便其他模块使用
  providers: [SharedStateService]  
})
export class HistogramModule {}
