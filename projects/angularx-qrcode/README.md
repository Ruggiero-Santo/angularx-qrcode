:warning: WARNING
```diff
- I am not an Angular expert so the code produced may not be optimised.
- The foked Repo has been updated since I made these enhancements (September 2020)
-   as well as Angular so the code may not work with the new version.
```
I will soon be resuming the work left undone to do a PR with the updated and thoroughly tested code.

# angularx-qrcode

`angularx-qrcode` is a fast and easy-to-use Ionic 3/4/5 and Angular4-10 QR Code component/module library to generate QR Codes (Quick Response) in your Ionic and Angular 4/5/6/7/8/9/10 app with support for AOT and the Ivy compiler and runtime. It is a drop-in replacement for the no-longer-maintained angular2 component `ng2-qrcode` and based on node-qrcode.

## Demo App

An Angular app with a working implementation of angularx-qrcode is available at
[github.com/Cordobo/angularx-qrcode-sample-app](https://github.com/Cordobo/angularx-qrcode-sample-app).

## Install angularx-qrcode 10.0.x with Angular 10

Starting with angularx-qrcode 10, major versions of angular and angularx-qrcode are synchronized, so angular 10 requires angularx-qrcode 10, making it easier to use the right version.

```bash
# Angular 10 and Ionic
npm install angularx-qrcode --save
# Or use yarn
yarn add angularx-qrcode
```

## Install angularx-qrcode 2.3.x with Angular 9

```bash
# Angular 9 and Ionic
npm install angularx-qrcode@~2.3.5 --save
# Or use yarn
yarn add angularx-qrcode@~2.3.5
```

## Install angularx-qrcode 2.1.x with Angular 8

```bash
# Angular 8 and Ionic
npm install angularx-qrcode@~2.1.4 --save
# Or use yarn
yarn add angularx-qrcode@~2.1.4
```

## Older Angular Versions

```bash
# Angular 5/6/7
npm install angularx-qrcode@1.6.4 --save
# Angular 4
npm install angularx-qrcode@1.0.3 --save
```

## New in angularx-qrcode 2.x

- Ivy Compiler and Runtime Support
- angularx-qrcode is now based on node-qrcode and ships a couple of new features (keeping all the known features)
- New: append CSS classes with `cssClass`
- New `elementType` field: `url`, `img`, `canvas` and `svg`
- New `margin` field. Define how wide the quiet zone should be.
- New `scale`, scale factor. A value of 1 means 1px per module (black dot).
- New `version` field. QR Code version. If not specified the most suitable value will be calculated.

## Upgrade from 1.x to 2.x or 10.x

Upgrading should be simple. If any deprecated field is used, angularx-qrcode logs a warning to your browser console with the field name which should be renamed.

```html
<!-- Old code in 1.x -->
<qrcode [qrdata]="'Your data'" [size]="256" [level]="'M'" usesvg="true"></qrcode>

<!-- New code in 2.x or 10.x -->
<qrcode [qrdata]="'Your data'" [width]="256" [errorCorrectionLevel]="'M'" [elementType]="'svg'"></qrcode>
```

| Deprecated | New                  |
| ---------- | -------------------- |
| colordark  | colorDark            |
| colorlight | colorLight           |
| level      | errorCorrectionLevel |
| size       | width                |
| usesvg     | elementType          |

## Basic Usage

### Import the module and add it to your imports section in your main AppModule:

```ts
// File: app.module.ts
// all your imports
import { QRCodeModule } from 'angularx-qrcode';

@NgModule({
declarations: [
  AppComponent
],
imports: [
  QRCodeModule
],
providers: [],
bootstrap: [AppComponent]
})
export class AppModule { }
```

## Examples: How to implement angularx-qrcode

### Generate static QR Code with only html file

Now that Angular/Ionic knows about the new QR Code module,
let's invoke it from our template with a directive.
If we use a simple text-string, we need no additional
code in our controller.

```html
<qrcode qrdata="Your data string" width="256" errorCorrectionLevel="M"></qrcode>
```
### Create a QR Code from a variable in your controller (directive only)

In addition to our `<qrcode>`, we must add the directive in `example.component.html`:

```html
<!-- File: example.html -->
<qrcode [qrdata]="myAngularxQrCode" width="256" errorCorrectionLevel="M"></qrcode>
```
and lets add two lines of code to our controller `example.component.ts`.
```ts
// File: example.ts
export class QRCodeComponent {
  public myAngularxQrCode: string = null;
  constructor () {
    // assign a value
    this.myAngularxQrCode = 'Your QR code data string';
  }
}
```

### Download generated QRCode
You can easily make generated QRCode downloadable by clicking directly on it.

In `example.component.ts` nothing must be modified, while in `example.component.html` need to be add only attribute `downloadOnCLick`.
```html
<qrcode 
  [qrdata]="myAngularxQrCode"
  cssClass="generatedQRCode"
  errorCorrectionLevel="M"
  width=256
  downloadOnCLick>
</qrcode>
```

You can even associate the download on a button, like in the example below, but the `qrcodeTag.downloadQRCode()` function can be used associated with any type of event or tag. You just have to be careful to insert the identifier in the qrcode tag with #, in the example the identifier is `#qrcodeTag`.
```html
<qrcode 
  [qrdata]="value"
  errorCorrectionLevel="L"
  elementType="svg"
  colorDark=#0F0
  #qrcodeTag>
</qrcode></br>
<button (click)="qrcodeTag.downloadQRCode()">Download QRCode</button>
```
The two options can be used simultaneously.

### Custom image in QRCode
You can easily insert an image in the center of the QRCode. 
The insertion can be done normally like any other variable by entering the image path or it can also be indicated by the user using an input tag.

For a static image in `app.component.html` need to insert:
```html
<qrcode 
  [qrdata]="value"
  [logo]="pathLogo"
  elementType="url" 
  errorCorrectionLevel="L">
</qrcode>
```
`app.component.ts`, need to be like this:

```ts
export class AppComponent {
  value = 'myAwesome.site';
  pathLogo: string = "./your_path/img.png";
}
```

The image can be inserted by the user via the input tags adding in `app.component.html` input field like: 
```html
<qrcode 
  [qrdata]="value"
  [logo]="userLogo"
  elementType="img" 
  errorCorrectionLevel="H">
</qrcode></br>
<input type="file" #input_logo (change)="update_logo(input_logo.files[0])"><br>
<input #input_data (change)="update_data(input_data.value)">

```
While `app.component.ts`, need to be insert the handlers:

```ts
export class AppComponent {
  value = 'Great QRCode with Logo';
  userLogo: File;

  update_logo(file: File) { this.userLogo = file }
  update_data(data: string) { this.value = data }
}
```

# All Parameters

| Attribute            | Type    | Default     | Description                                                    |
| -------------------- | ------- | ----------- | -------------------------------------------------------------- |
| allowEmptyString     | Boolean | false       | Allow qrdata to be an empty string                             |
| colorDark            | String  | '#000000ff' | RGB or RGBA color, color of dark module                        |
| colorLight           | String  | '#ffffffff' | RGB or RGBA color, color of light module                       |
| cssClass             | String  | 'qrcode'    | CSS Class                                                      |
| elementType          | String  | 'canvas'    | 'canvas', 'svg', 'img', 'url' (alias for 'img')                |
| errorCorrectionLevel | String  | 'M'         | QR Correction level ('L', 'M', 'Q', 'H')                       |
| margin               | Number  | 4           | Define how much wide the quiet zone should be.                 |
| qrdata               | String  | ''          | String to encode                                               |
| scale                | Number  | 4           | Scale factor. A value of 1 means 1px per modules (black dots). |
| version              | Number  | (auto)      | 1-40                                                           |
| width                | Number  | 10          | Height/Width (any value). For "canvas", "img" and "url" type there is a min value, automatically computed, according how much data is encoded. For "svg" [see Note](#Note). |
| downloadOnCLick      | Boolean | false       | If attribute is present the qrcode will be downloadable OnClick.|
| alt                  | String  | ''          | Description of QRCode useful alternative information if a user for some reason cannot view it|
| logo                 | File or String | undefined | File from `<input type="file">` or a URL. Best practice is use 0 margin when logo is defined, [see Note](#Note) for more info. |
| coveragePercentage   | Number[0,1]  | (auto)      | Indicates how much of the QRCode will be covered by the logo. Default value chosen according to errorCorrectionLevel. |

## Note
### Logo
Error correction capability allows to successfully scan a QR Code even if the symbol is dirty or damaged.
Four levels are available to choose according to the operating environment. In our case if we want to insert a logo in the QRCode we must see this image as noise during reading. The size of inserted logo is computed according level used during generation. The size of the logo is calculated taking into account the size of the generated QRCode (widthLogo = widthIMAGE * ErrorCorrectionCabability), so to get the optimal logo size it is recommended to use the margin of 0. If you want to keep a certain degree of error correction capability leave default _margin_ value. 

| Level            | Error resistance | Default value _coveragePercentage_|
|------------------|:----------------:|:---------------------------------:|
| **L** (Low)      | **~7%**          | 0.07                              |
| **M** (Medium)   | **~15%**         | 0.15                              |
| **Q** (Quartile) | **~25%**         | 0.25                              |
| **H** (High)     | **~30%**         | 0.3                               |

### SVG
When generating the qrcode in SVG format the indication of the `width` attribute is very important since the default value is 10 and therefore the QRCode of 10X10px will be displayed.

## AOT - Ahead Of Time Compilation

`angularx-qrcode` supports AOT Compilation (Ahead-of-Time Compilation) which results in significant faster rendering. An AOT-enabled module is included. Further reading: https://angular.io/guide/aot-compiler

## SSR - Server Side Rendering

As of version 1.6.0, SSR support is fully implemented, the following workaround is no longer needed. [HowTo use Angular QRCode with SSR](https://github.com/Cordobo/angularx-qrcode/issues/5)

## Available commands
```bash
  # Build
  npm run build
```

## Contribution

- Please open your PR against the development branch.
- Make sure your editor uses the packages .editorconfig file to minimize commited code changes.
- Use `npm run lint` before you commit

## License

MIT License

Copyright (c) 2018 - present [Andreas Jacob (Cordobo.com)](http://cordobo.com/)
