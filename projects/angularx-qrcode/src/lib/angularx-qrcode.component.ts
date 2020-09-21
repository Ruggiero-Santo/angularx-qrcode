import { ChangeDetectionStrategy, Component, ElementRef, Input, OnChanges, Renderer2, ViewChild } from '@angular/core';

import { QRCodeErrorCorrectionLevel, QRCodeVersion, QRCodeElementType } from './types';

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
    try {
      let element: HTMLElement;
      switch (this.elementType) {
        case 'svg':
          element = this.renderer.createElement('svg', 'svg');
          this.toSVG().then((svgString: string) => {
            element.innerHTML = svgString;
            this.renderer.setAttribute(element, 'height', `${this.width}`);
            this.renderer.setAttribute(element, 'width', `${this.width}`);
            this.renderElement(element);
          });
          break;
        case 'canvas':
          element = this.renderer.createElement('canvas');
          this.toCanvas(element).then(() => {
            this.renderElement(element);
          });
          break;
        case 'url':
        case 'img':
        default:
          element = this.renderer.createElement('img');
          this.toDataURL().then((dataUrl: string) => {
            element.setAttribute('src', dataUrl);
            this.renderElement(element);
          });
      }
    } catch (e) {
      console.error('[angularx-qrcode] Error generating QR Code: ', e.message);
    }
  }

  private toDataURL(): Promise<any> {
    return new Promise(
      (resolve: (arg: any) => any, reject: (arg: any) => any) => {
        QRCode.toDataURL(
          this.qrdata,
          {
            color: {
              dark: this.colorDark,
              light: this.colorLight,
            },
            errorCorrectionLevel: this.errorCorrectionLevel,
            margin: this.margin,
            scale: this.scale,
            version: this.version,
            width: this.width,
          },
          (err, url) => {
            if (err) {
              reject(err);
            } else {
              resolve(url);
            }
          }
        );
      }
    );
  }

  private toCanvas(canvas: Element): Promise<any> {
    return new Promise(
      (resolve: (arg: any) => any, reject: (arg: any) => any) => {
        QRCode.toCanvas(
          canvas,
          this.qrdata,
          {
            color: {
              dark: this.colorDark,
              light: this.colorLight,
            },
            errorCorrectionLevel: this.errorCorrectionLevel,
            margin: this.margin,
            scale: this.scale,
            version: this.version,
            width: this.width,
          },
          (error) => {
            if (error) {
              reject(error);
            } else {
              resolve('success');
            }
          }
        );
      }
    );
  }

  private toSVG(): Promise<any> {
    return new Promise(
      (resolve: (arg: any) => any, reject: (arg: any) => any) => {
        QRCode.toString(
          this.qrdata,
          {
            color: {
              dark: this.colorDark,
              light: this.colorLight,
            },
            errorCorrectionLevel: this.errorCorrectionLevel,
            margin: this.margin,
            scale: this.scale,
            type: 'svg',
            version: this.version,
            width: this.width,
          },
          (err, url) => {
            if (err) {
              reject(err);
            } else {
              resolve(url);
            }
          }
        );
      }
    );
  }

  private renderElement(element: HTMLElement): void {
    for (const node of this.qrcElement.nativeElement.childNodes) {
      this.renderer.removeChild(this.qrcElement.nativeElement, node);
    }
    this.renderer.appendChild(this.qrcElement.nativeElement, element);
  }

  private checkQRData(): void {
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
