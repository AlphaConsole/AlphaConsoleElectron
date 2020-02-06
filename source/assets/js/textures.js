const {shell, remote, BrowserWindow, ipcRenderer} = require('electron');
const notifier = require('node-notifier');
const request = require('request');
const path = require('path');
const fs = require('fs');
const $ = require('jquery');

const init = () => {
  const win = remote.BrowserWindow.getFocusedWindow();

  // Minimize task
  document.getElementById('min-btn').addEventListener('click', () => {
	win.minimize();
  });

  // Maximize window
  document.getElementById('max-btn').addEventListener('click', () => {
	if (win.isMaximized()) {
	  win.unmaximize();
	} else {
	  win.maximize();
	}
  });

  // Close app
  document.getElementById('close-btn').addEventListener('click', () => {
	win.close();
  });

  const detectInstall = document.getElementById('detectInstall');
  if (detectInstall) {
    detectInstall.addEventListener('click', () => {
      // code here
    });
  }
};

function GetBasePath() {
  return path.join(__dirname, '../../../').replace('app.asar', 'app.asar.unpacked');
}

let SelectedPackage;
const Details = [];

let AllPackages;
let PageNumber = 1;
const PackagesPerPage = 9;
let NumberOfPages = 1;

packagesBeingDownloaded = {};
function fisnihedDownload(packagedID, filename) {
  let file;
  packagesBeingDownloaded[packagedID]['files'][filename]['done'] = true;
  for (file in packagesBeingDownloaded[packagedID]['files']) {
	if (!packagesBeingDownloaded[packagedID]['files'][file]['done']) {
	  return;
	}
  }

  let file2;
  const dir = `${GetBasePath()}/textures/${packagesBeingDownloaded[packagedID]['dir']}/`;
  for (file2 in packagesBeingDownloaded[packagedID]['files']) {
	ensureDirectoryExistence(dir + file2);
	fs.rename(`${dir}tmp_${file2}`, dir + file2, err => {
	  if (err) {
		return console.log(err);
	  }
	  ipcRenderer.send('refreshwindow');
	});
  }

}

function ensureDirectoryExistence(filePath) {
  const dirname = path.dirname(filePath);
  if (fs.existsSync(dirname)) {
	return true;
  }
  ensureDirectoryExistence(dirname);
  fs.mkdirSync(dirname);
}

function DownloadSingleImage(basedir, url, imageName, index, Progress) {
  ensureDirectoryExistence(`${basedir}tmp_${imageName}`);

  packagesBeingDownloaded[index]['files'][imageName] = {}
  packagesBeingDownloaded[index]['files'][imageName]['done'] = false;

  const progressBar = document.querySelector('.progress-bar');
  request(url).on('response', ({headers}) => {
	const len = parseInt(headers['content-length'], 10);
	Progress.total += len;
  }).on('data', ({length}) => {
	Progress.cur += length;
	// compressed data as it is received
	const progress = (100.0 * Progress.cur / Progress.total).toFixed(0);
	progressBar.style.width = `${progress}%`;
	progressBar.innerText = `${progress}%`;
  }).pipe(fs.createWriteStream(`${basedir}tmp_${imageName}`).on('finish', () => {
	fisnihedDownload(index, imageName);
  }));
}

