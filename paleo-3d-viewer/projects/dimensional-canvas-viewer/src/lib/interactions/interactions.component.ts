import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import * as THREE from 'three';
import { SharedStateService } from '../shared-state.service';
import * as d3 from 'd3';
import { scaleLinear } from 'd3-scale';
import { axisBottom } from 'd3-axis';
import { interpolateViridis } from 'd3-scale-chromatic';

@Component({
  selector: 'app-interactions',
  template: '',
})
export class InteractionsComponent implements OnInit {
  @Input() camera!: THREE.Camera;
  @Input() scene!: THREE.Scene;
  @Input() renderer!: THREE.WebGLRenderer;
  @Input() clickableGroup!: THREE.Group;
  originalColors!: Float32Array;
  heightmapColors: Float32Array | null = null;
  minZ: number = 0;
  maxZ: number = 0;
  depth: number = 0;
  cube_width = 0.2;
  cube_height = 0.2;
  cube_depth = 0.02;
  points: THREE.Vector3[] | null = null;

  constructor(private sharedStateService: SharedStateService) {}
  @ViewChild('legendContainer', { static: false }) legendContainer!: ElementRef;
  raycaster = new THREE.Raycaster();
  mouse = new THREE.Vector2();
  markers: any[] = [];
  tempMarker: any = null;
  isLengthActive: boolean = false;
  isAreaActive: boolean = false;
  isDepthAnalyzerActive: boolean = false;
  distanceLines: THREE.Object3D[] = [];
  total_length: number = 0;
  total_area: number = 0;
  areaLine: any = null;
  colorScaleValue: string = "linearScale";
  cube: THREE.Mesh | null = null;

  ngOnInit() {
    this.sharedStateService.isLengthActive$.subscribe(value => {
      this.isLengthActive = value;
    });
    this.sharedStateService.isAreaActive$.subscribe(value => {
      this.isAreaActive = value;
    });
    this.sharedStateService.isDepthActive$.subscribe(value => {
      this.isDepthAnalyzerActive = value;
      if(this.isDepthAnalyzerActive){
        this.applyColorScaleToOriginalPoints();
      }else{
        this.changeColors('original');
      }
    });
    this.sharedStateService.colorScaleValue$.subscribe(value => {
      this.colorScaleValue = value;
      this.heightmapColors = null;
      this.points = null;
      if(this.isDepthAnalyzerActive){
        this.applyColorScaleToOriginalPoints();
      }else{
        this.changeColors('original');
      }
    });
  }

  ngAfterViewInit(){
    
  }

  setupEventListeners() {
    this.renderer.domElement.addEventListener('click', (event) => this.onMouseClick(event), false);
    this.renderer.domElement.addEventListener('mousemove', (event) => this.onMouseMove(event), false);
    this.renderer.domElement.addEventListener('dblclick', (event) => this.onDoubleClick(event), false);
  }

  restartInteractions(){
    this.scene.remove(this.tempMarker);
    this.scene.remove(this.cube!);
    this.markers.forEach(m=>{
      this.scene.remove(m);
    })
    this.tempMarker = null;
    this.points = null;
    this.minZ = 0;
    this.maxZ = 0;
    this.cube_width = 0.2;
    this.cube_height = 0.2;
    this.cube_depth = 0.02;
    this.markers = [];
    this.cube = null;
    this.originalColors = new Float32Array();
    this.heightmapColors = null;
  }

