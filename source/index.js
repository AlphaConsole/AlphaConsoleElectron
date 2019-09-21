const {app, BrowserWindow} = require('electron');
const { ipcMain } = require('electron');
const path = require('path')
const url = require('url')
const isDev = require('electron-is-dev');
const autoUpdater = require("electron-updater").autoUpdater
var log = require("electron-log")

  // Keep a global reference of the window object, if you don't, the window will
  // be closed automatically when the JavaScript object is garbage collected.
  let mainWindow
autoUpdater.logger = log
autoUpdater.logger.transports.file.level = "info"
if (isDev) {
  autoUpdater.updateConfigPath = path.join(__dirname, 'dev-app-update.yml');
}
autoUpdater.on("checking-for-update", function (_arg1) {
    return log.info("Checking for update...");
});
autoUpdater.on("update-available", function (_arg2) {
    mainWindow.webContents.send("check-for-updates-response-updating");
    return log.info("Update available.");
});
autoUpdater.on("update-not-available", function (_arg3) {
    mainWindow.webContents.send("check-for-updates-response-none");
    return log.info("Update not available.");
});
autoUpdater.on("error", function (err) {
    return log.info("Error in auto-updater. " + err);
});
autoUpdater.on("download-progress", function (progressObj) {
    mainWindow.webContents.send("check-for-updates-response-updating");
    return log.info("Downloading update.");
});
autoUpdater.on("update-downloaded", function (_arg4) {    
    mainWindow.webContents.send("check-for-updates-response-updating");
    autoUpdater.quitAndInstall(); 
    return log.info("Update downloaded.");
}); 

 
  function createWindow () {
    
    // Create the browser window.
    mainWindow = new BrowserWindow({
      titleBarStyle: 'hidden',
      resizable: true, 
      frame: false, 
      minWidth: 720,
      maxWidth: 720,
      width: 720,
      height: 936,
      maxHeight: 936,
      webPreferences: {
        devTools: true
      },
      icon: path.join(__dirname, '/assets/img/logo_normal.png')
    })

    // and load the index.html of the app.
    mainWindow.loadURL(url.format({
      pathname: path.join(__dirname, 'index.html'),
      protocol: 'file:',
      slashes: true
    }))

  
    // Open the DevTools.
    //mainWindow.webContents.openDevTools()
 
    // Emitted when the window is closed.
    mainWindow.on('closed', function () {
      // Dereference the window object, usually you would store windows
      // in an array if your app supports multi windows, this is the time
      // when you should delete the corresponding element.
      mainWindow = null
    })
  }
  
  // This method will be called when Electron has finished
  // initialization and is ready to create browser windows.
  // Some APIs can only be used after this event occurs.
  app.on('ready', createWindow)
  app.on("ready", function () {
    autoUpdater.checkForUpdates();
  });
  // Quit when all windows are closed.
  app.on('window-all-closed', () => {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
      app.quit()
    }
  })
  
  app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (wimainWindown === null) {
      createWindow()
    }
  })

  ipcMain.on('refreshwindow', () => {
    
mainWindow.webContents.executeJavaScript("SaveConfiguration()");

    mainWindow.webContents.reloadIgnoringCache()

  });

  ipcMain.on('check-for-updates', () => {
    console.log("checking for updates");
    mainWindow.webContents.send("check-for-updates-response-checking");
    autoUpdater.checkForUpdates();
  });

  ipcMain.on('alwaystop', (event, arg) => {
      
    console.log(arg);

    mainWindow.setAlwaysOnTop(arg, "floating");
    mainWindow.setVisibleOnAllWorkspaces(arg);
    mainWindow.setFullScreenable(!arg);

  });
  
  // In this file you can include the rest of your app's specific main process
  // code. You can also put them in separate files and require them here.