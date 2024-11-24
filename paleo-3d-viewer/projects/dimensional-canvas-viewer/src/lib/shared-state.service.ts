import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SharedStateService {
  private isLengthActiveSubject = new BehaviorSubject<boolean>(false);
  private isAreaActiveSubject = new BehaviorSubject<boolean>(false);
  private lengthValueSubject = new BehaviorSubject<number>(0);
  private areaValueSubject = new BehaviorSubject<number>(0);
  private depthValueSubject = new BehaviorSubject<number>(0);
  private colorScaleSubject = new BehaviorSubject<string>("linearScale");
  private isDepthAnalyzerActiveSubject = new BehaviorSubject<boolean>(false);
  private histogramValueSubject = new BehaviorSubject<any[]>([]);

  isLengthActive$ = this.isLengthActiveSubject.asObservable();
  isAreaActive$ = this.isAreaActiveSubject.asObservable();
  lengthValue$ = this.lengthValueSubject.asObservable();
  areaValue$ = this.areaValueSubject.asObservable();
  isDepthActive$ = this.isDepthAnalyzerActiveSubject.asObservable();
  depthValue$ = this.depthValueSubject.asObservable();
  colorScaleValue$ = this.colorScaleSubject.asObservable();
  histogramValue$ = this.histogramValueSubject.asObservable();

  setLengthState(value: boolean) {
    this.isLengthActiveSubject.next(value);
  }

  setAreaState(value: boolean) {
    this.isAreaActiveSubject.next(value);
  }

  setLengthValue(value: number) {
    this.lengthValueSubject.next(value);
  }

  setAreaValue(value: number) {
    this.areaValueSubject.next(value);
  }

  setDepthState(value: boolean) {
    this.isDepthAnalyzerActiveSubject.next(value);
  }

  setDepthValue(value: number) {
    this.depthValueSubject.next(value);
  }

  setColorScale(value: string) {
    this.colorScaleSubject.next(value);
  }

  setHistogramValue(value: any[]) {
    this.histogramValueSubject.next(value);
  }
}
