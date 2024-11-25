import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { RouterModule } from '@angular/router'; 
import { DimensionalFossilViewerModule, mainViewReducer, IMainViewState, ControlsModule, HelpersModule, InteractionsModule, HistogramModule, ModelLoaderModule} from 'dimensional-fossil-viewer'; 
import { StoreModule } from '@ngrx/store';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule,
    DimensionalFossilViewerModule,
    ControlsModule,
    HelpersModule,
    InteractionsModule,
    HistogramModule,
    ModelLoaderModule,
    RouterModule.forRoot([]), 
    StoreModule.forRoot({ mainView: mainViewReducer }),
    FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
