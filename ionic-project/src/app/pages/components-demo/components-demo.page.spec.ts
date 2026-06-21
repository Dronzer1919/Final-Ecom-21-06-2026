import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ComponentsDemoPage } from './components-demo.page';

describe('ComponentsDemoPage', () => {
  let component: ComponentsDemoPage;
  let fixture: ComponentFixture<ComponentsDemoPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ComponentsDemoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
