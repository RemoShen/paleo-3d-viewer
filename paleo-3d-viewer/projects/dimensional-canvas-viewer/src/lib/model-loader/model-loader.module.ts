import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModelLoaderComponent } from './model-loader.component';
import { SharedStateService } from '../shared-state.service';

@NgModule({
  declarations: [ModelLoaderComponent],
  imports: [CommonModule],
  exports: [ModelLoaderComponent], // 导出组件以供其他项目使用
  providers: [SharedStateService], // 为组件提供服务
})
export class ModelLoaderModule {}
