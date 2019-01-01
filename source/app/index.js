const {app, BrowserWindow, ipcMain} = require('electron');
const twig                          = require('electron-twig');
const path                          = require('path');
const url                           = require('url');
const autoUpdater                   = require("electron-updater").autoUpdater;
var   log                           = require("electron-log");


  // Keep a global reference of the window object, if you don't, the window will
  // be closed automatically when the JavaScript object is garbage collected.
let mainWindow
autoUpdater.logger = log
autoUpdater.logger.transports.file.level = "info"
autoUpdater.on("checking-for-update", function (_arg1) {
    return log.info("Checking for update...");
});
autoUpdater.on("update-available", function (_arg2) {
    return log.info("Update available.");
});
autoUpdater.on("update-not-available", function (_arg3) {
    return log.info("Update not available.");
});
autoUpdater.on("error", function (err) {
    return log.info("Error in auto-updater. " + err);
});
autoUpdater.on("download-progress", function (progressObj) {
    return log.info("Downloading update.");
});
autoUpdater.on("update-downloaded", function (_arg4) {    
    autoUpdater.quitAndInstall(); 
    return log.info("Update downloaded.");
}); 

 
  function createWindow () {
    
    // Create the browser window.
    mainWindow = new BrowserWindow({
      titleBarStyle: 'hidden',
      resizable: true, 
      frame: false, 
      minWidth: 1280,
      maxWidth: 1600,
      width: 1600,
      height: 900,
      webPreferences: {
        devTools: true
      },
      icon: path.join(__dirname, '/views/assets/img/logo_normal.png'),
      show: false // don't show the main window
    })

    // and load the index.html of the app.
    mainWindow.loadURL(url.format({
      pathname: path.join(__dirname, '/views/landing.twig'),
      protocol: 'file:',
      slashes: true
    }))

    /** Open the DevTools on start
    This should no longer be needed as the ui doesnt cover the DevTools window
      [ mainWindow.webContents.openDevTools() ]
    */

    // if main window is ready to show, then destroy the splash window and show up the main window
    mainWindow.once('ready-to-show', () => {
      splash.destroy();
      mainWindow.show();
    });

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

  app.on('ready', () => {
  
    // create a new `splash`-Window 
    splash = new BrowserWindow({width: 150, height: 150, transparent: true, frame: false, alwaysOnTop: true, center:true, icon: path.join(__dirname, '/views/assets/img/logo_normal.png')});
    // and load the splash.twig of the app.
    splash.loadURL(url.format({
      pathname: path.join(__dirname, '/views/splash-screen.twig'),
      protocol: 'file:',
      slashes: true
    }))

    //initilize the main window process
    createWindow();

  });




  // app.on('ready', createWindow)
  app.on("ready", function () {
    autoUpdater.checkForUpdatesAndNotify();
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
    autoUpdater.checkForUpdatesAndNotify();
  });

  ipcMain.on('alwaystop', (event, arg) => {
      
    console.log(arg);

    mainWindow.setAlwaysOnTop(arg, "floating");
    mainWindow.setVisibleOnAllWorkspaces(arg);
    mainWindow.setFullScreenable(!arg);

  });
  
  // In this file you can include the rest of your app's specific main process
  // code. You can also put them in separate files and require them here.


  

  // in main.js

  ipcMain.on('resize-me-please', (event, arg) => {
    mainWindow.setSize(1280,720)
  })