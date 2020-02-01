const { ipcRenderer, remote } = require('electron');
const fs = require('fs');
const path = require('path');
const request = require('request');
const url = require('url');
const $ = require('jquery');


let SyncTeams = true;

let GlobalACConfig = {};

function ToggleSyncTeams() {

  SyncTeams = !SyncTeams;
  if (SyncTeams) {
    $("#button-sync-teams").css("background-color", "");
    $("#button-sync-teams").css("border-color", "");
  } else {
    $("#button-sync-teams").css("background-color", "#f00");
    $("#button-sync-teams").css("border-color", "#f44");
  }

}

function CopyFile(source, target) {
  const rd = fs.createReadStream(source);
  const wr = fs.createWriteStream(target);
  return new Promise((resolve, reject) => {
    rd.on('error', reject);
    wr.on('error', reject);
    wr.on('finish', resolve);
    rd.pipe(wr);
  }).catch(error => {
    rd.destroy();
    wr.end();
    throw error;
  });
}

function LoadFile(dir) {
  return fs.readFileSync(dir);
}

function GetBasePath() {
  return path.join(__dirname, '../../../').replace('app.asar', 'app.asar.unpacked');
}

function LoadItems() {
  const contents = LoadFile(`${GetBasePath()}/items.json`);
  const contents2 = LoadFile(`${GetBasePath()}/slotDictionary.json`);
  const products = JSON.parse(contents);
  const lookup = JSON.parse(contents2);
  products.Lookup = lookup;
  return products;
}

function FileExists(dir) {
  return fs.existsSync(dir);
}


//Todo add a browse for directory thing idk help pls
function DetectInstallLocation() {
  if (FileExists("C:/Program Files (x86)/Steam/steamapps/common/rocketleague/Binaries/Win32/RocketLeague.exe")) {
    document.getElementById("install-location").value =
      "C:/Program Files (x86)/Steam/steamapps/common/rocketleague/Binaries/Win32/";
  }
  else if (FileExists("C:/Program Files/Steam/steamapps/common/rocketleague/Binaries/Win32/RocketLeague.exe")) {
    document.getElementById("install-location").value =
      "C:/Program Files/Steam/steamapps/common/rocketleague/Binaries/Win32/";
  } else {
    //failed, prompt for directory

    //should notify user that we could not detect the rl installation
    dialog.showOpenDialog({
      defaultPath: "C:\\",
      title: "Choose your Rocket League executable",
      filters: [{
        name: 'Executables',
        extensions: ['exe']
      }],
      properties: ['openFile']
    }, (fileName) => {
      if (fileName === undefined) {
        alert("No install location selected");
        $('#status-message').text("Failed to find install location")
        return;
      } else {
        document.getElementById("install-location").value = `${path.dirname(fileName[0])}\\`; //dum slashes
      }
    })
  }
}

function openPage(pageName, elmnt, color) {
  var i, tabcontent, tablinks;

  tabcontent = document.getElementsByClassName("tabcontent");
  for (i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }

  tablinks = document.getElementsByClassName("tablink");
  for (i = 0; i < tablinks.length; i++) {
    tablinks[i].style.backgroundColor = "";
  }

  document.getElementById(pageName).style.display = "block";
  elmnt.style.backgroundColor = color;
}

function PlaceFiles() {
  $('#status-message').text("Applying...")
  if (FileExists(`${document.getElementById("install-location").value}RocketLeague.exe`)) {

    if (!FileExists(`${document.getElementById("install-location").value}/discord-rpc.dll`)) {
      CopyFile(`${GetBasePath()}/discord-rpc.dll`, `${document.getElementById("install-location").value}/discord-rpc.dll`);
    } else {
      var stats = fs.statSync(`${document.getElementById("install-location").value}/discord-rpc.dll`);
      var mtime = new Date(stats.mtime).getTime();
      var stats2 = fs.statSync(`${GetBasePath()}/discord-rpc.dll`);
      var mtime2 = new Date(stats2.mtime).getTime();
      if (mtime2 > mtime) {
        CopyFile(`${GetBasePath()}/discord-rpc.dll`, `${document.getElementById("install-location").value}/discord-rpc.dll`);
      }
    }
    if (!FileExists(`${document.getElementById("install-location").value}/xapofx1_5.dll`)) {
      CopyFile(`${GetBasePath()}/AlphaConsole.dll`, `${document.getElementById("install-location").value}/xapofx1_5.dll`);
    } else {
      var stats = fs.statSync(`${document.getElementById("install-location").value}/xapofx1_5.dll`);
      var mtime = new Date(stats.mtime).getTime();
      var stats2 = fs.statSync(`${GetBasePath()}/AlphaConsole.dll`);
      var mtime2 = new Date(stats2.mtime).getTime();
      if (mtime2 > mtime) {
        CopyFile(`${GetBasePath()}/AlphaConsole.dll`, `${document.getElementById("install-location").value}/xapofx1_5.dll`);
      }
    }

    CopyFile(`${GetBasePath()}/config.json`, `${document.getElementById("install-location").value}/config.json`);

    $('#status-message').text("Applied: Items & Options loaded successfully")
  } else {
    $('#status-message').text("Failed!")
    alert("Rocket League path not set or incorrect! Set it in General settings.");
  }
}

