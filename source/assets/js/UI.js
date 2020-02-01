const {shell, remote, BrowserWindow} = require('electron');

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

  document.getElementById('detectInstall').addEventListener('click', () => {
    // code here
  });
};

// TAB CONTROL TOGGLES
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('status-message').innerText = 'Enabled: Items & Options loaded successfully';
  
  // Get the modal
  const modal = document.getElementById('helpModal');
  const changelogs = document.getElementById('changelogsModal');
  const prompt = document.getElementById('prompt');
  
  // Get the button that opens the modal
  const btn = document.getElementById('helpBtn');
  const changelogsBtn = document.getElementById('ChangelogsBtn');
  
  // Get the <span> element that closes the modal
  const span = document.getElementsByClassName('close')[0];
  const changelogsSpan = document.getElementById('closeChangeLogs');
  const promptSpan = document.getElementById('closePrompt');
  
  // When the user clicks the button, open the modal 
  btn.addEventListener('click', () => {
    modal.style.display = 'block';
  });
  
  changelogsBtn.addEventListener('click', () => {
    modal.style.display = 'none';
    changelogs.style.display = 'block';
  });
  
  // When the user clicks on <span> (x), close the modal
  span.addEventListener('click', () => {
    modal.style.display = 'none';
  });
  
  changelogsSpan.addEventListener('click', () => {
    changelogs.style.display = 'none';
  });
  
  promptSpan.addEventListener('click', () => {
    prompt.style.display = 'none';
  });
  
  // When the user clicks anywhere outside of the modal, close it
  window.addEventListener('click', ({target}) => {
    if (target == modal) {
      modal.style.display = 'none';
    }
    if (target == changelogs) {
      changelogs.style.display = 'none';
    }
  
    if (target == prompt) {
      prompt.style.display = 'none';
    }
  });

  const fileInput = document.getElementById('trade-log-location');
  const divInput = document.getElementById('trade-log-location-template');
  const textInput = document.getElementById('trade-log-location-text');
  const clearInput = document.getElementById('trade-log-location-x');
  
  // On file location change check if the value is valid.
  fileInput.addEventListener('change', () => {
    if (!(fileInput.files[0].name.endsWith('.txt') || fileInput.files[0].name.endsWith('.log'))) {
      return fileInput.value = '';
    }
  
    fileInput.style.display = 'none';
    textInput.value = fileInput.files[0].path;
    divInput.style.display = 'block';
  });

  clearInput.addEventListener('click', () => {
    textInput.value = '';
    fileInput.value = '';
  
    fileInput.style.display = 'block';
    divInput.style.display = 'none';
  });

  init();

  document.addEventListener('click', (event) => {
    if (event.target.tagName === 'A' && event.target.href.startsWith('http')) {
	  event.preventDefault();
	  shell.openExternal(event.target.href)
    }
  });

  $('[data-toggle="tooltip"]').tooltip()

  const itemcontrols = document.getElementById('itemcontrols');
  const extracontrols = document.getElementById('extracontrols');
  const settingcontrols = document.getElementById('settingcontrols');

  if (itemcontrols) {
    itemcontrols.style.display = 'block';
  }

  if (extracontrols) {
    extracontrols.style.display = 'none';
  }

  if (settingcontrols) {
    settingcontrols.style.display = 'none';
  }

  // Show the first tab by default
  $('.tabs-stage div').hide();
  $('.tabs-stage div:first').show();
  $('.tabs-nav li:first').addClass('tab-active');

  // Change tab class and display content
  $('.tabs-nav a').on('click', (event) => {
    event.preventDefault();
    $('.tabs-nav li').removeClass('tab-active');
    $(this).parent().addClass('tab-active');
    $('.tabs-stage div').hide();
    $($(this).attr('href')).show();
  });

  document.querySelectorAll('input[type="radio"]').forEach((radio) => {
    radio.addEventListener('click', (event) => {
      const self = event.target;

      // ITEMS TAB CONTROLS
      if (itemcontrols) {
        if (self.getAttribute('id') === 'tab1') {
          itemcontrols.style.display = 'block';
        } else {
         itemcontrols.style.display = 'none';
        }
      }

      // EXTRAS TAB CONTROLS
      if (extracontrols) {
        if (self.getAttribute('id') === 'tab2') {
          extracontrols.style.display = 'block';
        } else {
          extracontrols.style.display = 'none';
        }
      }

      // SETTIGNS TAB CONTROLS
      if (settingcontrols) {
        if (self.getAttribute('id') === 'tab3') {
          settingcontrols.style.display = 'block';
        } else {
          settingcontrols.style.display = 'none';
        }
      }
    });
  });

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
