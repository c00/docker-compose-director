import { Component, OnDestroy, OnInit } from '@angular/core';

import { DockerComposeConfig, DockerContainer } from '../../models/Docker';
import { ElectronService } from '../../providers/electron.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {
  //todo make configurable and stuff.
  configs: DockerComposeConfig[] = [
    { name: 'Netques', file: '/home/coo/dev/www/docker/matthias-docker/docker-compose.yml', status: 'active' },
    { name: 'Wanna Train', file: '/home/coo/dev/www/docker/wannatrain-docker/docker-compose.yml', status: 'stopped' },
    { name: 'Development', file: '/home/coo/dev/www/docker/dev/docker-compose.yml', status: 'stopped' },
  ];
  containers: DockerContainer[] = [];

  interval: NodeJS.Timer;

  constructor(private es: ElectronService) { 

  }

  public async toggle(c: DockerComposeConfig) {
    const wasActive = c.status === 'active';
    await this.stopActive();
    if (wasActive) return 
    
    return this.start(c);
  }

  private async stopActive() {
    const c = this.configs.find(c => c.status === 'active');
    if (!c) return;

    c.status = 'stopping';
    await this.es.exec(`docker-compose -f ${c.file} down`);
    c.status = 'stopped';
  }

  private async start(c: DockerComposeConfig) {
    c.status = 'starting';
    await this.es.exec(`docker-compose -f ${c.file} up -d`);
    c.status = 'active';
  }

  public async ngOnInit() {
    this.dockerStatus();
  }

  private async dockerStatus() {
    this.interval = setInterval(async () => {
      const output = await this.es.exec('docker container ls');
      this.containers = DockerContainer.containersFromCli(output);
    }, 1000);
  }

  public ngOnDestroy() {
    if (this.interval) {
      this.interval.unref();
      this.interval = null;
    }
  }

}
