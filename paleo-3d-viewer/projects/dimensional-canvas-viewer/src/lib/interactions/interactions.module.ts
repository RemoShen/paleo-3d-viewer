// src/lib/interactions.module.ts
import { NgModule } from '@angular/core';
import { InteractionsComponent } from './interactions.component';
import { SharedStateService } from '../shared-state.service';

@NgModule({
  declarations: [InteractionsComponent],
  exports: [InteractionsComponent],
  providers: [SharedStateService],
})
export class InteractionsModule {}