function OpenColorPicker(button) {

}

function LoadConfiguration() {

  const Config = JSON.parse(LoadFile(`${GetBasePath()}/config.json`));

  GlobalACConfig = Config;

  for (const preset in GlobalACConfig.Presets) {
    if (preset != 0) {
      AddPreset(preset, GlobalACConfig.Presets[preset].Name);
    }
  }

  LoadPreset(Config.Preset);

  $("#preset-select").val(Config.Preset);

  //Custom color options

  $("#color-all-cars").prop("checked", Config.CustomColors.ColorAllCars);

  $("#field-color-blue").val(Config.CustomColors.FieldBlue);
  $("#field-color-orange").val(Config.CustomColors.FieldOrange);
  $("#enable-field-color").prop('checked', Config.CustomColors.EnableFieldColors);

  //Custom title options
  $("#enable-custom-titles").prop('checked', Config.CustomTitles.EnableCustomTitles);
  $("#enable-custom-banners").prop('checked', Config.CustomTitles.EnableCustomBanners);
  $("#title-flash-rate").val(Config.CustomTitles.TitleFlashRate);

  //Custom rank options
  $("#display-mmr").prop('checked', Config.RankOptions.DisplayMMR);
  $("#enable-unranked-mmr").prop('checked', Config.RankOptions.UnrankedMMR);
  $("#display-teamTotal").prop('checked',  Config.RankOptions.TeamTotal);
  $("#display-teamMMR").prop('checked', Config.RankOptions.DisplayTeamMMR);
  $("#upload-match-data").prop('checked', Config.RankOptions.UploadMatchData);
  $("#april-fools").prop('checked', Config.RankOptions.AprilFools || 0);
  $("#display-total-mmr-change").prop('checked', Config.RankOptions.DisplayTotalMMRChange || true);

  //Discord rich presence options
  $(`[name='discord'][value=${Config.DiscordOptions.RichPresenceLevel}]`).prop("checked", true);

  //Trade Options
  $("#trade-save-log").prop('checked', Config.TradeOptions ? Config.TradeOptions.SaveLog : true)
  $("#trade-enable-modal").prop('checked', Config.TradeOptions ? Config.TradeOptions.ShowModal : true)
  $("#trade-enable-popups").prop('checked', Config.TradeOptions ? Config.TradeOptions.ShowPopups : true)
  if (Config.TradeOptions && Config.TradeOptions.LogLocation && Config.TradeOptions.LogLocation.length > 3) {

    $("#trade-log-location").css("display", "none");
    $("#trade-log-location-template").css("display", "block");
    $("#trade-log-location-text").prop("value", Config.TradeOptions.LogLocation);
  }

  //General options
  $("#ac-enabled").prop('checked', Config.GeneralOptions.Enabled);
  $("#broadcast-enabled").prop('checked', Config.GeneralOptions.EventBroadcast);
  $("#minimize-to-tray").prop('checked', Config.GeneralOptions.MinimizeToTray);
  $("#run-on-startup").prop('checked', Config.GeneralOptions.RunOnStartup);
  $("#install-location").val(Config.GeneralOptions.InstallLocation);
  $("#f5-menu").prop('checked', Config.GeneralOptions.F5Menu);
  $("#default-menu").prop('checked', Config.GeneralOptions.UseDefaultMenu);

  $("#always-on-top").prop('checked', Config.AlwaysOnTop);
  
  if (!Config.GeneralOptions.SyncTeams) {
    ToggleSyncTeams();
  }

  request("https://api.github.com/repos/AlphaConsole/AlphaConsoleElectron/releases", {
    headers: {
      "User-Agent": "AlphaConsole"
    }
  }, (err, result, body) => {
    let data = JSON.parse(body);
    data = [data[0], data[1], data[2]];
    let text = data.map(t => {
      let temp = `<h3>Update ${t.tag_name}</h3><p>${t.body.replace(/-/g, "<br/>-")}</p>`;
      temp = temp.replace("</h3><p><br/>", "</h3><p>");

      return temp;
    }).join("<br/>");

    $("#changelogsInfo").html(text);
    if (!Config.LastVersion || Config.LastVersion !== remote.app.getVersion()) {
      let lastVersion = data[0];
      let changelogs = `<h3>${lastVersion.tag_name}</h3><p>${lastVersion.body.replace(/-/g, "<br/>-")}</p>`;
      changelogs = changelogs.replace("</h3><p><br/>", "</h3><p>");

      $("#promptTitle").html("New Update Installed");
      $("#promptContent").html(changelogs);
      $("#prompt").css("display", "block");

      Config.LastVersion = remote.app.getVersion();
      fs.writeFileSync(`${GetBasePath()}/config.json`, JSON.stringify(Config, null, "\t"), 'utf-8');
    }
  })

}

