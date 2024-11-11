import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModelLoaderComponent } from './model-loader.component';

describe('ModelLoaderComponent', () => {
  let component: ModelLoaderComponent;
  let fixture: ComponentFixture<ModelLoaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModelLoaderComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModelLoaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
