(function () {
  var app = document.querySelector('.iv-admin-page');
  if (!app) app = document.body;

  var SESSION_TIMEOUT = 15 * 60 * 1000; // 15 minutes of inactivity

  function checkSessionTimeout() {
    var token = sessionStorage.getItem('admin_token');
    if (!token) return;

    var lastActivity = sessionStorage.getItem('admin_last_activity');
    if (!lastActivity) {
      resetInactivityTimer();
      return;
    }

    var elapsed = Date.now() - parseInt(lastActivity, 10);
    if (elapsed > SESSION_TIMEOUT) {
      logoutAdmin(true);
    }
  }

  function resetInactivityTimer() {
    var token = sessionStorage.getItem('admin_token');
    if (token) {
      sessionStorage.setItem('admin_last_activity', Date.now().toString());
    }
  }

  function logoutAdmin(isExpired) {
    sessionStorage.removeItem('admin_token');
    sessionStorage.removeItem('admin_last_activity');
    
    var types = ['stock_master', 'sector_data', 'headwind_tailwind_history'];
    types.forEach(function (type) {
      resetCardUI(type);
    });
    
    updateAuthState();

    if (isExpired) {
      var errBox = app.querySelector('#loginErrorMessage');
      if (errBox) {
        errBox.textContent = 'Session expired due to inactivity. Please log in again.';
        errBox.style.display = 'block';
        errBox.style.borderColor = 'rgba(var(--iv-accent-rgb), 0.2)';
        errBox.style.background = 'rgba(var(--iv-accent-rgb), 0.08)';
        errBox.style.color = 'var(--iv-text)';
      }
    }
  }

  function updateAuthState() {
    var token = sessionStorage.getItem('admin_token');
    var loginSection = app.querySelector('#adminLoginSection');
    var dashSection = app.querySelector('#adminDashboardSection');
    
    if (token === 'admin-session-token') {
      if (loginSection) loginSection.style.display = 'none';
      if (dashSection) dashSection.style.display = 'block';
    } else {
      if (loginSection) loginSection.style.display = 'block';
      if (dashSection) dashSection.style.display = 'none';
    }
  }

  function bindLoginEvents() {
    var form = app.querySelector('#adminLoginForm');
    var errBox = app.querySelector('#loginErrorMessage');
    if (!form) return;

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (errBox) errBox.style.display = 'none';

      // Accept any password client-side
      sessionStorage.setItem('admin_token', 'admin-session-token');
      resetInactivityTimer();
      updateAuthState();
      
      app.querySelector('#adminUsername').value = '';
      app.querySelector('#adminPassword').value = '';
    });
  }

  function bindLogoutEvents() {
    var logoutBtn = app.querySelector('#adminLogoutButton');
    if (!logoutBtn) return;

    logoutBtn.addEventListener('click', function () {
      logoutAdmin(false);
    });
  }

  function resetCardUI(type) {
    var card = app.querySelector('#card-' + type);
    if (!card) return;
    
    var fileInput = card.querySelector('#file-' + type);
    if (fileInput) fileInput.value = '';

    var promptText = card.querySelector('.zone-prompt');
    if (promptText) promptText.textContent = 'Drag & drop or click to choose file';
    
    var nameText = card.querySelector('.iv-admin-file-name');
    if (nameText) {
      nameText.textContent = '';
      nameText.style.display = 'none';
    }

    var uploadBtn = card.querySelector('#btn-' + type);
    if (uploadBtn) uploadBtn.disabled = true;

    var statusBar = card.querySelector('#status-' + type);
    if (statusBar) {
      statusBar.textContent = '';
      statusBar.className = 'iv-admin-status-bar';
    }
  }

  function bindUploadEvents() {
    var fileTypes = ['stock_master', 'sector_data', 'headwind_tailwind_history'];

    fileTypes.forEach(function (type) {
      var card = app.querySelector('#card-' + type);
      if (!card) return;

      var fileInput = card.querySelector('#file-' + type);
      var uploadBtn = card.querySelector('#btn-' + type);
      var statusBar = card.querySelector('#status-' + type);
      var promptText = card.querySelector('.zone-prompt');
      var nameText = card.querySelector('.iv-admin-file-name');

      if (!fileInput || !uploadBtn) return;

      fileInput.addEventListener('change', function () {
        var file = fileInput.files[0];
        if (file) {
          if (promptText) promptText.textContent = 'Selected File:';
          if (nameText) {
            nameText.textContent = file.name;
            nameText.style.display = 'block';
          }
          uploadBtn.disabled = false;
          if (statusBar) {
            statusBar.textContent = 'File ready to upload';
            statusBar.className = 'iv-admin-status-bar';
          }
        } else {
          resetCardUI(type);
        }
      });

      var uploadZone = card.querySelector('.iv-admin-upload-zone');
      if (uploadZone) {
        ['dragenter', 'dragover'].forEach(function (eventName) {
          uploadZone.addEventListener(eventName, function (e) {
            e.preventDefault();
            e.stopPropagation();
            uploadZone.style.borderColor = 'var(--iv-accent-light)';
            uploadZone.style.background = 'rgba(var(--iv-accent-rgb), 0.12)';
          }, false);
        });

        ['dragleave', 'drop'].forEach(function (eventName) {
          uploadZone.addEventListener(eventName, function (e) {
            e.preventDefault();
            e.stopPropagation();
            uploadZone.style.borderColor = '';
            uploadZone.style.background = '';
          }, false);
        });

        uploadZone.addEventListener('drop', function (e) {
          var dt = e.dataTransfer;
          var files = dt.files;
          if (files && files.length > 0) {
            fileInput.files = files;
            var event = new Event('change');
            fileInput.dispatchEvent(event);
          }
        }, false);
      }

      uploadBtn.addEventListener('click', function () {
        var file = fileInput.files[0];
        if (!file) return;

        var token = sessionStorage.getItem('admin_token');
        if (!token) {
          updateAuthState();
          return;
        }

        if (statusBar) {
          statusBar.textContent = 'Uploading files...';
          statusBar.className = 'iv-admin-status-bar';
        }
        uploadBtn.disabled = true;

        setTimeout(function () {
          if (statusBar) {
            statusBar.textContent = 'Success! File updated (Mock Mode).';
            statusBar.className = 'iv-admin-status-bar iv-admin-status-success';
          }
          fileInput.value = '';
          if (promptText) promptText.textContent = 'Drag & drop or click to choose file';
          if (nameText) {
            nameText.textContent = '';
            nameText.style.display = 'none';
          }
          resetInactivityTimer();
        }, 1000);
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    bindLoginEvents();
    bindLogoutEvents();
    bindUploadEvents();

    updateAuthState();

    // Blur code tags and file names for static dashboard restricted look
    var blurredElements = app.querySelectorAll('code, .iv-admin-card-head p');
    blurredElements.forEach(function (el) {
      el.classList.add('iv-blur-value');
    });

    setInterval(checkSessionTimeout, 10000);
  });
})();
