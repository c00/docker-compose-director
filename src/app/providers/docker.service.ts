import { Injectable } from '@angular/core';
import { readFileSync } from 'fs';
import * as yaml from 'js-yaml';
import * as path from 'path';
import { BehaviorSubject } from 'rxjs';

import { DockerComposeConfig, DockerContainer } from '../models/Docker';
import { ElectronService } from './electron.service';

@Injectable()
export class DockerService {
  private interval: any;
  public configsChanges = new BehaviorSubject<DockerComposeConfig[]>([]);
  public containersChanged = new BehaviorSubject<DockerContainer[]>([]);
  private configs: DockerComposeConfig[] = [
    { name: 'Netques', file: '/home/coo/dev/www/docker/matthias-docker/docker-compose.yml', status: 'stopped' },
    { name: 'Wanna Train', file: '/home/coo/dev/www/docker/wannatrain-docker/docker-compose.yml', status: 'stopped' },
    { name: 'Development', file: '/home/coo/dev/www/docker/dev/docker-compose.yml', status: 'stopped' },
  ];

  constructor(private es: ElectronService) {
    //todo get from saved data
    this.configsChanges.next(this.configs);
    this.getActiveConfig();
  }

  public async addConfig() {
    const file = await this.es.openFile({name: 'docker-compose yaml', extensions: ['yml', 'yaml']});

    const found = this.configs.find((c) => c.file === file);
    if (found) return;

    //make name for it
    let name = path.basename(path.dirname(file));
    name = name.replace(/[-_]/g, ' ')
      .replace(/(docker)/i, '')
      .trim();

    this.configs.push({ name, file, status: 'stopped'})
  }

  public async stopConfig(c: DockerComposeConfig) {
    this.startDockerChecks();
    c.status = 'stopping';
    await this.es.exec(`docker-compose -f ${c.file} down`);
    this.stopChecks(true);
    c.status = 'stopped';
  }

  public async startConfig(c: DockerComposeConfig) {
    this.startDockerChecks();
    c.status = 'starting';
    await this.es.exec(`docker-compose -f ${c.file} up -d`);
    this.stopChecks(true);
    c.status = 'active';
  }

  private async startDockerChecks() {
    //already started?
    if (this.interval) return;

    console.log("Starting checks...");
    this.interval = setInterval(async () => {
      console.log("Interval triggered");
      this.getContainers();
    }, 1000);
  }

  public stopChecks(delay: boolean) {
    if (!this.interval) return;

    //The delay makes us check a few times after we're done starting/stopping, 
    // in case some containers failed shortly after starting.

    const time = delay ? 4000 : 0;
    setTimeout(() => {
      clearInterval(this.interval);
      this.interval = null;
      console.log("Checks stopped.");
    }, time);
    
  }

  private async getContainers() {
    const output = await this.es.exec('docker container ls');
    const containers = DockerContainer.containersFromCli(output);
    this.containersChanged.next(containers);
    return containers;
  }

  private async getActiveConfig() {
    const runningContainerNames = (await this.getContainers()).map((container: DockerContainer) => container.name );

    //Check with Docker which config is (partially) active.
    for (let c of this.configs) {
      const compose = yaml.safeLoad(readFileSync(c.file, 'utf8'));
      //If a container name within the compose file is the same as any running container, it is active.
      for(let index in compose.services) {
        const service = compose.services[index];
        if (service.container_name && runningContainerNames.indexOf(service.container_name) > -1) {
          c.status = "active";
          console.log("Found active config", c);
          break;
        }
      }
      
    }
  }
}