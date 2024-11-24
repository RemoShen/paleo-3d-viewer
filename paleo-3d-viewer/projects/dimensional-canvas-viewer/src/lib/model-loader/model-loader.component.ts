import { Component, EventEmitter, Input, Output } from '@angular/core';
import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { TextureLoader } from 'three';
import { Fossil } from '../models/fossil.model';

@Component({
  selector: 'app-model-loader',
  templateUrl: './model-loader.component.html',
  styleUrls: ['./model-loader.component.scss']
})
export class ModelLoaderComponent {
  @Input() scene!: THREE.Scene;
  @Input() modelPath!: string;
  @Input() texturePath!: string;
  @Input() showBoundingBoxes: boolean = false;
  @Output() modelLoaded: EventEmitter<THREE.Object3D> = new EventEmitter<THREE.Object3D>();
  @Output() fossilSelected: EventEmitter<{ fossil: Fossil | null }> = new EventEmitter<{ fossil: Fossil | null }>();

  loadModel(fossil: Fossil) {
    const objLoader = new OBJLoader();
    const textureLoader = new TextureLoader();
    const texture = textureLoader.load(this.texturePath);

    objLoader.load(
      this.modelPath,
      (object) => {
        object.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            const geometry = child.geometry;

            const material = new THREE.MeshStandardMaterial({
              map: texture,
            });
            child.material = material;

            if (!geometry.index) {
              const positionAttribute = geometry.attributes['position'];
              const indices = [];

              for (let i = 0; i < positionAttribute.count; i += 3) {
                indices.push(i, i + 1, i + 2);
              }

              geometry.setIndex(indices);
            }

            if (!geometry.attributes['normal']) {
              geometry.computeVertexNormals();
            }
          }
        });
        this.modelLoaded.emit(object);
      },
      (xhr) => {
        console.log((xhr.loaded / xhr.total) * 100 + '% loaded');
      }
    );
  }
}