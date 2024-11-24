import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  AfterViewInit,
  OnDestroy,
  ViewChild,
  Output,
  EventEmitter,
} from '@angular/core';
import { Fossil } from './models/fossil.model';
import * as THREE from 'three';
import { Store } from '@ngrx/store';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { VertexNormalsHelper } from 'three/examples/jsm/helpers/VertexNormalsHelper.js';
import { ControlsComponent } from './controls/controls.component';
import { InteractionsComponent } from './interactions/interactions.component';
import { ModelLoaderComponent } from './model-loader/model-loader.component';
import { HelpersComponent } from './helpers/helpers.component';
import { HistogramComponent } from './histogram/histogram.component';
import { IMainViewState } from './store/main-view.reducer';
import { SharedStateService } from './shared-state.service';
import { toggle3D } from './actions/image-canvas.actions';
import { openProjectPicker } from './actions/toolbar.actions';
import { fossilSelected } from './actions/dimensional-canvas.actions';
@Component({
  selector: 'lib-dimensional-canvas-viewer',
  template:'',
})
export class DimensionalCanvasViewerComponent
  implements AfterViewInit, OnDestroy
{
  @Output('fossilselected') fossilSelected: EventEmitter<{
    fossil: Fossil | null;
  }> = new EventEmitter<{ fossil: Fossil | null }>();
  @ViewChild('canvasContainer', { static: true }) canvasContainer!: ElementRef;
  @ViewChild(ControlsComponent) controlsComponent!: ControlsComponent;
  @ViewChild(InteractionsComponent)
  interactionsComponent!: InteractionsComponent;
  @ViewChild(ModelLoaderComponent) modelLoaderComponent!: ModelLoaderComponent;
  @ViewChild(HelpersComponent) helpersComponent!: HelpersComponent;
  @ViewChild(HistogramComponent) histogramComponent!: HistogramComponent;

  scene!: THREE.Scene;
  camera!: THREE.PerspectiveCamera;
  renderer!: THREE.WebGLRenderer;
  controls!: OrbitControls;
  animationId!: number;

  showGrid: boolean = false;
  showAxes: boolean = false;
  isLengthActive: boolean = false;
  showNormals: boolean = false;
  isAreaActive: boolean = false;

  selectedBackground: string = 'white';
  backgroundOptions: { value: string; viewValue: string }[] = [
    { value: 'white', viewValue: 'White' },
    { value: 'lightblue', viewValue: 'Light Blue' },
    { value: 'lightgray', viewValue: 'Light Gray' },
    { value: 'black', viewValue: 'Black' },
  ];
  colorScaleOptions: { value: string; viewValue: string }[] = [
    { value: 'linearScale', viewValue: 'Linear Scale' },
    { value: 'interpolateViridis', viewValue: 'Viridis Interpolation' },
  ];
  objects: THREE.Object3D[] = [];
  clickableGroup = new THREE.Group();
  selectedObject: THREE.Object3D | null = null;
  model_path = '../../../../assets/models/scan7_small.obj';
  texture_path: string = '../../../../assets/models/scan7_small.jpg';
  normalsHelpers: any[] = [];
  fossilLoaded!: Fossil;
  total_length: string = '0.00';
  total_area: string = '0.00';
  depth: string = '0.00';
  isDepthAnalyzerActive: boolean = false;
  histogram_value: any[] = [];

  constructor(
    public store: Store<{ mainViewState: IMainViewState }>,
    private cdr: ChangeDetectorRef,
    private sharedStateService: SharedStateService
  ) {}

  ngAfterViewInit() {
    this.initThreeJS();
    this.initCamera();
    this.initLights();
    this.setupControls();
    this.setupInteractions();
    this.initHelpers();
    this.cdr.detectChanges();
    this.animate();

    this.modelLoaderComponent.modelPath = this.model_path;
    this.modelLoaderComponent.texturePath = this.texture_path;
    this.modelLoaderComponent.scene = this.scene;

    this.modelLoaderComponent.modelLoaded.subscribe(
      (object: THREE.Object3D) => {
        this.onModelLoaded(object);
      }
    );

    this.modelLoaderComponent.loadModel({} as Fossil);
    this.fossilLoaded = {} as Fossil;

    window.addEventListener('resize', this.onWindowResize, false);
  }

  ngOnDestroy() {
    cancelAnimationFrame(this.animationId);
    this.controlsComponent.dispose();
    this.renderer.dispose();
  }
  initCamera() {
    this.camera = new THREE.PerspectiveCamera(
      10,
      window.innerWidth / window.innerHeight,
      0.001,
      1000
    );
    this.camera.position.set(5, 5, 5);
    this.camera.lookAt(new THREE.Vector3(0, 0, 0));
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
  }

  initLights() {
    const ambientLight = new THREE.AmbientLight(0x404040, 2);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(1, 1, 1).normalize();
    this.scene.add(directionalLight);
  }

  initHelpers() {
    if (this.helpersComponent) {
      this.helpersComponent.scene = this.scene;
      this.helpersComponent.renderer = this.renderer;
      this.helpersComponent.initHelpers();
      this.helpersComponent.toggleAxisHelper(this.showAxes);
      this.helpersComponent.toggleGridHelper(this.showGrid);
    }
  }

  setupInteractions() {
    if (this.interactionsComponent) {
      this.interactionsComponent.camera = this.camera;
      this.interactionsComponent.scene = this.scene;
      this.interactionsComponent.renderer = this.renderer;
      this.interactionsComponent.clickableGroup = this.clickableGroup;
      this.interactionsComponent.setupEventListeners();
      this.interactionsComponent.restartInteractions();
    }
  }

  setupControls() {
    if (this.controlsComponent) {
      this.controlsComponent.camera = this.camera;
      this.controlsComponent.scene = this.scene;
      this.controlsComponent.renderer = this.renderer;
      this.controlsComponent.initControls();
    }
  }

  initThreeJS() {
    this.scene = new THREE.Scene();
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setClearColor(0xffffff);
    this.canvasContainer.nativeElement.appendChild(this.renderer.domElement);
  }

  open_project_dialog(): void {
    this.store.dispatch(openProjectPicker());
  }

  toggleGrid() {
    this.showGrid = !this.showGrid;
    this.helpersComponent.toggleGridHelper(this.showGrid);
  }

  toggleAxes() {
    this.showAxes = !this.showAxes;
    this.helpersComponent.toggleAxisHelper(this.showAxes);
  }

  goBackTo2D() {
    this.store.dispatch(toggle3D({ mode: '2d' }));
  }

  changeBackground(option: any) {
    this.renderer.setClearColor(option.value);
    this.renderer.render(this.scene, this.camera);
  }

  changeColorScale(option: any) {
    this.sharedStateService.setColorScale(option.value);
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }

  animate() {
    this.animationId = requestAnimationFrame(() => this.animate());
    if (this.controlsComponent) {
      this.controlsComponent.updateControls();
    }
    this.renderer.render(this.scene, this.camera);
  }

  onWindowResize() {
    const containerWidth = window.innerWidth;
    const containerHeight = window.innerHeight;
    this.camera.aspect = containerWidth / containerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(containerWidth, containerHeight);

    this.render();
  }

  public drop_image(fossil: Fossil, position: [number, number]): void {
    if (this.objects.length > 0) {
      this.scene.remove(this.objects[0]);
      this.objects = [];
    }

    this.modelLoaderComponent.modelPath = this.model_path;
    this.modelLoaderComponent.texturePath = this.texture_path;
    this.modelLoaderComponent.scene = this.scene;

    this.modelLoaderComponent.modelLoaded.subscribe(
      (object: THREE.Object3D) => {
        this.onModelLoaded(object);
      }
    );

    this.modelLoaderComponent.loadModel(fossil);
    this.fossilLoaded = fossil;
  }

  toggleDepthAnalyzer() {
    this.isDepthAnalyzerActive = !this.isDepthAnalyzerActive;
    if (this.isDepthAnalyzerActive) {
      this.isAreaActive = false;
      this.isLengthActive = false;
      this.total_area = '0.00';
      this.total_length = '0.00';
    }
    this.sharedStateService.setDepthState(this.isDepthAnalyzerActive);
    this.sharedStateService.setAreaState(this.isAreaActive);
    this.sharedStateService.setLengthState(this.isLengthActive);
  }

  toggleLengthTool() {
    this.isLengthActive = !this.isLengthActive;
    if (this.isLengthActive) {
      this.isAreaActive = false;
      this.isDepthAnalyzerActive = false;
      this.total_area = '0.00';
      this.depth = '0.00';
    }
    this.sharedStateService.setAreaState(this.isAreaActive);
    this.sharedStateService.setLengthState(this.isLengthActive);
    this.sharedStateService.setDepthState(this.isDepthAnalyzerActive);
  }

  toggleAreaTool() {
    this.isAreaActive = !this.isAreaActive;
    if (this.isAreaActive) {
      this.isLengthActive = false;
      this.isDepthAnalyzerActive = false;
      this.total_length = '0.00';
      this.depth = '0.00';
    }
    this.sharedStateService.setAreaState(this.isAreaActive);
    this.sharedStateService.setLengthState(this.isLengthActive);
    this.sharedStateService.setDepthState(this.isDepthAnalyzerActive);
  }

  toggleShowNormals() {
    this.showNormals = !this.showNormals;
    if (this.showNormals) {
      this.objects.forEach((object) => {
        object.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            const normalsHelper = new VertexNormalsHelper(child, 0.1, 0x00ff00);
            this.scene.add(normalsHelper);
            this.normalsHelpers.push(normalsHelper);
          }
        });
      });
    } else {
      this.normalsHelpers.forEach((helper) => {
        this.scene.remove(helper);
      });
      this.normalsHelpers = [];
    }
    this.render();
  }

  onModelLoaded(object: THREE.Object3D) {
    this.scene.remove(this.clickableGroup);
    this.clickableGroup = new THREE.Group();
    this.clickableGroup.add(object);
    this.scene.add(this.clickableGroup);
    this.objects.push(object);
    this.setupInteractions();

    this.fossilSelected.emit({ fossil: this.fossilLoaded });
    this.store.dispatch(fossilSelected({ fossil: this.fossilLoaded }));
    const boundingBox = new THREE.Box3().setFromObject(object);
    const size = boundingBox.getSize(new THREE.Vector3()).length();
    const center = boundingBox.getCenter(new THREE.Vector3());

    const distance = size * 3;
    this.camera.position.set(
      center.x + distance,
      center.y + distance,
      center.z + distance
    );
    this.camera.lookAt(center);

    this.controlsComponent.setTarget(center);
    this.controlsComponent?.updateControls();
    this.render();
  }

  updateHistogram() {
    if (this.histogramComponent) {
      this.histogramComponent.data = this.histogram_value;
      this.histogramComponent.updateHistogram();
    }
  }
}

