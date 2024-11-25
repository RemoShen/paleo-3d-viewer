import { Component, Input, OnInit } from '@angular/core';
import * as THREE from 'three';

@Component({
  selector: 'app-helpers',
  template: '',
})
export class HelpersComponent implements OnInit {
  @Input() scene!: THREE.Scene;
  @Input() renderer!: THREE.WebGLRenderer;

  gridHelper!: THREE.GridHelper;
  axisHelper!: THREE.AxesHelper;

  ngOnInit() {

  }

  initHelpers() {
    if (this.scene) {
      this.gridHelper = new THREE.GridHelper(100, 100);
      this.scene.add(this.gridHelper);

      this.axisHelper = new THREE.AxesHelper(50);
      this.scene.add(this.axisHelper);
    }
  }

  toggleGridHelper(visible: boolean) {
    if(this.gridHelper){
      this.gridHelper.visible = visible;
    }
  }

  toggleAxisHelper(visible: boolean) {
    if(this.axisHelper){
      this.axisHelper.visible = visible;
    }
  }
}