function AddPreset(ID, Name) {

  const newOp = $('<option>');
  newOp.attr('value', ID);
  newOp.text(Name);

  $("#preset-select").append(newOp);
  
}

function AddNewPreset() {

  SavePreset($("#preset-select").val());

  const id = Math.floor(Math.random() * 100000); //lazy
  AddPreset(id, "New preset");
  $("#preset-name").prop('readonly', false);
  $("#preset-name").val("New preset");
  $("#preset-select").val(id);
  SavePreset(id);

}


function DeletePreset() {

  if ($("#preset-select").val() == 0) {
    return;
  }

  delete GlobalACConfig.Presets[$("#preset-select").val()];
  $(`#preset-select option[value=${$("#preset-select").val()}]`).remove();

  $("#preset-select").val(0);
  LoadPreset(0);

}

function SavePreset(PresetID) {

  const Products = LoadItems();
  const colors = Products.Colors;
  const slots = Products.Slots;

  //Custom item options
  const Items = {};
  for (let i = 0; i < slots.length; i++) {
    if (slots[i] != null) {

      const slotID = slots[i].SlotID;

      Items[slotID] = {};
      Items[slotID].SlotName = slots[i].Name;

      if (slots[i].Name == "Body") {
        $("select[name='color-select'][special='body']").each((index, value) => {
          const team = $(value).closest('tbody').attr("team");
          const customSelection = $(value).parent().prev().children().val();
          Items[slotID][team] = {};
          Items[slotID][team].ItemID = customSelection[0];
          Items[slotID][team].PackageID = customSelection[1];
          Items[slotID][team].PackageSubID = customSelection[2];
          Items[slotID][team].SpecialEdition = -1;
          Items[slotID][team].TeamEdition = -1;
          Items[slotID][team].Color = parseInt($(value).val()) || -1;
        });
      }

      const selects = $(`select[name="${Products.Lookup[slots[i].Name]}"]`);
      for (let j = 0; j < selects.length; j++) {

        const team = $(selects[j]).closest('tbody').attr("team");

        Items[slotID][team] = {};
        if ($(selects[j]).val()) {
          var iid = $(selects[j]).val().split(":");

          Items[slotID][team].ItemID = parseInt(iid[0]);
          Items[slotID][team].PackageID = parseInt(iid[1]);
          Items[slotID][team].PackageSubID = parseInt(iid[2]);
        } else {

          Items[slotID][team].ItemID = -1;
          Items[slotID][team].PackageID = -1;
          Items[slotID][team].PackageSubID = -1;
        }

        // Get the current item if it has a special edition change
        const items = Products.Slots[i].Items.filter(({ItemID}) => ItemID === parseInt(iid[0]));

        // Color ID 0 is falsy, so use isNaN check
        const parsedColor = parseInt($(selects[j]).parent().next("td").find("select").val(), 10);
        Items[slotID][team].Color = isNaN(parsedColor) ? -1 : parsedColor;
        Items[slotID][team].TeamEdition = parseInt($(selects[j]).parent().next("td").next("td").find("select").val()) || -1;
        Items[slotID][team].SpecialEdition = items.length > 0 && items[0].HasSpecialEditions === "true" ? items[0].AvailableSpecialEditions[0] : -1;
      }
    }
  }

  //custom colors in presets
  const CustomColors = {};
  CustomColors.Blue = {};
  CustomColors.Orange = {};
  CustomColors.Blue.PrimaryColor = $("#primary-color-blue").val();
  CustomColors.Blue.AccentColor = $("#accent-color-blue").val();
  CustomColors.Orange.PrimaryColor = $("#primary-color-orange").val();
  CustomColors.Orange.AccentColor = $("#accent-color-orange").val();
  CustomColors.Blue.PrimaryIntensity = parseFloat($("#primary-intensity-blue").val());
  CustomColors.Blue.AccentIntensity = parseFloat($("#accent-intensity-blue").val());
  CustomColors.Orange.PrimaryIntensity = parseFloat($("#primary-intensity-orange").val());
  CustomColors.Orange.AccentIntensity = parseFloat($("#accent-intensity-orange").val());
  CustomColors.Blue.Enabled = $("#custom-color-enabled-blue").prop('checked');
  CustomColors.Orange.Enabled = $("#custom-color-enabled-orange").prop('checked');


  if (GlobalACConfig.Presets === undefined) {
    GlobalACConfig.Presets = {};
  }

  GlobalACConfig.Presets[PresetID] = {};
  GlobalACConfig.Presets[PresetID].Items = Items;

  GlobalACConfig.Presets[PresetID].CustomColors = CustomColors;

  if (PresetID == 0) {
    GlobalACConfig.Presets[PresetID].Name = "Default";
  } else {
    GlobalACConfig.Presets[PresetID].Name = $("#preset-name").val();
  }

}

