import { Component, OnDestroy, OnInit } from '@angular/core';

import { DockerComposeConfig, DockerContainer } from '../../models/Docker';
import { ElectronService } from '../../providers/electron.service';
import { DockerService } from '../../providers/docker.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {
  //todo make configurable and stuff.
  configs: DockerComposeConfig[] = [];
  containers: DockerContainer[] = [];

  interval: NodeJS.Timer;

  constructor(
    private es: ElectronService,
    private docker: DockerService,
  ) { 
    docker.containersChanged.subscribe(containers => this.containers = containers );
    docker.configsChanges.subscribe(configs => this.configs = configs );
  }

  public async ngOnInit() {
    //todo make it correctly tell whih one is active.
  }

  public addConfig() {
    //todo
    this.docker.addConfig();
  }

  public async toggle(c: DockerComposeConfig) {
    const wasActive = c.status === 'active';
    await this.stopActive();
    if (wasActive) return 
    
    await this.start(c);
    this.getContainers();
  }

  private async stopActive() {
    const c = this.configs.find(c => c.status === 'active');
    if (!c) return;

    return this.docker.stopConfig(c);
  }

  private async start(c: DockerComposeConfig) {
    return this.docker.startConfig(c);
  }

  private async getContainers() {
    const output = await this.es.exec('docker container ls');
    this.containers = DockerContainer.containersFromCli(output);
  }

  public ngOnDestroy() {
    this.docker.stopChecks(false);
  }

}
