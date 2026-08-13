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

    const response = document.createElement('div');
    const commands = command.toLowerCase().split(' ');

    if (commands[0] === 'help') {
      response.textContent = 'Available commands: help, cv, ping, ansible-playbook, skills, clear';
    } else if (commands[0] === 'cv') {
      response.innerHTML = 'Name: Axel Moubachir<br>Email: axel.moubachir@ynov.com<br>Formation: BTS SIO SISR • Août 2026';
    } else if (commands[0] === 'ping') {
      response.textContent = `PING dc01.synaptic.local (10.0.0.5) 56(84) bytes of data.\n64 bytes from dc01: time=2.5ms\nSTATISTICS: 1 packets transmitted, 1 received, 0% loss`;
    } else if (commands[0] === 'ansible-playbook') {
      response.innerHTML = '[RUNNING] deploy.yml<br>● installing packages...<br>✓ Deployment successful!';
    } else if (commands[0] === 'skills') {
      response.textContent = 'Linux • Samba4 • pfSense • Docker • Ansible • Windows Server • GPO • Zabbix • GLPI • VPN • Monitoring • Automation';
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

  // Telemetry functionality
  function initTelemetry() {
    // Simulate visitor data
    document.getElementById('visitorIP').textContent = '192.168.' + Math.floor(Math.random() * 255) + '.' + Math.floor(Math.random() * 255);
    document.getElementById('visitorLocation').textContent = 'Paris, France 🇫🇷';
    document.getElementById('visitorISP').textContent = 'Orange Telecom';
    document.getElementById('visitorBrowser').textContent = navigator.userAgent.split('(')[0].trim();
    document.getElementById('visitorOS').textContent = navigator.platform;
    document.getElementById('visitorRes').textContent = `${window.innerWidth} x ${window.innerHeight}`;
    document.getElementById('pageViews').textContent = '1';
    document.getElementById('lastAction').textContent = 'À l\'instant';
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

