import { Injectable } from '@angular/core';
import * as childProcess from 'child_process';
import { FileFilter, ipcRenderer, OpenDialogOptions, remote, webFrame } from 'electron';
import * as fs from 'fs';

import { Settings } from '../models/Settings';

// If you import a module but never use any of the imported values other than as TypeScript types,
// the resulting javascript file will look as if you never imported the module at all.
@Injectable()
export class ElectronService {

  public ipcRenderer: typeof ipcRenderer;
  public webFrame: typeof webFrame;
  public remote: typeof remote;
  public childProcess: typeof childProcess;
  public fs: typeof fs;
  private _settings: Settings;

  constructor() {
    // Conditional imports
    if (this.isElectron()) {
      this.ipcRenderer = window.require('electron').ipcRenderer;
      this.webFrame = window.require('electron').webFrame;
      this.remote = window.require('electron').remote;

      this.childProcess = window.require('child_process');
      this.fs = window.require('fs');
    }
  }

  public saveSettings(settings: Settings) {
    fs.writeFileSync(this.getSettingsFile(), JSON.stringify(settings, null, 2));
    this._settings = settings;
  }

  public async getSettings() {
    if (!this._settings) {
      if (fs.existsSync(this.getSettingsFile())){
        const s: Settings = JSON.parse(fs.readFileSync(this.getSettingsFile()).toString());
        this._settings = s;
      } else {
        this._settings = {};
      }
    }

    return this._settings;
  }

  private getSettingsFile() : string {
    return this.remote.app.getPath('userData') + "/settings.json";
  }

  public async openFile(filter?: FileFilter): Promise<string|null> {
    return new Promise((resolve, reject) => {
      const options: OpenDialogOptions = {
        properties: ['openFile'],
        filters: []
      };
      if (filter) options.filters.push(filter);

      this.remote.dialog.showOpenDialog(options, (file) => {
        if (file && file[0]) return resolve(file[0]);
        return resolve(null);
      }); 
    });
  }

  public isElectron = () => {
    return window && window.process && window.process.type;
  }

  public async exec(command: string): Promise<string> {

    return new Promise((resolve, reject) => {
      this.childProcess.exec(command, (err, result) => {
        if (err) return reject(err);

        return resolve(result);
      });
    });
  }

}
