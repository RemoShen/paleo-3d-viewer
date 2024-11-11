import { Component, Input, AfterViewInit } from '@angular/core';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { SharedStateService } from '../shared-state.service';

@Component({
  selector: 'app-controls',
  template: '',
})
export class ControlsComponent implements AfterViewInit {
  @Input() camera!: THREE.PerspectiveCamera;
  @Input() renderer!: THREE.WebGLRenderer;
  @Input() scene!: THREE.Scene;

  constructor(private sharedStateService: SharedStateService) {}
  orbitControls!: OrbitControls;

  ngOnInit(){
    this.sharedStateService.isLengthActive$.subscribe((isActive: any) => {
      if (this.orbitControls) {
        if (isActive) {
          this.orbitControls.enabled = false;
        } else {
          this.orbitControls.enabled = true;
        }
      }
    });
    this.sharedStateService.isAreaActive$.subscribe((isActive: any) => {
      if (this.orbitControls) {
        if (isActive) {
          this.orbitControls.enabled = false;
        } else {
          this.orbitControls.enabled = true;
        }
      }
    });
  }
  ngAfterViewInit(): void {
    
  }

  initControls() {
    this.orbitControls = new OrbitControls(this.camera, this.renderer.domElement);
    this.orbitControls.enableDamping = false;
    this.orbitControls.enableZoom = true;
    this.orbitControls.maxPolarAngle = Math.PI;
    this.orbitControls.minPolarAngle = 0;
    this.orbitControls.panSpeed = 0;
		this.orbitControls.zoomSpeed = 2.5;
		this.orbitControls.rotateSpeed = 1.5;

    this.orbitControls.minDistance = 0.001;
    this.orbitControls.maxDistance = 1000;

    this.orbitControls.keyPanSpeed = 0;
  }

  renderScene() {
    this.renderer.render(this.scene, this.camera);
  }

  updateControls() {
    if (this.orbitControls) {
      this.orbitControls.update();
    }
  }

  dispose(){
    if(this.orbitControls){
      this.orbitControls.dispose();
    }
  }

  setTarget(point: THREE.Vector3){
    if(this.orbitControls){
      this.orbitControls.target.copy(point);
    }
  }
}
