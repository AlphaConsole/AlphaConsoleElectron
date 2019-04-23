# AlphaConsoleElectron


# MASTER BRANCH INACTIVE DO NOT CREATE A PULL REQUEST
The UI is currently under redevelopment using Electron, React & Typescript. A PSA will be sent out when the ui is available for public contribution. 


## About 

This is the AlphaConsole UI. Originally written in c#.net but now moved to Electron where we can get a more custom UI.
This project contains only the electron code and not the DLL code that does the actual magic.

NOTE: MASTER BRANCH IS WIP (FOR WORKING UI USE THE "Public" BRANCH)

## Initial setup

Installing the dependencies. Navigate to the root of the project using a terminal (GitBash).

```
npm install
```

## Run the app

Running a simple dev version of the app. Navigate to the root of the project using a terminal (GitBash).

```
npm run test
```

Preferably open a second cmd window and navigate to the root of the project again but run 

```
npm run watch
```

Now everytime you modify the any scss files it will auto compile the files and you can refresh the app once the terminal says the changes are complete.

## Build an .exe 

To build the current dev version use

```
npm run build
```

You will find a built version of the code inside /dist/AlphaConsole-x64

---

If you want to create an installer you will need to install the electron builder globally by doing

```
npm install -g electron-builder
```

Next ``cd`` to the project directory and run

```
build -w
```

This will build a windows installer with all the options set in `` package.json ``. You can now distro this and use it to install the app.


## Compile Styles

If you make any changes to the styles you will need to run 

```
grunt sass
```

This will auto build all the style files, make sure the gruntfile is pointing to the correct files you want to compile & if you have any issues make sure you have Ruby installed on your PC.

To install sass on your computer globally then follow the steps [here](https://sass-lang.com/install) 

---

> [alphaconsole.net](http://www.alphaconsole.net/) &nbsp;&middot;&nbsp;
> Twitter [@alphaconsole](https://twitter.com/alphaconsole)