function LoadPreset(ID) {

  const OldSync = SyncTeams;
  SyncTeams = false;
  $("#preset-name").val(GlobalACConfig.Presets[ID].Name);

  if (ID == 0) {
    $("#preset-name").prop('readonly', true);
  } else {
    $("#preset-name").prop('readonly', false);
  }

  const Products = LoadItems();

  const colors = Products.Colors;
  const slots = Products.Slots;

  //Custom item options
  for (let i = 0; i < slots.length; i++) {
    if (slots[i] != null) {

      if (slots[i].Name == "Body") {
        $("select[name='color-select']").each((index, value) => {
          const team = $(value).closest('tbody').attr("team");
          $(`tbody[team='${team}']`).find("select[name='color-select'][special='body']")
            .val(GlobalACConfig.Presets[ID].Items[slots[i].SlotID][team].Color);
        });
      }

      const selects = $(`select[name="${Products.Lookup[slots[i].Name]}"]`);
      for (let j = 0; j < selects.length; j++) {
        const team = $(selects[j]).closest('tbody').attr("team");
        const valString = `${GlobalACConfig.Presets[ID].Items[slots[i].SlotID][team].ItemID}:${GlobalACConfig.Presets[ID].Items[slots[i].SlotID][team].PackageID}:${GlobalACConfig.Presets[ID].Items[slots[i].SlotID][team].PackageSubID}`;
        $(selects[j]).val(valString).change();
        $(selects[j]).parent().next("td").find("select").val(GlobalACConfig.Presets[ID].Items[slots[i].SlotID][team].Color);

        const teamEdition = GlobalACConfig.Presets[ID].Items[slots[i].SlotID][team].TeamEdition;
        $(selects[j]).parent().next("td").next("td").find("select").val(!!teamEdition ? teamEdition : -1);
		$(selects[j]).parent().parent().find("input").prop('checked', GlobalACConfig.Presets[ID].Items[slots[i].SlotID][team].SpecialEdition == -1 ? false : true);
		
      }
    }
  }


  //custom color options
  $("#primary-color-blue").val(GlobalACConfig.Presets[ID].CustomColors.Blue.PrimaryColor);
  $("#accent-color-blue").val(GlobalACConfig.Presets[ID].CustomColors.Blue.AccentColor);
  $("#primary-color-orange").val(GlobalACConfig.Presets[ID].CustomColors.Orange.PrimaryColor);
  $("#accent-color-orange").val(GlobalACConfig.Presets[ID].CustomColors.Orange.AccentColor);
  $("#primary-intensity-blue").val(GlobalACConfig.Presets[ID].CustomColors.Blue.PrimaryIntensity);
  $("#accent-intensity-blue").val(GlobalACConfig.Presets[ID].CustomColors.Blue.AccentIntensity);
  $("#primary-intensity-orange").val(GlobalACConfig.Presets[ID].CustomColors.Orange.PrimaryIntensity);
  $("#accent-intensity-orange").val(GlobalACConfig.Presets[ID].CustomColors.Orange.AccentIntensity);
  $("#custom-color-enabled-blue").prop('checked', GlobalACConfig.Presets[ID].CustomColors.Blue.Enabled);
  $("#custom-color-enabled-orange").prop('checked', GlobalACConfig.Presets[ID].CustomColors.Orange.Enabled);


  
  $("#alpha-color-blue").val(GlobalACConfig.Presets[ID].CustomColors.BlueAlpha || "#000000");
  $("#alpha-color-orange").val(GlobalACConfig.Presets[ID].CustomColors.OrangeAlpha || "#000000");
  
  $("#alpha-enabled-blue").prop('checked', GlobalACConfig.Presets[ID].CustomColors.BlueAlphaEnabled || false);
  $("#alpha-enabled-orange").prop('checked', GlobalACConfig.Presets[ID].CustomColors.OrangeAlphaEnabled || false);
  
  SyncTeams = OldSync;

}


