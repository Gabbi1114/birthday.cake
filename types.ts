export interface CylinderProps {
  position?: [number, number, number];
  count?: number;
  radius?: number;
  height?: number;
  color?: string;
  particleSize?: number;
}

export interface RingProps {
  radius: number;
  tube: number;
  color: string;
  speed?: number;
  rotationOffset?: [number, number, number];
}

export enum ViewMode {
  ORBIT = 'ORBIT',
  TOP = 'TOP',
  SIDE = 'SIDE'
}