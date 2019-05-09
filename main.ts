import { app, BrowserWindow, screen, BrowserWindowConstructorOptions } from 'electron';
import * as path from 'path';
import * as url from 'url';
import * as fs from 'fs';
import { Settings } from './src/app/models/Settings';

let win, serve;
const args = process.argv.slice(1);
serve = args.some(val => val === '--serve');

function createWindow() {

  //const electronScreen = screen;
  //const size = electronScreen.getPrimaryDisplay().workAreaSize;
  const width = (serve) ? 900 : 300;
  const options: BrowserWindowConstructorOptions = {
    width: width,
    height: 300,
    webPreferences: {
      nodeIntegration: true,
    }
  };
  
  //todo store and set height and width
  /* if (fs.existsSync(this.getSettingsFile())){
    const file = this.remote.app.getPath('userData') + "/settings.json";
    const s: Settings = JSON.parse(fs.readFileSync(this.getSettingsFile()).toString());
    if (s.width) options.width = s.width;
    if (s.height) options.height = s.height;
    if (s.fullScreen) options.fullscreen = s.fullScreen;
  } */

  // Create the browser window.
  win = new BrowserWindow(options);

  if (serve) {
    require('electron-reload')(__dirname, {
      electron: require(`${__dirname}/node_modules/electron`)
    });
    win.loadURL('http://localhost:4200');
  } else {
    win.loadURL(url.format({
      pathname: path.join(__dirname, 'dist/index.html'),
      protocol: 'file:',
      slashes: true
    }));
  }

  if (serve) {
    win.webContents.openDevTools();
  }

  win.on('closing', () => {
    console.log("closing");
  });

  // Emitted when the window is closed.
  win.on('closed', () => {
    // Dereference the window object, usually you would store window
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null;
  });

}

try {

  // This method will be called when Electron has finished
  // initialization and is ready to create browser windows.
  // Some APIs can only be used after this event occurs.
  app.on('ready', createWindow);

  // Quit when all windows are closed.
  app.on('window-all-closed', () => {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

  app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (win === null) {
      createWindow();
    }
  });

} catch (e) {
  // Catch Error
  // throw e;
}