function GetConfigurationString() {

  const Config = {};

  Config.Preset = $("#preset-select").val();
  SavePreset(Config.Preset);

  Config.Items = GlobalACConfig.Presets[Config.Preset].Items;
  Config.Presets = GlobalACConfig.Presets;

  //Custom color options
  const CustomColors = GlobalACConfig.Presets[Config.Preset].CustomColors;
  CustomColors.ColorAllCars = $("#color-all-cars").prop('checked');

  Config.CustomColors = CustomColors;
  
  Config.CustomColors.FieldBlue = $("#field-color-blue").val();
  Config.CustomColors.FieldOrange = $("#field-color-orange").val();
  
  Config.CustomColors.EnableFieldColors = $("#enable-field-color").prop('checked');

  Config.CustomColors.BlueAlphaEnabled = $("#alpha-enabled-blue").prop('checked');
  Config.CustomColors.OrangeAlphaEnabled = $("#alpha-enabled-orange").prop('checked');

  Config.CustomColors.BlueAlpha = $("#alpha-color-blue").val();
  Config.CustomColors.OrangeAlpha = $("#alpha-color-orange").val();

  //Custom title options
  const CustomTitles = {};
  CustomTitles.EnableCustomTitles = $("#enable-custom-titles").prop('checked'); 
  CustomTitles.EnableCustomBanners = $("#enable-custom-banners").prop('checked'); 
  CustomTitles.TitleFlashRate = parseFloat($("#title-flash-rate").val());
  Config.CustomTitles = CustomTitles;


  //Custom rank options
  const RankOptions = {};
  RankOptions.DisplayMMR = $("#display-mmr").prop('checked');
  RankOptions.UnrankedMMR = $("#enable-unranked-mmr").prop('checked');
  RankOptions.UploadMatchData = $("#upload-match-data").prop('checked');
  RankOptions.TeamTotal = $("#display-teamTotal").prop('checked');
  RankOptions.DisplayTeamMMR = $("#display-teamMMR").prop('checked');
  RankOptions.AprilFools = $("#april-fools").prop('checked');
  RankOptions.DisplayTotalMMRChange = $("#display-total-mmr-change").prop('checked');
  Config.RankOptions = RankOptions;

  //Discord rich presence options
  const DiscordOptions = {};
  DiscordOptions.RichPresenceLevel = parseInt($("[name='discord']:checked").val());
  Config.DiscordOptions = DiscordOptions;

  //Trading options
  const TradeOptions = {};
  TradeOptions.SaveLog = $("#trade-save-log").prop('checked');
  TradeOptions.LogLocation = $("#trade-log-location-text").val().length > 3 ? $("#trade-log-location-text").val() : "trades.log";
  TradeOptions.ShowModal = $("#trade-enable-modal").prop('checked');
  TradeOptions.ShowPopups = $("#trade-enable-popups").prop('checked');
  Config.TradeOptions = TradeOptions;

  //General options
  const GeneralOptions = {};
  GeneralOptions.Enabled = $("#ac-enabled").prop('checked');
  GeneralOptions.MinimizeToTray = $("#minimize-to-tray").prop('checked');
  GeneralOptions.RunOnStartup = $("#run-on-startup").prop('checked');
  GeneralOptions.InstallLocation = $("#install-location").val();
  GeneralOptions.EventBroadcast = $("#broadcast-enabled").prop('checked');
  GeneralOptions.F5Menu = $("#f5-menu").prop('checked');
  GeneralOptions.UseDefaultMenu = $("#default-menu").prop('checked');
  GeneralOptions.SyncTeams = SyncTeams;
  Config.GeneralOptions = GeneralOptions;

  Config.LastVersion = remote.app.getVersion();
  Config.AlwaysOnTop = $("#always-on-top").prop('checked');

  //Miscellaneous
  Config.ACPath = GetBasePath();

  return JSON.stringify(Config, null, "\t");
}

function SaveConfiguration() {

  try {
    $('#status-message').text("Applying...")
    fs.writeFileSync(`${GetBasePath()}/config.json`, GetConfigurationString(), 'utf-8');
    $('#status-message').text("Applied: Items & Options loaded successfully!");
    //Add a copy to Win32 so that you can load prefs from local one? idk
    //PlaceFiles();
  } catch (e) {
    $('#status-message').text("Failed!")
    alert(e);
    alert('Failed to save the configuration!');

  }

}


function ShowTexturesRepo() {
  const BrowserWindow = remote.BrowserWindow;

  const win =
    new BrowserWindow({
      titleBarStyle: 'hidden',
      resizable: true,
      frame: false,
      minWidth: 720,
      maxWidth: 720,
      width: 720,
      height: 930,
      webPreferences: {
        nodeIntegration: true,
        devTools: true,
      },
      icon: path.join(__dirname, '/assets/img/logo_normal.png')
    });

  win.loadURL(
    url.format(
      {
        pathname: path.join(__dirname, '../../texture-repo.html'),
        protocol: 'file:',
        slashes: true
      }
    ));

}

