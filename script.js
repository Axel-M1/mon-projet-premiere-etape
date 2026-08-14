document.addEventListener('DOMContentLoaded', () => {
  const year = document.getElementById('year');
  if (year) {
    year.textContent = new Date().getFullYear();
  }

  // Tab System
  const navItems = document.querySelectorAll('[data-tab]');
  const tabContents = document.querySelectorAll('.tab-content');

  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const tabName = item.getAttribute('data-tab');
      
      // Remove active class from all items and contents
      navItems.forEach(nav => nav.classList.remove('active'));
      tabContents.forEach(tab => tab.classList.remove('active'));
      
      // Add active class to clicked item and corresponding content
      item.classList.add('active');
      const tabContent = document.getElementById(tabName);
      if (tabContent) {
        tabContent.classList.add('active');
      }

      // Initialize tab-specific features
      if (tabName === 'telemetry') {
        initTelemetry();
      } else if (tabName === 'terminal') {
        initTerminal();
      } else if (tabName === 'game') {
        initGame();
      }
    });
  });

  // Terminal functionality
  function initTerminal() {
    const terminalInput = document.getElementById('terminalInput');
    const terminalOutput = document.getElementById('terminalOutput');

    if (!terminalInput) return;

    terminalInput.focus();
    terminalInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        const command = terminalInput.value.trim();
        if (command) {
          processCommand(command, terminalOutput);
          terminalInput.value = '';
        }
      }
    });
  }

  function processCommand(command, output) {
    const commandLine = document.createElement('div');
    commandLine.innerHTML = `<span style="color: #10b981;">visitor@my-portfolio:~$</span> ${command}`;
    output.appendChild(commandLine);

    lastActionTime = Date.now();
    pageViews++;
    document.getElementById('pageViews').textContent = pageViews;
    document.getElementById('lastAction').textContent = 'À l\'instant';

    const response = document.createElement('div');
    const commands = command.toLowerCase().split(' ');

    if (commands[0] === 'help') {
      response.textContent = 'Available commands: help, cv, ping, ansible-playbook, skills, clear, whoami';
    } else if (commands[0] === 'cv') {
      response.innerHTML = 'Name: Axel Moubachir<br>Email: axel.moubachir@ynov.com<br>Formation: BTS SIO SISR • Début 2e année • Août 2026<br>Télécharge le PDF: CV_Axel_Moubachir.pdf';
    } else if (commands[0] === 'ping') {
      const target = commands[1] || 'dc01.synaptic.local';
      response.textContent = `PING ${target}\n64 bytes: time=${(Math.random() * 20).toFixed(1)}ms TTL=64`;
    } else if (commands[0] === 'ansible-playbook') {
      response.innerHTML = '[RUNNING] deploy.yml<br>● task 1: installing packages...<br>● task 2: configuring services...<br>✓ Deployment completed successfully!';
    } else if (commands[0] === 'skills') {
      response.textContent = 'Linux • Samba4 • pfSense • Docker • Ansible • Windows Server • GPO • Zabbix • GLPI • VPN • Monitoring • Automation';
    } else if (commands[0] === 'whoami') {
      response.textContent = 'Axel Moubachir - SysAdmin SISR';
    } else if (commands[0] === 'clear') {
      output.innerHTML = '';
      return;
    } else {
      response.textContent = `Command not found: ${command}`;
    }

    response.style.color = '#10b981';
    output.appendChild(response);
    output.scrollTop = output.scrollHeight;
  }

  // Telemetry functionality - ACTIVE REAL-TIME
  let startTime = Date.now();
  let pageViews = 1;
  let lastActionTime = Date.now();

  function initTelemetry() {
    // Fetch real visitor IP and geolocation
    fetch('https://api.ipify.org?format=json')
      .then(res => res.json())
      .then(data => {
        document.getElementById('visitorIP').textContent = data.ip;
        // Try to get geolocation from IP
        fetch(`https://ipapi.co/${data.ip}/json/`)
          .then(res => res.json())
          .then(geo => {
            document.getElementById('visitorLocation').textContent = `${geo.city}, ${geo.country_name} 🌍`;
            document.getElementById('visitorISP').textContent = geo.org || 'ISP Information';
          })
          .catch(() => {
            document.getElementById('visitorLocation').textContent = 'Localisation détectée 🌍';
            document.getElementById('visitorISP').textContent = 'FAI détecté';
          });
      })
      .catch(() => {
        document.getElementById('visitorIP').textContent = 'IP détectée (Local)';
      });

    // Real browser detection
    const browserInfo = getBrowserInfo();
    document.getElementById('visitorBrowser').textContent = browserInfo;
    document.getElementById('visitorOS').textContent = getOSInfo();
    document.getElementById('visitorRes').textContent = `${window.innerWidth} × ${window.innerHeight}px`;
    document.getElementById('pageViews').textContent = pageViews;
    document.getElementById('lastAction').textContent = 'À l\'instant';

    // Update time on site every second
    setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      const mins = Math.floor(elapsed / 60);
      const secs = elapsed % 60;
      document.getElementById('visitorTime').textContent = mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
    }, 1000);
  }

  function getBrowserInfo() {
    const ua = navigator.userAgent;
    if (ua.indexOf('Chrome') > -1) return 'Chrome ' + ua.match(/Chrome\/([0-9.]+)/)[1];
    if (ua.indexOf('Safari') > -1 && ua.indexOf('Chrome') === -1) return 'Safari ' + ua.match(/Version\/([0-9.]+)/)[1];
    if (ua.indexOf('Firefox') > -1) return 'Firefox ' + ua.match(/Firefox\/([0-9.]+)/)[1];
    if (ua.indexOf('Edge') > -1) return 'Edge ' + ua.match(/Edge\/([0-9.]+)/)[1];
    return navigator.userAgent.split('(')[0].trim();
  }

  function getOSInfo() {
    const ua = navigator.userAgent;
    if (ua.indexOf('Win') > -1) return 'Windows';
    if (ua.indexOf('Mac') > -1) return 'macOS';
    if (ua.indexOf('Linux') > -1) return 'Linux';
    if (ua.indexOf('Android') > -1) return 'Android';
    if (ua.indexOf('iPhone') > -1 || ua.indexOf('iPad') > -1) return 'iOS';
    return navigator.platform;
  }

  // Game functionality
  function initGame() {
    const draggables = document.querySelectorAll('.draggable');
    const dropZone = document.getElementById('gameDropZone');
    const submitBtn = document.getElementById('submitGameBtn');
    const gameResult = document.getElementById('gameResult');

    draggables.forEach(draggable => {
      draggable.addEventListener('dragstart', (e) => {
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', draggable.getAttribute('data-rule'));
        draggable.classList.add('dragging');
      });

      draggable.addEventListener('dragend', () => {
        draggable.classList.remove('dragging');
      });
    });

    dropZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      dropZone.classList.add('drag-over');
    });

    dropZone.addEventListener('dragleave', () => {
      dropZone.classList.remove('drag-over');
    });

    dropZone.addEventListener('drop', (e) => {
      e.preventDefault();
      const rule = e.dataTransfer.getData('text/plain');
      const draggable = document.querySelector(`[data-rule="${rule}"]`);
      
      dropZone.classList.remove('drag-over');
      
      // Clone and add to drop zone
      const cloned = draggable.cloneNode(true);
      cloned.classList.remove('draggable');
      cloned.style.cursor = 'default';
      dropZone.innerHTML = '';
      dropZone.appendChild(cloned);
      
      submitBtn.style.display = 'block';
    });

    submitBtn.addEventListener('click', () => {
      const droppedRule = dropZone.querySelector('[data-rule]');
      if (droppedRule) {
        const rule = droppedRule.getAttribute('data-rule');
        const isCorrect = rule === 'allow-ssh' || rule === 'allow-https';
        
        gameResult.style.display = 'block';
        if (isCorrect) {
          gameResult.className = 'game-result-success';
          gameResult.innerHTML = '<strong>✅ Succès!</strong> Vous avez rétabli la connectivité. Une Attestation de Résolution d\'Incident est générée à votre nom.';
        } else {
          gameResult.className = 'game-result-error';
          gameResult.innerHTML = '<strong>❌ Erreur!</strong> Cette règle ne résout pas le problème. Essayez une autre.';
        }
      }
    });
  }
});