//const baseurl = 'https://raw.githubusercontent.com/AlphaConsole/AlphaConsoleTextures/dev/textures/';
const baseurl = 'http://alphaconsole.net/cdn/';
//TODO: Make sure package is downloaded before allowing closing the window.
//TODO: Don't allow package redownloading.. Maybe add remove package button and only allow download if package doesn't exist
function DownloadPackage() {
  if (SelectedPackage === undefined) {
    return;
  }

  const index = SelectedPackage.attr('details-index');
  packagesBeingDownloaded[index] = {}
  packagesBeingDownloaded[index]['dir'] = Details[index].folder
  packagesBeingDownloaded[index]['files'] = {}

  request(`${baseurl + Details[index].folder}/package.json?${Math.random()}`, { json: true }, (err, res, {items}) => {
	if (err) {
	  return console.log(err);
	}

	//All so i can pass by reference, i hate js
	const Progress = {};
	Progress.total = 0;
	Progress.cur = 0;

	const basedir = `${GetBasePath()}/textures/${Details[index].folder}/`;
	for (let item of items) {
	  let url;
	  let imageName;
	  let imageIndex;

	  if (item.parameters != undefined) {
		for (let image of item.parameters) {
		  if (image.animated != undefined && image.animated == true) {
			for (imageIndex = 0; imageIndex < image.frames; imageIndex++) {
			  imageName = `${image.image + imageIndex}.png`;
			  url = `${baseurl + Details[index].folder}/${imageName}`;
			  DownloadSingleImage(basedir, url, imageName, index, Progress);
			}
		  } else {
			url = `${baseurl + Details[index].folder}/${image.image}`;
			DownloadSingleImage(basedir, url, image.image, index, Progress);
		  }
		}
	  }

	  if (item.textures != undefined) {
		for (let image of item.textures) {
		  if (image.animated != undefined && image.animated == true) {
			for (imageIndex = 0; imageIndex < image.frames; imageIndex++) {
			  imageName = `${image.image + imageIndex}.png`;
			  url = `${baseurl + Details[index].folder}/${imageName}`;
			  DownloadSingleImage(basedir, url, imageName, index, Progress);
			}
		  } else {
			url = `${baseurl + Details[index].folder}/${image.image}`;
			DownloadSingleImage(basedir, url, image.image, index, Progress);
		  }
		}
	  }
	}

	url = `${baseurl + Details[index].folder}/package.json?${Math.random()}`;
	packagesBeingDownloaded[index]['files']['package.json'] = {}
	packagesBeingDownloaded[index]['files']['package.json']['done'] = false
	ensureDirectoryExistence(`${basedir}tmp_package.json`);

	const progressBar = document.querySelector('.progress-bar');
	request(url).on('response', ({headers}) => {
	  const len = parseInt(headers['content-length'], 10);
	  Progress.total += len;

	}).on('data', ({length}) => {
	  Progress.cur += length;
	  // compressed data as it is received
	  const progress = (100.0 * Progress.cur / Progress.total).toFixed(0);
	  progressBar.style.width = `${progress}%`;
	  progressBar.innerText = `${progress}%`;
	}).pipe(fs.createWriteStream(`${basedir}tmp_package.json`).on('finish', () => {
	  fisnihedDownload(index, 'package.json');
	}))
  });
}





