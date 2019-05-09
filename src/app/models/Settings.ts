import { DockerComposeConfig } from './Docker';

export interface Settings {
  configs?: DockerComposeConfig[];
  fullScreen?: boolean;
  width?: number;
  height?: number;
  showInTray?: boolean;

}