function GetTexturePackagePaths() {
  const walkSync = (dir, filelist) => {
    // Check if textures folder exist. If it doesn't exist return empty array. You could potentially create a textures folder now and return empty array.
    if (!fs.existsSync(dir)) return [];

    files = fs.readdirSync(dir);

    filelist = filelist || [];
    files.forEach(file => {
      if (fs.statSync(dir + file).isDirectory()) {
        filelist = walkSync(`${dir + file}/`, filelist);
      } else {
        if (file == 'package.json')
          filelist.push(dir + file);
      }
    });
    return filelist;
  };

  return walkSync(`${GetBasePath()}/textures/`, []);
}

function GetTexturePackages() {
  const paths = GetTexturePackagePaths();
  const tps = [];
  const packs = {};
  packs.packages = [];

  for (let i = 0; i < paths.length; i++) {

    const tp = {};
    tp.Path = paths[i];
    tp.Package = JSON.parse(LoadFile(paths[i]));
    packs.packages[i] = {};
    packs.packages[i].id = tp.Package.id;
    packs.packages[i].name = tp.Package.name;
    packs.packages[i].folder = path.dirname(paths[i].substring((`${GetBasePath()}/textures/`).length));
    packs.packages[i].author = tp.Package.author;
    packs.packages[i].description = tp.Package.description;

    tps.push(tp);

  }

  SaveMasterPackages(packs);

  return tps;
}

function SaveMasterPackages(packages) {
  try {
    //fs.mkdir(`${GetBasePath()}/textures/`);
    fs.mkdirSync(`${GetBasePath()}/textures/`, { recursive: true })
    fs.writeFileSync(`${GetBasePath()}/textures/packages.json`, JSON.stringify(packages, null, "\t"), 'utf-8');
  } catch (e) {
    alert(e);
    alert('Failed to save the packages!');
  }
}

// function for dynamic sorting
function compareValues(key, order = 'asc') {
  return (a, b) => {
    if (!a.hasOwnProperty(key) || !b.hasOwnProperty(key)) {
      // property doesn't exist on either object
      return 0;
    }

    const varA = (typeof a[key] === 'string') ?
      a[key].toUpperCase() : a[key];
    const varB = (typeof b[key] === 'string') ?
      b[key].toUpperCase() : b[key];

    let comparison = 0;
    if (varA > varB) {
      comparison = 1;
    } else if (varA < varB) {
      comparison = -1;
    }
    return (
      (order == 'desc') ? (comparison * -1) : comparison
    );
  };
}


const Products = LoadItems();
const TexturePackages = GetTexturePackages();

const colors = Products.Colors;
colors.sort(compareValues('Name'));
$("select[name='color-select']").each(function (index, value) {

  for (let i = 0; i < colors.length; i++) {

    const newOp = $('<option>');
    newOp.attr('value', colors[i].ID);
    newOp.text(colors[i].Name);

    $(this).append(newOp);
  }

});

const teams = Products.TeamEditions;
teams.sort(compareValues('Name'));
$("select[name='team-select']").each(function (index, value) {

  for (let i = 0; i < teams.length; i++) {

    const newOp = $('<option>');
    newOp.attr('value', teams[i].ID);
    newOp.text(teams[i].Name);

    $(this).append(newOp);
  }

});

const slots = Products.Slots;
const customItems = {};

for (var j = 0; j < TexturePackages.length; j++) {
  
  var customitems = TexturePackages[j].Package.items;
  customitems.sort(compareValues(name));
  for (var k = 0; k < customitems.length; k++) {
    const v = slots.findIndex(({SlotID}) => SlotID==customitems[k].slot);
    if(v > -1){
      if(!slots[v].customItems) slots[v].customItems = []
      customitems[k].packageid = TexturePackages[j].Package.id;
      slots[v].customItems.push(customitems[k]); 
    }    
  }
}