  getIntersection(x: number, y: number){
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.mouse.x = ((x - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((y - rect.top) / rect.height) * 2 + 1;
    this.raycaster.setFromCamera(this.mouse, this.camera);
    this.raycaster!.params!.Line!.threshold = 10.0;
    const intersects = this.raycaster.intersectObjects(this.clickableGroup.children, true);
    return intersects;
  }

  generateCube(intersection: THREE.Intersection){    
    this.clickableGroup.children.forEach((child: THREE.Object3D) => {
      if (child.children[0] instanceof THREE.Mesh) {
        let {minX, maxX, minY, maxY, minZ, maxZ} = this.getTopCornersExtremes(child.children[0]);
        this.cube_width = (maxX - minX)*0.25;
        this.cube_height = this.cube_width;
        this.cube_depth = (maxZ - minZ)*0.05;
      }
    })
    const geometry = new THREE.BoxGeometry(this.cube_width, this.cube_height, this.cube_depth);

    const material = new THREE.MeshPhongMaterial({
        color: 0xff0000,
        shininess: 100,
        specular: 0x555555,
        transparent: true,
        opacity: 0.5,
    });
    let parallelepiped = new THREE.Mesh(geometry, material);
    parallelepiped.castShadow = true;
    parallelepiped.position.set(intersection.point.x, intersection.point.y, intersection.point.z);

    return parallelepiped;
}

  clearMarkers(){
    this.markers.forEach(marker=>{
      this.scene.remove(marker);
      marker.children.forEach((child: any) => {
        this.scene.remove(child);
    });
    })
    this.distanceLines.forEach(line=>{
      this.scene.remove(line);
      line.children.forEach(child => {
        this.scene.remove(child);
    });
    })
    this.scene.remove(this.areaLine);
  
    this.distanceLines = [];
    this.markers = [];
    this.total_length = 0;
    this.sharedStateService.setLengthValue(0);
    this.render();
  }

  updateLength(){
    this.total_length = 0;
    for(let i = 0; i < this.markers.length - 1; i++){
      let d = this.markers[i].position.distanceTo(this.markers[i+1].position);
      this.total_length += d*10;
    }
    this.sharedStateService.setLengthValue(this.total_length);
  }

  updateArea() {
    if (this.markers.length < 3) {
      this.total_area = 0;
      return;
    }

    let x: number[] = [];
    let y: number[] = [];
  
    this.markers.forEach(marker => {
      const position = marker.position;
      x.push(position.x);
      y.push(position.y);
    });
  
    x.push(x[0]);
    y.push(y[0]);
  
    let area = 0;
    for (let i = 0; i < x.length - 1; i++) {
      area += x[i] * y[i + 1] - y[i] * x[i + 1];
    }
    area = Math.abs(area*100) / 2;
  
    this.sharedStateService.setAreaValue(area);
    this.total_area = area;
  }

  updateDepth(){
    this.depth = 0;
    let p1 = this.tempMarker.position;
    this.depth = p1.distanceTo(new THREE.Vector3(p1.x, p1.y, this.maxZ))*10;
    this.sharedStateService.setDepthValue(this.depth);
  }


  getMinMaxZ(minX: number, maxX: number, minY: number, maxY: number) {
    let minZ = Infinity;
    let maxZ = -Infinity;
    this.points?.forEach(point => {
      if(this.isPointInsideHeightMapArea(point, minX, minY, maxX, maxY)){ 
        if (point.z < minZ) minZ = point.z;
        if (point.z > maxZ) maxZ = point.z;
      }
    });
  
    return { minZ, maxZ };
  }

  createColorLegend(): HTMLElement {
    const width = 300;
    const height = 50;
    const svg = d3.create('svg')
                  .attr('width', width)
                  .attr('height', height);
  
    const gradient = svg.append('defs')
                        .append('linearGradient')
                        .attr('id', 'legend-gradient');
  
    gradient.selectAll('stop')
            .data(d3.range(0, 1.05, 0.05))
            .enter().append('stop')
            .attr('offset', d => `${d * 100}%`)
            .attr('stop-color', d => interpolateViridis(d));
  
    svg.append('rect')
       .attr('x', 0)
       .attr('y', 0)
       .attr('width', width)
       .attr('height', height)
       .style('fill', 'url(#legend-gradient)');
  
    const scale = scaleLinear()
                    .domain([this.minZ, this.maxZ])
                    .range([0, width]);
  
    const axis = axisBottom(scale).ticks(5);
  
    svg.append('g')
       .attr('transform', `translate(0, ${height - 10})`)
       .call(axis);
  
    return svg.node() as unknown as HTMLElement;
  }
  
  colorScale(){
    let colorScale = null;
    if(this.colorScaleValue === "linearScale"){
      colorScale = d3.scaleLinear<string>()
                    .domain([this.minZ, (this.minZ + this.maxZ)/2, this.maxZ])
                    .range(["blue", "yellow", "red"]);
    }
    else if(this.colorScaleValue === "interpolateViridis"){
      colorScale = d3.scaleSequential(interpolateViridis)
                    .domain([this.minZ, this.maxZ]);
    }else{
      colorScale = d3.scalePow<string>()
                    .exponent(2)
                    .domain([this.minZ, (this.minZ + this.maxZ)/2, this.maxZ])
                    .range(["blue", "yellow", "red"]);
    }
    return colorScale
  }

  interpolateColor(z: number, minZ: number, maxZ: number) {
    const t = (z - minZ) / (maxZ - minZ);
    const colorScale = this.colorScale();
    const colorHex = colorScale(z);
    const color = new THREE.Color(colorHex);
    return color;
  }

  getTopCornersExtremes(mesh: THREE.Mesh) {
    const geometry = mesh.geometry;
    geometry.computeBoundingBox();
  
    const boundingBox = geometry.boundingBox!;
    const maxZ = boundingBox.max.z;
    const minZ = boundingBox.min.z;

    const mid = (minZ + maxZ)/2;
  
    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;
  
    const position = geometry.attributes['position'];
    const vertices = position.array;
  
    for (let i = 0; i < vertices.length; i += 3) {
      const x = vertices[i];
      const y = vertices[i + 1];
      const z = vertices[i + 2];
  
      if (z > mid) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  
    let minX_tmp = minX + (maxX - minX)*0.1;
    let maxX_tmp = minX + (maxX - minX)*0.9;
    let minY_tmp = minY + (maxY - minY)*0.1;
    let maxY_tmp = minY + (maxY - minY)*0.9;

    minX = minX_tmp;
    minY = minY_tmp;
    maxX = maxX_tmp;
    maxY = maxY_tmp;

    return {
      minX, maxX, minY, maxY, minZ, maxZ, 
    };
  }

  isPointInsideHeightMapArea(vertex: THREE.Vector3, minX: number, minY: number, maxX: number, maxY: number){
    return (vertex.x >= minX && vertex.x <= maxX) && (vertex.y >= minY && vertex.y <= maxY)
  }
  
  changeColors(mode: string) {
    let colors: Float32Array | null;
    if(mode === 'original'){
      colors = this.originalColors;
    }else if(mode === 'heightmap'){
      colors = this.heightmapColors;
    }
    this.clickableGroup.children.forEach((child: THREE.Object3D) => {
      if (child.children[0] instanceof THREE.Mesh) {
        const mesh = child.children[0] as THREE.Mesh;
        const geometry = mesh.geometry as THREE.BufferGeometry;
        const colorAttribute = geometry.getAttribute('color') as THREE.BufferAttribute;
        
        if (colors) {
          const colorArray = colorAttribute.array as Float32Array;
          for (let i = 0; i < colors.length; i++) {
            colorArray[i] = colors[i];
          }
          colorAttribute.needsUpdate = true;
        }
      }
    });
    this.render();
  }

  getHistogramPoints(){
    let minX = this.cube!.position.x - this.cube_width/2;
    let maxX = this.cube!.position.x + this.cube_width/2;
    let minY = this.cube!.position.y - this.cube_height/2;
    let maxY = this.cube!.position.y + this.cube_height/2;
    let filtered_points = d3.filter(this.points!, d=>(d.x >= minX && d.x <= maxX && d.y >= minY && d.y <= maxY));
    
    let bin = d3.bin<any, number>()
    .value(d => d.z) 
    .thresholds(10);
    let histogram_bins = bin(filtered_points);
    let histogram_points = histogram_bins.map(bin => ({ z: bin[0].distanceTo(new THREE.Vector3(bin[0].x, bin[0].y, this.maxZ))*10, value: bin.length}));
    return histogram_points;
  }

  applyColorScaleToOriginalPoints() {
    if(this.heightmapColors){
      this.changeColors('heightmap');
      return;
    }
    this.clickableGroup.children.forEach((child: THREE.Object3D) => {
      if (child.children[0] instanceof THREE.Mesh) {
        const mesh = child.children[0] as THREE.Mesh;
        const geometry = child.children[0].geometry as THREE.BufferGeometry;
        const positionAttribute = geometry.getAttribute('position');

        let colorAttribute = geometry.getAttribute('color') as THREE.BufferAttribute;
        if (!colorAttribute) {
            colorAttribute = new THREE.BufferAttribute(new Float32Array(positionAttribute.count * 3), 3);
        }

        const colors = colorAttribute.array as Float32Array;

        if(!this.points){
          this.originalColors = new Float32Array(colors.length);
          this.originalColors.set(colors);
          this.points = [] as THREE.Vector3[];
          for (let i = 0; i < positionAttribute.count; i++) {
            const vertex = new THREE.Vector3().fromBufferAttribute(positionAttribute, i);
            vertex.applyMatrix4(child.children[0].matrixWorld);
            this.points.push(vertex);
          }
        }

        let { minX, maxX, minY, maxY} = this.getTopCornersExtremes(child.children[0]);

        const { minZ, maxZ } = this.getMinMaxZ(minX, maxX, minY, maxY);
        this.minZ = minZ;
        this.maxZ = maxZ;
        
        for (let i = 0; i < this.points.length; i++) {
          if (this.isPointInsideHeightMapArea(this.points[i], minX, minY, maxX, maxY)) {
            const color = this.interpolateColor(this.points[i].z, minZ, maxZ);
            colors[i * 3] = color.r;
            colors[i * 3 + 1] = color.g;
            colors[i * 3 + 2] = color.b;
          }
        }
        this.heightmapColors = new Float32Array(colors.length);
        this.heightmapColors.set(colors);
        colorAttribute.needsUpdate = true;
        if (!(mesh.material instanceof THREE.MeshBasicMaterial) || !mesh.material.vertexColors) {
          mesh.material = new THREE.MeshBasicMaterial({ vertexColors: true });
        }
        mesh.renderOrder = -1;
      }
    });
  
    this.render();
  }

  
  onDoubleClick(event: MouseEvent){
    if(this.isLengthActive){
      this.isLengthActive = !this.isLengthActive;
      this.sharedStateService.setLengthState(this.isLengthActive);
      this.updateLength();
    }
    if(this.isAreaActive){
      this.isAreaActive = !this.isAreaActive;
      this.sharedStateService.setAreaState(this.isAreaActive);
      this.updateArea();
    }
  }

  onMouseClick(event: MouseEvent) {
    let intersects = this.getIntersection(event.clientX, event.clientY);    
    if (intersects === null || intersects.length === 0) {
      this.clearMarkers();
      this.updateLength();
      this.updateArea();
      return;
    }

    if (intersects.length > 0) {
      let x = this.getFaceNormalManual(intersects[0]);
      if(this.isLengthActive){
        this.addMarker(intersects[0]);
        this.updateLength();
      }else if(this.isAreaActive){
        this.addMarker(intersects[0]);
        this.updateArea();
      }
    }    
  }

  render() {
    if(this.renderer && this.scene && this.camera){
      this.renderer.render(this.scene, this.camera);
    }
  }

  createPolygonMesh(points: THREE.Vector3[]): THREE.Mesh {
    const shape = new THREE.Shape();
    shape.moveTo(points[0].x, points[0].y);
  
    for (let i = 1; i < points.length; i++) {
      shape.lineTo(points[i].x, points[i].y);
    }
  
    shape.lineTo(points[0].x, points[0].y);
  
    const geometry = new THREE.ShapeGeometry(shape);
    const material = new THREE.MeshBasicMaterial({
      color: 0x00ff00,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.5,
    });
  
    return new THREE.Mesh(geometry, material);
  }

  addMarker(intersection: THREE.Intersection){
    let marker = this.generateMarker(intersection);
    this.scene.add(marker);
    this.markers.push(marker);
    if (this.markers.length >= 2 && (this.isAreaActive || this.isLengthActive)) {
      let material = new THREE.LineBasicMaterial({ color: 0x263238, depthTest: false });
      let secondLastPoint = this.markers[this.markers.length - 2].position;
      let lastPoint = this.markers[this.markers.length - 1].position;
      let line = this.createLineFromPoints([secondLastPoint, lastPoint], material);
      this.scene.add(line);
      this.distanceLines.push(line);
      
      if(this.isAreaActive){
        let firstPoint = this.markers[0].position;
        let lastPoint = this.markers[this.markers.length - 1].position;
        let line = this.createLineFromPoints([firstPoint, lastPoint], material);
        this.scene.remove(this.areaLine);
        this.areaLine = line;
        this.scene.add(line);
      }
    }
    
    this.render();
  }

  createLineFromPoints(points: THREE.Vector3[] | THREE.Vector2[], material: THREE.Material){
    let geometry = new THREE.BufferGeometry ().setFromPoints(points);
    return new THREE.Line (geometry, material);
  }

  updatePosition(intersection: THREE.Intersection, marker: THREE.Object3D){
    let faceNormal = this.getFaceNormalManual(intersection);
    if(faceNormal === null) return;
    marker.updateMatrixWorld(true);
    marker.position.set(0.0, 0.0, 0.0);
    marker.lookAt(faceNormal);
    marker.position.set(intersection.point.x, intersection.point.y, intersection.point.z);
  }

  updateCubePosition(intersection: THREE.Intersection){
    if(!this.cube) return;
    let faceNormal = this.getFaceNormalManual(intersection);
    if(faceNormal === null) return;
    this.cube.updateMatrixWorld(true);
    this.cube.position.set(0.0, 0.0, 0.0);
    this.cube.lookAt(faceNormal);
    this.cube.position.set(intersection.point.x, intersection.point.y, intersection.point.z);
  }

  generateMarker(intersection: THREE.Intersection) : THREE.Object3D{
    let radius = 0.03; 
    this.clickableGroup.children.forEach((child: THREE.Object3D) => {
      if (child.children[0] instanceof THREE.Mesh) {
        let {minX, maxX, minY, maxY, minZ, maxZ} = this.getTopCornersExtremes(child.children[0]);
        radius = (maxX - minX)*0.05;
      }
    })
    
    let marker = new THREE.Object3D ();
    let material = new THREE.LineBasicMaterial ({ color : 0x263238, depthTest : false });
    let circleCurve = new THREE.EllipseCurve (0.0, 0.0, radius, radius, 0.0, 2.0 * Math.PI, false, 0.0);
    marker.add(this.createLineFromPoints(circleCurve.getPoints (50), material));
    marker.add(this.createLineFromPoints([new THREE.Vector3 (-radius, 0.0, 0.0), new THREE.Vector3 (radius, 0.0, 0.0)], material));
    marker.add(this.createLineFromPoints([new THREE.Vector3 (0.0, -radius, 0.0), new THREE.Vector3 (0.0, radius, 0.0)], material));
    this.updatePosition(intersection, marker);
    return marker;
  }

  getFaceNormalManual(intersection: THREE.Intersection): THREE.Vector3 | null {
    const object = intersection.object as THREE.Mesh;
    if (!object.geometry || !(object.geometry instanceof THREE.BufferGeometry)) {
        return null;
    }

    const geometry = object.geometry as THREE.BufferGeometry;

    const index = geometry.index;
    const position = geometry.attributes['position'];

    if (!index || !position) {
        return null;
    }

    const a = index.getX(intersection.faceIndex! * 3);
    const b = index.getX(intersection.faceIndex! * 3 + 1);
    const c = index.getX(intersection.faceIndex! * 3 + 2);

    const vA = new THREE.Vector3().fromBufferAttribute(position, a);
    const vB = new THREE.Vector3().fromBufferAttribute(position, b);
    const vC = new THREE.Vector3().fromBufferAttribute(position, c);

    const cb = new THREE.Vector3();
    const ab = new THREE.Vector3();

    cb.subVectors(vC, vB);
    ab.subVectors(vA, vB);
    cb.cross(ab);

    cb.normalize();

    const normalMatrix = new THREE.Matrix3();
    normalMatrix.getNormalMatrix(object.matrixWorld);
    cb.applyMatrix3(normalMatrix).normalize();

    return cb;
  }

  onMouseMove(event: MouseEvent){
    let intersections = this.getIntersection(event.clientX, event.clientY);
    if(intersections.length === 0){
      if (this.tempMarker !== null) {
        this.tempMarker.visible = false;
        this.render();
      }
      if(this.cube != null){
        this.cube.visible = false;
        this.render();
      }
      return;
    }
    
    if (this.tempMarker === null) {
        this.tempMarker = this.generateMarker(intersections[0]);
        this.scene.add(this.tempMarker);
    }
    if (this.isDepthAnalyzerActive && this.cube === null) {
      this.cube = this.generateCube(intersections[0]);
      this.scene.add(this.cube);
    }
    this.updatePosition(intersections[0], this.tempMarker);
    this.tempMarker.visible = true;

    if(this.isDepthAnalyzerActive && this.cube){
      this.cube.visible = true;
      this.cube.position.set(intersections[0].point.x, intersections[0].point.y, intersections[0].point.z);
      this.updateDepth();
      let histogram_points = this.getHistogramPoints();
      this.sharedStateService.setHistogramValue(histogram_points);
    }
    this.render();
  }
}
