import { ChangeDetectionStrategy, Component, ElementRef, Input, OnChanges, Renderer2, ViewChild } from '@angular/core';

import { QRCodeErrorCorrectionLevel, QRCodeVersion, QRCodeElementType, QRCodeCoveragePercentage } from './types';

import QRCode from 'qrcode';

@Component({
  selector: 'qrcode',
  template: `<div #qrcElement [class]="cssClass" (click)="downloadOnClick !== undefined && downloadQRCode()"></div>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QRCodeComponent implements OnChanges {
  // Deprecated
  @Input() public colordark = '';
  @Input() public colorlight = '';
  @Input() public level = '';
  @Input() public hidetitle = false;
  @Input() public size = 0;
  @Input() public usesvg = false;

  // Valid for 1.x and 2.x
  @Input() public allowEmptyString = false;
  @Input() public qrdata = '';

  // New fields introduced in 2.0.0
  @Input() public colorDark = '#000000ff';
  @Input() public colorLight = '#ffffffff';
  @Input() public cssClass = 'qrcode';
  @Input() public elementType: keyof typeof QRCodeElementType = 'canvas';
  @Input() public errorCorrectionLevel: keyof typeof QRCodeErrorCorrectionLevel = 'M';
  @Input() public margin = 4;
  @Input() public scale = 4;
  @Input() public version: QRCodeVersion;
  @Input() public width = 10;
  @Input() public downloadOnClick: boolean;
  @Input() public alt: string;
  @Input() public logo: File | string;
  @Input() public coveragePercentage: number;

  @ViewChild('qrcElement', { static: true }) public qrcElement: ElementRef;

  constructor(private renderer: Renderer2) {
    this.checkDeprecatedAttribute();
  }

  public ngOnChanges(): void {
    this.checkQRData();
    this.checkQRCodeVersion();

    this.createQRCode();
  }

  public downloadQRCode(filename = 'QRCode'): void {
    const element = this.qrcElement.nativeElement.childNodes[0];

    const a = document.createElement('a');
    if (element instanceof HTMLCanvasElement) {
      a.href = element.toDataURL('image/png');
      a.download = filename + '.png';
    } else if (element instanceof HTMLImageElement) {
      a.href = element.src;
      a.download = filename + '.png';
    } else {
      a.href = URL.createObjectURL(new Blob([element.innerHTML], {type: 'image/svg+xml;charset=utf-8'}));
      a.download = filename + '.svg';
    }

    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  private createQRCode(): void {
    const QRCodeOptionData = {
      scale: this.scale,
      width: this.width,
      margin: this.margin,
      version: this.version,
      type: undefined,
      errorCorrectionLevel: this.errorCorrectionLevel,
      color: {
        dark: this.colorDark,
        light: this.colorLight,
      },
    };

    let coeff = this.coveragePercentage;
    if (this.coveragePercentage === undefined) {
      coeff = QRCodeCoveragePercentage[this.errorCorrectionLevel];
    }

    try {
      let element: any;
      if (this.elementType === QRCodeElementType.svg) {
        // Generation of SVG Component
        element = document.createElement('template');

        QRCodeOptionData.type = 'svg';
        QRCode.toString(this.qrdata, QRCodeOptionData, (err: any, svgString: string) => {
          if (err) { throw err; }

          element.innerHTML = svgString.trim();
          element = element.content.firstChild as HTMLElement;
          this.renderer.setAttribute(element, 'height', `${this.width}`);
          this.renderer.setAttribute(element, 'width', `${this.width}`);
          this.loadLogo(element).then((logo) => {
            // Add logo if avaiable
            const size = coeff * 100;
            const pos = ((1 - coeff) / 2) * 100;
            element.innerHTML += `<image href="${logo.src}" height="${size}%" width="${size}%" x="${pos}%" y="${pos}%"></image>`;
          }).finally( () => {
            this.renderElement(element);
          });
        });
      } else {
        // Generation of CANVAS Component
        element = this.renderer.createElement('canvas') as HTMLCanvasElement;
        QRCode.toCanvas(element, this.qrdata, QRCodeOptionData, (err: any) => {
          if (err) { throw err; }

          this.loadLogo(element).then((logo) => {
            // Add logo if avaiable
            const size = Math.round(element.width * coeff);
            const pos = Math.round((element.width - size) / 2);
            element.getContext('2d').drawImage(logo, pos, pos, size, size);
          }).finally( () => {
            if (this.elementType !== QRCodeElementType.canvas) {
              // Generation of IMG Component
              const imgTag = this.renderer.createElement('img');
              imgTag.setAttribute('src', element.toDataURL('image/png'));
              element = imgTag;
            }
            this.renderElement(element);
          });
        });
      }
    } catch (e) {
      console.error('[angularx-qrcode] Error generating QR Code: ', e.message);
    }
  }

  private loadLogo(element: Element): Promise<HTMLImageElement> {
    if (this.logo) {
      return new Promise( resolve => {
        const imgLogo = new Image();
        imgLogo.onload = () => {
          // resolve Promise when Image is loaded
          resolve(imgLogo);
        };

        if (typeof this.logo === 'string') {
          // Logo as string url
          imgLogo.src = this.logo as string;
        } else {
          // Logo as file uploaded with <input type="file">
          const reader = new FileReader();
          reader.onload = () => {
            imgLogo.src = reader.result as string;
          };
          reader.readAsDataURL(this.logo as File);
        }
      });
    }
    // There is no Logo to add
    return Promise.reject('No Logo');
  }

  private renderElement(element: HTMLElement): void {
    if (this.alt) {
      element.setAttribute('alt', this.alt);
    }

    for (const node of this.qrcElement.nativeElement.childNodes) {
      this.renderer.removeChild(this.qrcElement.nativeElement, node);
    }
    this.renderer.appendChild(this.qrcElement.nativeElement, element);
  }

  private checkQRData(): void {
    // Check allowEmptyString
    let error: boolean = typeof this.qrdata === 'undefined';
    if (this.allowEmptyString === false) {
      error ||= this.qrdata === '' || this.qrdata === 'null' || this.qrdata === null;
    }
    if (error) {
      throw new Error('[angularx-qrcode] Field `qrdata` is empty, set`allowEmptyString="true"` to overwrite this behaviour.');
    }
  }

  private checkQRCodeVersion(): void {
    // Set sensitive defaults
    if (this.version && this.version > 40) {
      console.warn('[angularx-qrcode] max value for `version` is 40');
      this.version = 40;
    } else if (this.version && this.version < 1) {
      console.warn('[angularx-qrcode]`min value for `version` is 1');
      this.version = 1;
    } else if (this.version !== undefined && isNaN(this.version)) {
      console.warn('[angularx-qrcode] version should be a number, defaulting to auto.');
      this.version = undefined;
    }
  }

  private checkDeprecatedAttribute(): void {
    // Deprecation warnings
    if (this.colordark !== '') {
      console.warn('[angularx-qrcode] colordark is deprecated, use colorDark.');
    }
    if (this.colorlight !== '') {
      console.warn('[angularx-qrcode] colorlight is deprecated, use colorLight.');
    }
    if (this.level !== '') {
      console.warn('[angularx-qrcode] level is deprecated, use errorCorrectionLevel.');
    }
    if (this.hidetitle !== false) {
      console.warn('[angularx-qrcode] hidetitle is deprecated.');
    }
    if (this.size !== 0) {
      console.warn('[angularx-qrcode] size is deprecated, use `width`. Defaults to 10.');
    }
    if (this.usesvg !== false) {
      console.warn(`[angularx-qrcode] usesvg is deprecated, use [elementType]="'svg'".`);
    }
  }
}