for (let i = 0; i < slots.length; i++) {

  if (slots[i] != null) {

    const items = slots[i].Items;
    items.sort(compareValues('Name'));

    const itemSpecialEditions = {};
    for (const item of items) {
      if (item.HasSpecialEditions === "true") {
        const editions = Products.SpecialEditions.filter(({ID}) => item.AvailableSpecialEditions.includes(ID));
        const editionName = editions[0].Name;
        itemSpecialEditions[item.Name] = editionName;
      }
    }


    if (slots[i].Name !== "Body") {
      //VANILLA ITEMS
      for (var j = 0; j < items.length; j++) {
        //Will .each fuck this up because of async?
        $(`select[name="${Products.Lookup[slots[i].Name]}"]`).each(function (index, value) {
          const newOp = $('<option>');
          newOp.attr('value', `${items[j].ItemID}:${-1}:${-1}`);
          newOp.attr('paintable', items[j].Paintable);
          newOp.attr('hasSpecialEditions', items[j].HasSpecialEditions);
          newOp.attr('hasTeamEditions', items[j].HasTeamEditions);

          let itemName = items[j].Name;

          // Parse Special Edition
          if (items[j].HasSpecialEditions === "false" && !!itemSpecialEditions[items[j].Name]) {
            itemName += `: ${itemSpecialEditions[items[j].Name]}`;
          }

          // Parse Team Edition
          if (items[j].HasTeamEditions === "true") {
            itemName += ': Team Edition';
          }

          newOp.text(itemName);
          $(this).append(newOp);

        });
      }
    }

    //CUSTOM ITEMS
    if(slots[i].customItems){
      var customitems = slots[i].customItems;
      
      customitems.sort(compareValues('name'));
      $(`select[name="${Products.Lookup[slots[i].Name]}"]`).each(function (index, value) {
        const newOp = $('<option>');
        newOp.attr('value', '-2:-2:-2');
        newOp.text("-----------------------------------------------------------------");   
        newOp.attr("disabled", "disabled");      
        if (slots[i].Name !== "Body") $(this).children(":first").after(newOp);
      });
     
      for (var k = customitems.length-1; k >=0; k--) {         

        $(`select[name="${Products.Lookup[slots[i].Name]}"]`).each(function (index, value) {
          const newOp = $('<option>');
          newOp.attr('value', `${customitems[k].item}:${customitems[k].packageid}:${customitems[k].id}`);
          newOp.html(customitems[k].name);            
          $(this).children(":first").after(newOp);  
        });
    
      }
      
      $(`select[name="${Products.Lookup[slots[i].Name]}"]`).each(function (index, value) {
        const newOp = $('<option>');
        newOp.attr('value', '-2:-2:-2');
        newOp.text("Custom");   
        newOp.attr("disabled", "disabled");      
        if (slots[i].Name !== "Body") $(this).children(":first").after(newOp);
      });
      
    }
  }
}



//Keep ball slots the same
$("select[name='ball-select']").on('change', function () {
  $("select[name='ball-select']").val(this.value);
});

$("select[name='color-select']").on('change', function () {
  if (SyncTeams) {

    const selects = $("select[name='color-select']");
    for (let k = 0; k < selects.length; k++) {

      if ($(selects[k]).parent().parent().index() == $(this).parent().parent().index()) {
        $(selects[k]).val(this.value);
      }
    }
  }
});
$("select[name='team-select']").on('change', function () {
  if (SyncTeams) {

    const selects = $("select[name='team-select']");
    for (let k = 0; k < selects.length; k++) {

      if ($(selects[k]).parent().parent().index() == $(this).parent().parent().index()) {
        $(selects[k]).val(this.value);
      }
    }
  }
});
$("input[name='special-wheel-input']").on('change', function () {  
  if (SyncTeams) {
    const selects = $("input[name='special-wheel-input']");
    for (let k = 0; k < selects.length; k++) {
        
		$(selects[k]).prop('checked', $(this).prop('checked'));      
    }
	}
});


$("[class='row teams'] select").on('change', function () {
  let disableOtherPaintable = false;
  if($(this).find("option:selected").attr("Paintable") == "false"){    
	disableOtherPaintable = true;
    $(this).parent().next().find("select").prop('disabled', 'disabled');
    $(this).parent().next().find("select").css("color", "#555");
  } else {
    $(this).parent().next().find("select").prop('disabled', false);
    $(this).parent().next().find("select").css("color", "#fff");
  }

  let disableOtherSpecial = false;
  if($(this).find("option:selected").attr("HasSpecialEditions") == "false"){
    disableOtherSpecial = true;
    $(this).parent().parent().find("input").prop('disabled', 'disabled');
    $(this).parent().parent().find("input").parent().find("span").css("background-color", "#3D3D3D");
  } else {
    $(this).parent().parent().find("input").prop('disabled', false);
    $(this).parent().parent().find("input").parent().find("span").css("background-color", "#616161");
  }

  let disableOtherTeam = false;
  if($(this).find("option:selected").attr("HasTeamEditions") == "false"){
    disableOtherTeam = true;
    $(this).parent().next().next().find("select").prop('disabled', 'disabled');
    $(this).parent().next().next().find("select").css("color", "#555");
  } else {
    $(this).parent().next().next().find("select").prop('disabled', false);
    $(this).parent().next().next().find("select").css("color", "#fff");
  }
  if (SyncTeams) {

    const selects = $("[class='row teams'] select");

    for (let k = 0; k < selects.length; k++) {

      if ($(selects[k]).parent().parent().index() == $(this).parent().parent().index()
        && $(this).parent().index() == 1 && $(selects[k]).parent().index() == 1) {
        $(selects[k]).val(this.value);

        if(disableOtherPaintable){
          $(selects[k]).parent().next().find("select").prop('disabled', 'disabled');
          $(selects[k]).parent().next().find("select").css("color", "#555");
        } else {
          $(selects[k]).parent().next().find("select").prop('disabled', false);
          $(selects[k]).parent().next().find("select").css("color", "#fff");
        }
        if(disableOtherSpecial){
          $(selects[k]).parent().parent().find("input").prop('disabled', 'disabled');
          $(selects[k]).parent().parent().find("input").parent().find("span").css("background-color", "#3D3D3D");
        } else {
          $(selects[k]).parent().parent().find("input").prop('disabled', false);
          $(selects[k]).parent().parent().find("input").parent().find("span").css("background-color", "#616161");
        }
        if(disableOtherTeam){
          $(selects[k]).parent().next().next().find("select").prop('disabled', 'disabled');
          $(selects[k]).parent().next().next().find("select").css("color", "#555");
        } else {
          $(selects[k]).parent().next().next().find("select").prop('disabled', false);
          $(selects[k]).parent().next().next().find("select").css("color", "#fff");
        }
      }
    }
        
  }
});


