import { Component, ViewChild, AfterViewInit } from '@angular/core';
import { DimensionalCanvasViewerComponent } from 'dimensional-canvas-viewer';
import { Fossil } from './models/fossil.model'; 


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements AfterViewInit {
  @ViewChild(DimensionalCanvasViewerComponent) canvasViewer!: DimensionalCanvasViewerComponent;
  modelPath: string = 'assets/models/scan7_small.obj'; 
  texturePath: string = 'assets/models/scan7_small.jpg'; 
  ngAfterViewInit() {
  }
  onFossilSelected(event: { fossil: Fossil | null }) {
    console.log('Selected Fossil:', event.fossil);
  }
  toggleGrid() {
    this.canvasViewer.toggleGrid();
  }
  toggleAxes() {
    this.canvasViewer.toggleAxes();
  }
  toggleDepthAnalyzer() {
    this.canvasViewer.toggleDepthAnalyzer();
  }
  getLength() {
    this.canvasViewer.toggleLengthTool();
  }
  getArea() {
    this.canvasViewer.toggleAreaTool();
  }
  toggleHistogram() {
    this.canvasViewer.updateHistogram();
  }


  selectedBackground: string = 'white';
  backgroundOptions = [
    { value: 'white', viewValue: 'White' },
    { value: 'lightblue', viewValue: 'Light Blue' },
    { value: 'lightgray', viewValue: 'Light Gray' },
    { value: 'black', viewValue: 'Black' },
    { value: 'darkgray', viewValue: 'Dark Gray' },
    { value: 'darkblue', viewValue: 'Dark Blue' },
    { value: 'darkred', viewValue: 'Dark Red' },
  ];
  onBackgroundChange() {
    const selectedOption = this.backgroundOptions.find(option => option.value === this.selectedBackground);
    if (selectedOption) {
      this.canvasViewer.changeBackground(selectedOption);
    }
  } 
  
}
