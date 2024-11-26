import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { DimensionalFossilViewerModule, mainViewReducer} from 'dimensional-fossil-viewer'; 
import { StoreModule } from '@ngrx/store';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule,
    DimensionalFossilViewerModule,
    StoreModule.forRoot({ mainView: mainViewReducer }),
    FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