function PopulateTexturePackList(packageList) { // packageList is a slice of body.packages from RequestPackages

  $("#texture-pack-list").empty();

  let i = 0;
  for (let item of packageList) {

	Details[i] = item;

	const newPack = $('<div>');
	newPack.addClass("square");
	newPack.css("background", `url(${baseurl}${item.folder}/preview.${item.previewExtension == null ? "png" : item.previewExtension}) no-repeat center center`);
	newPack.css("background-size", "100% 100%");
	newPack.attr("details-row", Math.floor(i / 3));
	newPack.attr("details-index", i);
	const j = i;
	const para = $("<p>");
	para.addClass("bg-black author font-bourgM");
	para.text(`by ${item.author}`);

	const para2 = $("<p>");
	para2.addClass("bg-black pack-title font-bourgM");
	para2.text(item.name);

	const likeDiv = $("<div>");
	const likeLink = $("<a>");
	likeLink.addClass("like-status");
	const likeImage = $('<i style="font-size:20px; color:#f5b; cursor:pointer;">');
	const likeNumber = $('<p class="like-count like-status">');
	likeNumber.text(item.Likes);

	likeImage.addClass("fa-heart");
	likeImage.addClass(item.Liked ? "fas" : "far");

	likeImage.click(function(event){
	  event.stopPropagation();
	  const self = $(this);

	  LikedPackage = Details[self.closest('.square').attr("details-index")];

	  if(LikedPackage.Liked){
		self.removeClass("fas");
		self.addClass("far");
		LikedPackage.Likes--;
	  } else {
		self.removeClass("far");
		self.addClass("fas");
		LikedPackage.Likes++;
	  }

	  LikedPackage.Liked = !LikedPackage.Liked;
	  
	  self.parent().next().text(LikedPackage.Likes);

	  request(`http://alphaconsole.net/textures/registerLike.php?PackID=${LikedPackage.id}&Status=${LikedPackage.Liked}`, (error, response, body) => { 
	  });

	});

	likeLink.append(likeImage);
	likeDiv.append(likeLink);
	likeDiv.append(likeNumber);

	newPack.append(para);
	newPack.append(para2);
	newPack.append(likeDiv);

	////HIGHTLIGHT
	newPack.mouseenter(function () {
	  $(this).css("box-shadow", "0 0 3pt 2pt #8D661B");
	});
	newPack.mouseleave(function () {
	  const self = $(this);
	  if (SelectedPackage === undefined || self[0] != SelectedPackage[0]) {
		self.css("box-shadow", "0 0 0 0 #8D661B");
	  } else {
		self.css("box-shadow", "0 0 3pt 2pt #2E8C58");
	  }
	});
	//////////////


	////DETAILS PANEL
	newPack.on('click', function () {
	  let d;
	  let index;
	  if (SelectedPackage != undefined) {
		SelectedPackage.css("box-shadow", "0 0 0 0 #2E8C58");

		d = $(`#details${SelectedPackage.attr("details-row")}`);
		index = SelectedPackage.attr("details-index");

		if (SelectedPackage.attr("details-row") != $(this).attr("details-row")) {
		  d.collapse('hide');
		} else {

		}
	  }
	  if (SelectedPackage === undefined || $(this)[0] != SelectedPackage[0]) {
		SelectedPackage = $(this);
		SelectedPackage.css("box-shadow", "0 0 3pt 2pt #2E8C58");

		d = $(`#details${SelectedPackage.attr("details-row")}`);
		index = SelectedPackage.attr("details-index");

		d.find("#title").text(`${Details[index].name} by ${Details[index].author}`);

		const descHtml = Details[index].description || "No description found.<br><br>";
		d.find("#description").html(`${descHtml}<div style='padding:10px'></div>`);

		d.collapse('show');

	  } else {
		$(this).css("box-shadow", "0 0 3pt 2pt #8D661B");
		$(`#details${$(this).attr("details-row")}`).collapse('hide');
		SelectedPackage = undefined;
	  }
	  
	  const progressBar = document.querySelector('.progress-bar');
	  progressBar.style.width = 0;
	  progressBar.style.innerText = '';
	});
	/////////////////

	$("#texture-pack-list").append(newPack);

	if (i % 3 == 2 || i + 1 == packageList.length) {
	  const separator = $('<div>');
	  separator.addClass("bg-black separator collapse");
	  separator.attr("id", `details${Math.floor(i / 3)}`);

	  const title = $("<p>");
	  title.addClass("details-title font-bourgM");
	  title.attr("id", "title");

	  const desc = $("<div>");
	  desc.addClass("font-bourgM description");
	  desc.attr("id", "description");

	  const download = $("<button class=\"download-package\" style=\"margin-bottom:30px\">Download</button>");
	  download.addClass("font-quarcaL btn btn-success download");
	  const progress = $("<div class=\"progress\"> <div class=\"progress-bar bg-success\">0%</div></div>");

	  const divlevel = $("<div>");
	  divlevel.css("position", "relative");
	  divlevel.append(title);
	  divlevel.append(desc);
	  divlevel.append(download);
	  divlevel.append(progress);
	  separator.append(divlevel);

	  $("#texture-pack-list").append(separator);

	}

	i++;
  }

}


