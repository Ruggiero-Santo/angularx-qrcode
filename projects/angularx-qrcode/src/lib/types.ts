export const enum QRCodeErrorCorrectionLevel {
  low = 'low',
  medium = 'medium',
  quartile = 'quartile',
  high = 'high',
  L = 'L',
  M = 'M',
  Q = 'Q',
  H = 'H',
}

export const enum QRCodeElementType {
  url = 'url',
  img = 'img',
  canvas = 'canvas',
  svg = 'svg',
}

export const QRCodeCoveragePercentage = {
  low: 0.07,
  medium: 0.15,
  quartile: 0.25,
  high: 0.3,
  L: 0.07,
  M: 0.15,
  Q: 0.25,
  H: 0.3,
};

export type QRCodeVersion =
0|1|2|3|4|5|6|7|8|9|10|11|12|13|14|15|16|17|18|19|20|21|22|23|24|25|26|27|28|29|30|31|32|33|34|35|36|37|38|39|40;
