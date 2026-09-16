import type { Coordinate } from "@/types/model";

export interface CoordinateBounds {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

export interface SvgPoint {
  x: number;
  y: number;
}

export function getCoordinateBounds(coordinates: readonly Coordinate[], paddingRatio = 0.08): CoordinateBounds {
  if (coordinates.length === 0) {
    return { minX: -1, maxX: 1, minY: -1, maxY: 1 };
  }

  const xValues = coordinates.map(([x]) => x);
  const yValues = coordinates.map(([, y]) => y);
  const rawMinX = Math.min(...xValues);
  const rawMaxX = Math.max(...xValues);
  const rawMinY = Math.min(...yValues);
  const rawMaxY = Math.max(...yValues);
  const xPadding = Math.max((rawMaxX - rawMinX) * paddingRatio, 1);
  const yPadding = Math.max((rawMaxY - rawMinY) * paddingRatio, 1);

  return {
    minX: rawMinX - xPadding,
    maxX: rawMaxX + xPadding,
    minY: rawMinY - yPadding,
    maxY: rawMaxY + yPadding,
  };
}

export function mapCoordinateToSvg(
  [x, y]: Coordinate,
  bounds: CoordinateBounds,
  width: number,
  height: number,
  inset = 6,
): SvgPoint {
  const usableWidth = width - inset * 2;
  const usableHeight = height - inset * 2;
  const xRatio = (x - bounds.minX) / (bounds.maxX - bounds.minX);
  const yRatio = (y - bounds.minY) / (bounds.maxY - bounds.minY);

  return {
    x: inset + xRatio * usableWidth,
    y: height - inset - yRatio * usableHeight,
  };
}