function RequestPackages() {
  request(`${baseurl}packages.json?${Math.random()}`, { json: true }, (err, res, {packages}) => {
	if (err) { return console.log(err); }


	AllPackages = packages;
	NumberOfPages = Math.ceil(AllPackages.length / PackagesPerPage);
	PageNumber = 1;


	request("http://alphaconsole.net/textures/getLikes.php", { json: true }, (err2, res2, {All, Own}) => {
	  if (err2) { RefreshPackageList(); return console.log(err2); }

	  if (All == undefined || Own == undefined) {
		RefreshPackageList();
		alert("Unable to contact the ratings server!");
	  }

	  for (let i = 0; i < AllPackages.length; i++){
		if(All[AllPackages[i].id] != undefined){
		  AllPackages[i].Likes = All[AllPackages[i].id];
		} else {
		  AllPackages[i].Likes = 0;
		}

		if(Own[AllPackages[i].id] != undefined){
		  AllPackages[i].Liked = true;
		} else {
		  AllPackages[i].Liked = false;
		}
	  }

	  AllPackages.sort((a, b) => {
        return b.Likes - a.Likes;
      });

	  console.log(AllPackages);

	  RefreshPackageList();
	});

  });

}

function RefreshPackageList() {
  PopulateTexturePackList(AllPackages.slice((PageNumber - 1) * PackagesPerPage, PageNumber * PackagesPerPage));
  $("#page-number-top").text(`Page: ${PageNumber}/${NumberOfPages}`);
  $("#page-number-bottom").text(`Page: ${PageNumber}/${NumberOfPages}`);
}

function NextPage() {
  if (PageNumber < NumberOfPages) {
	PageNumber++;
	RefreshPackageList();
  }
}

function PrevPage() {
  if (PageNumber > 1) {
	PageNumber--;
	RefreshPackageList();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  document.addEventListener('click', (event) => {
    if (event.target.tagName === 'A' && event.target.href.startsWith('http')) {
	  event.preventDefault();
	  shell.openExternal(event.target.href)
    }

    if (event.target.classList.contains('download-package')) {
	  DownloadPackage();
    }
  });

  init();
  RequestPackages();
  console.log("READY");
  
  const titleBarWrapper = document.getElementById('title-bar-wrapper');
  const titleBarWrapperHeight = titleBarWrapper.offsetHeight;
  const titleBar = document.getElementById('title-bar');
  const titleBarHeight = titleBar.offsetHeight;
  const windowHeight = window.innerHeight;

  window.addEventListener('scroll', (event) => {
    const pos = window.pageYOffset;
    const top = titleBarWrapper.getBoundingClientRect().top;

    // Check if element totally above or totally below viewport
    if (top + titleBarWrapperHeight - titleBarHeight < pos || top > pos + windowHeight) {
      return;
    }

    const offset = parseInt(window.pageYOffset - top);

    if (offset > 0) {
      titleBar.style.background = '#454545';
      document.getElementById('footer-bar-wrapper').style.display = 'none';
    }

    if (offset < 0) {
      titleBar.style.background = 'transparent';
    }
  });

  document.getElementById('button-prev-page').addEventListener('click', () => {
	PrevPage();
  });

  document.getElementById('button-next-page').addEventListener('click', () => {
	NextPage();
  });

  // Interate over `accordion` class
  document.querySelectorAll('.accordion').forEach((item) => {
    item.addEventListener('click', (event) => {
      event.currentTarget.classList.toggle('active');
      const panel = event.currentTarget.nextElementSibling;
      if (panel.style.maxHeight) {
        panel.style.maxHeight = null;
      } else {
        panel.style.maxHeight = `${panel.scrollHeight}px`;
      }
    });
  });
});
