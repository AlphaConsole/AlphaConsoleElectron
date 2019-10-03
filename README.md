# AlphaConsoleElectron

## About

This is the AlphaConsole UI. Originally written in c#.net but now moved to Electron where we can get a more custom UI.
This project contains only the electron code and not the DLL code that does the actual magic.

## Initial setup

Installing the dependencies. Navigate to the root of the project using a terminal (GitBash).

```bash
npm install
```

## Run the app

Running a simple dev version of the app. Navigate to the root of the project using a terminal (GitBash).

```bash
npm run test
```

Preferably open a second cmd window and navigate to the root of the project again but run

```bash
npm run watch
```

Now everytime you modify the any scss files it will auto compile the files and you can refresh the app once the terminal says the changes are complete.

## Build an .exe

To build a release version, you should first ensure you have Inno Setup Compiler installed on your PC. YOu can install it from [here](http://www.jrsoftware.org/download.php/is.exe)

Run the following to create the required files for Inno Setup Compiler

```bash
npm run pack
```

Open `ACBuild.iss` in Inno Setup Compiler and Choose `Build > Compile`. This will compile an exe named `AlphaConsole_Setup_version.exe` such as `AlphaConsole_Setup_9.12.0.0.exe` (the extra .0 is important).

You should now create a `latest.yml` file. You will create this in the following format:

```yml
version: 9.12.0
releaseDate: '2019-10-02T14:21:04.217Z'
path: AlphaConsole_Setup_9.12.0.0.exe
sha512: >-
  2031ace18d9630909aacb3b8221fe71713026e09b8e11d1e9ab3f346a1223010809aa4a5362b4d8b1ec449da1b599c6e8d1e706c1887ad0e502f242e7ea8b59f
sha2: 9657f86c1ddc34eb931da869b033cd1823900f77cadda28fdd840917806742cd
githubArtifactName: AlphaConsole_Setup_9.12.0.0.exe
```

To get the `sha512` and `sha2` you can upload the exe to [here](https://md5file.com/calculator) and note SHA-512 and SHA-256 respectively. Ensure to update the `path` and `githubArtifaceName` in the `latest.yml` also.

Create the GitHub release, and then upload both the `latest.yml` and the `.exe` for the setup. Ensure to set the release body to the changelog. Distribute the setup executable internally first to ensure no glaring errors appear with the setup. Then publish the release.

## Compile Styles

If you make any changes to the styles you will need to run

```bash
grunt sass
```

This will auto build all the style files, make sure the gruntfile is pointing to the correct files you want to compile & if you have any issues make sure you have Ruby installed on your PC.

To install sass on your computer globally then follow the steps [here](https://sass-lang.com/install)

---

> [alphaconsole.net](http://www.alphaconsole.net/) &nbsp;&middot;&nbsp;
> Twitter [@alphaconsole](https://twitter.com/alphaconsole)