let previousPresetID;

$("#preset-select").focus(function () {
  previousPresetID = this.value;
});


$("#preset-select").change(function () {
  SavePreset(previousPresetID);
  LoadPreset(this.value);
  SaveConfiguration();
  previousPresetID = this.value;
});

  
$("#always-on-top").change(function () {
  ipcRenderer.send('alwaystop', $(this).prop('checked'));  
});

$("#button-check-for-updates").on("click", () => {
  ipcRenderer.send("check-for-updates");  
});


$("#preset-name").on("input", function () {
  $(`#preset-select option[value=${$("#preset-select").val()}]`).text(this.value);
});


document.addEventListener('DOMContentLoaded', () => {
  ipcRenderer.on("check-for-updates-response-none", () => {
    $("#button-check-for-updates").text("No Updates!");
    setTimeout(() => {
      $("#button-check-for-updates").text("Update!");
    }, 2000);
  });

  // Open blue by default
  openPage('blueteamitems', document.getElementById('defaultOpen'), '#5698EB');
  
  ipcRenderer.on("check-for-updates-response-download", (event, downloadPercentage) => {
    $("#button-check-for-updates").text(`${downloadPercentage} downloaded`);
  });

  ipcRenderer.on("check-for-updates-response-downloaded", () => {
    $("#button-check-for-updates").text(`Installing...`);
  });
  
  ipcRenderer.on("check-for-updates-response-checking", () => {
    $("#button-check-for-updates").text("Searching...");
  });
  
  $(".teams .item-table tr td:nth-child(2) .acc-input").after("<span class='reset-input'> ✗</span>");
  $('.reset-input').on('click', function () {    
    if(SyncTeams) {
      $(`select[name=${$(this).parent().find('select').attr('name')}] option:contains('Unchanged')`).prop('selected', true);
    }
    else {
      $(this).parent().find('select option:contains("Unchanged")').prop('selected', true);
    }
  })
  $('#button-reset-all').on('click', () => {        
      $(".teams select option:contains('Unchanged')").prop('selected', true);
      $(".teams select").prop('disabled', false).css("color", "#fff");
      $("#custom-color-enabled-blue").prop('checked', false);
      $("#custom-color-enabled-orange").prop('checked', false);      
      $("#primary-color-blue").val("#000000");
      $("#primary-intensity-blue").val(1);
      $("#accent-color-blue").val("#000000");
      $("#accent-intensity-blue").val(1);
      $("#primary-color-orange").val("#000000");
      $("#primary-intensity-orange").val(1);
      $("#accent-color-orange").val("#000000");
      $("#accent-intensity-orange").val(1);     
      $("#special-wheel-blue").prop('checked', false);
      $("#special-wheel-orange").prop('checked', false);      
  })
  
  $(".build-number").html(`Version ${remote.app.getVersion()}`);
   ipcRenderer.send('alwaystop', $("#always-on-top").prop('checked')); 

  document.getElementById('add-preset').addEventListener('click', () => {
    AddNewPreset();
  });

  document.getElementById('delete-preset').addEventListener('click', () => {
    DeletePreset();
  });

  document.getElementById('button-sync-teams').addEventListener('click', () => {
    ToggleSyncTeams();
  });

  document.getElementById('defaultOpen').addEventListener('click', ({target}) => {
    openPage('blueteamitems', target, '#5698EB');
  });

  document.getElementById('orange-team').addEventListener('click', ({target}) => {
    openPage('orangeteamitems', target, '#D09B4F');
  });

  document.getElementById('detectInstall').addEventListener('click', () => {
    DetectInstallLocation();
  });
  
  document.getElementById('save-apply').addEventListener('click', () => {
    SaveConfiguration();
  });
  
  document.getElementById('get-textures').addEventListener('click', () => {
    ShowTexturesRepo();
  });
  
  LoadConfiguration();
});
