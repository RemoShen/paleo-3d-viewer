import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HelpersComponent } from './helpers.component';
import { SharedStateService } from '../shared-state.service';

@NgModule({
  declarations: [HelpersComponent],
  imports: [CommonModule],
  exports: [HelpersComponent],
  providers: [SharedStateService], // 提供服务
})
export class HelpersModule {}
