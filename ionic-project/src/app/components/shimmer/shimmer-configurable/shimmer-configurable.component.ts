import { Component, Input, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ShimmerBaseComponent } from '../shimmer-base/shimmer-base.component';
import { getShimmerConfig, detectDevice, ShimmerDeviceConfig } from '../shimmer.config';

@Component({
  selector: 'app-shimmer-configurable',
  standalone: true,
  imports: [CommonModule, ShimmerBaseComponent],
  templateUrl: './shimmer-configurable.component.html',
  styleUrls: ['./shimmer-configurable.component.scss']
})
export class ShimmerConfigurableComponent implements OnInit, OnDestroy {
  @Input() mode: string = 'home';
  @Input() type: string = 'product';
  @Input() count: number = 8;
  
  config!: ShimmerDeviceConfig;
  device: 'desktop' | 'tablet' | 'mobile' = 'desktop';
  private resizeListener?: () => void;

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.updateConfig();
    this.setupResizeListener();
  }

  ngOnDestroy() {
    if (this.resizeListener) {
      window.removeEventListener('resize', this.resizeListener);
    }
  }

  private setupResizeListener() {
    this.resizeListener = () => {
      const newDevice = detectDevice();
      if (newDevice !== this.device) {
        this.device = newDevice;
        this.updateConfig();
        this.cdr.detectChanges();
      }
    };
    window.addEventListener('resize', this.resizeListener);
  }

  private updateConfig() {
    this.device = detectDevice();
    this.config = getShimmerConfig(this.mode, this.type, this.device);
  }

  get items(): number[] {
    return Array(this.count).fill(0);
  }

  getCardStyle() {
    return {
      width: this.config.card.width,
      height: this.config.card.height || 'auto',
      padding: `${this.config.card.padding}px`,
      borderRadius: `${this.config.card.borderRadius}px`,
      background: '#fff',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
    };
  }

  getGridStyle() {
    const grid = this.config.grid;
    if (grid.layout === 'grid') {
      return {
        display: 'grid',
        gridTemplateColumns: grid.columns,
        gap: `${grid.gap}px`,
        padding: `${this.config.container.padding || 0}px`
      };
    } else if (grid.layout === 'flex') {
      return {
        display: 'flex',
        flexDirection: grid.direction || 'row',
        gap: `${grid.gap}px`,
        justifyContent: grid.justifyContent || 'flex-start',
        alignItems: grid.alignItems || 'stretch',
        padding: `${this.config.container.padding || 0}px`
      };
    } else {
      return {
        display: 'flex',
        overflowX: 'auto',
        gap: `${grid.gap}px`,
        padding: `${this.config.container.padding || 0}px`
      };
    }
  }

  getContainerStyle() {
    return {
      height: this.config.container.height || 'auto',
      width: this.config.container.width || '100%'
    };
  }

  getImageStyle() {
    if (!this.config.card.imageHeight) return {};
    return {
      height: `${this.config.card.imageHeight}px`,
      width: this.config.card.imageWidth || '100%',
      marginBottom: `${this.config.card.gap || 10}px`,
      borderRadius: '50%'
    };
  }

  getLineStyle(line: any) {
    return {
      height: `${line.height}px`,
      width: line.width,
      marginBottom: `${line.marginBottom}px`
    };
  }

  getButtonStyle(button: any) {
    const style: any = {
      height: `${button.height}px`,
      width: button.width,
      borderRadius: '4px'
    };

    if (button.marginTop) {
      style.marginTop = `${button.marginTop}px`;
    }

    return style;
  }

  getButtonsContainerStyle() {
    return {
      display: 'flex',
      gap: '10px',
      alignItems: 'center',
      marginTop: '10px'
    };
  }

  getCardContentStyle() {
    return {
      display: 'flex',
      flexDirection: 'column',
      gap: `${this.config.card.gap || 0}px`
    };
  }
}
