document.addEventListener('DOMContentLoaded', () => {
  const year = document.getElementById('year');
  if (year) {
    year.textContent = new Date().getFullYear();
  }

  // Burger menu
  const menuToggle = document.getElementById('menuToggle');
  const sidebar = document.getElementById('sidebar');
  const sidebarOverlay = document.getElementById('sidebarOverlay');

  function closeSidebar() {
    sidebar.classList.remove('open');
    menuToggle.classList.remove('open');
    sidebarOverlay.classList.remove('visible');
  }

  function toggleSidebar() {
    const isOpen = sidebar.classList.toggle('open');
    menuToggle.classList.toggle('open', isOpen);
    sidebarOverlay.classList.toggle('visible', isOpen);
  }

  if (menuToggle) {
    menuToggle.addEventListener('click', toggleSidebar);
    sidebarOverlay.addEventListener('click', closeSidebar);
  }

  initCpuRamMonitor();

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

      closeSidebar();

      // Initialize tab-specific features
      if (tabName === 'telemetry') {
        initTelemetry();
      } else if (tabName === 'terminal') {
        initTerminal();
      } else if (tabName === 'game') {
        initGame();
        initSnake();
      }
    });
  });

  // CPU / RAM live monitor - simulated random-walk metrics
  function initCpuRamMonitor() {
    const bars = document.querySelectorAll('#cpuRamBars span');
    const cpuValueEl = document.getElementById('cpuValue');
    const ramValueEl = document.getElementById('ramValue');
    const pill = document.getElementById('cpuRamPill');
    if (!bars.length || !cpuValueEl || !ramValueEl) return;

    // bars alternate CPU (index even) / RAM (index odd) via CSS nth-child coloring
    const cpuBars = Array.from(bars).filter((_, i) => i % 2 === 0);
    const ramBars = Array.from(bars).filter((_, i) => i % 2 === 1);

    let cpu = 46;
    let ram = 61;

    function nextValue(current) {
      const delta = (Math.random() - 0.5) * 26;
      return Math.min(94, Math.max(15, Math.round(current + delta)));
    }

    function render() {
      cpuValueEl.textContent = `${cpu}%`;
      ramValueEl.textContent = `${ram}%`;
      cpuBars.forEach(bar => { bar.style.height = `${cpu}%`; });
      ramBars.forEach(bar => { bar.style.height = `${ram}%`; });
    }

    function tick() {
      cpu = nextValue(cpu);
      ram = nextValue(ram);
      render();
      if (pill) {
        pill.classList.add('live-pulse');
        setTimeout(() => pill.classList.remove('live-pulse'), 400);
      }
    }

    render();
    setInterval(tick, 1500);
  }

  // Système OK - functional health check
  const systemCheckBtn = document.getElementById('systemCheckBtn');  const statusDot = document.querySelector('.status-dot');
  if (systemCheckBtn) {
    systemCheckBtn.addEventListener('click', () => {
      if (systemCheckBtn.disabled) return;
      systemCheckBtn.disabled = true;
      systemCheckBtn.textContent = '⏳ Vérification...';
      if (statusDot) statusDot.classList.add('checking');

      setTimeout(() => {
        systemCheckBtn.textContent = '✅ Tous systèmes OK';
        if (statusDot) statusDot.classList.remove('checking');

        setTimeout(() => {
          systemCheckBtn.textContent = 'Système OK';
          systemCheckBtn.disabled = false;
        }, 2500);
      }, 1100);
    });
  }

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

  // Snake game
  let snakeInterval = null;
  let snakeKeysBound = false;
  let snakeInitialized = false;

  function initSnake() {
    if (snakeInitialized) return;
    const canvas = document.getElementById('snakeCanvas');
    if (!canvas) return;
    snakeInitialized = true;
    const ctx = canvas.getContext('2d');
    const overlay = document.getElementById('snakeOverlay');
    const startBtn = document.getElementById('snakeStartBtn');
    const scoreEl = document.getElementById('snakeScore');
    const bestEl = document.getElementById('snakeBest');

    const cell = 20;
    const cols = canvas.width / cell;
    const rows = canvas.height / cell;

    let snake, direction, nextDirection, food, score, best;

    best = parseInt(localStorage.getItem('snakeBest') || '0', 10);
    bestEl.textContent = best;

    function resetGame() {
      snake = [{ x: 8, y: 10 }, { x: 7, y: 10 }, { x: 6, y: 10 }];
      direction = 'right';
      nextDirection = 'right';
      score = 0;
      scoreEl.textContent = score;
      placeFood();
    }

    function placeFood() {
      do {
        food = {
          x: Math.floor(Math.random() * cols),
          y: Math.floor(Math.random() * rows)
        };
      } while (snake.some(s => s.x === food.x && s.y === food.y));
    }

    function draw() {
      ctx.fillStyle = '#0e1524';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#22d3ee';
      ctx.fillRect(food.x * cell + 2, food.y * cell + 2, cell - 4, cell - 4);

      snake.forEach((segment, i) => {
        ctx.fillStyle = i === 0 ? '#6366f1' : '#4f46e5';
        ctx.fillRect(segment.x * cell + 1, segment.y * cell + 1, cell - 2, cell - 2);
      });
    }

    function step() {
      direction = nextDirection;
      const head = { ...snake[0] };

      if (direction === 'up') head.y -= 1;
      if (direction === 'down') head.y += 1;
      if (direction === 'left') head.x -= 1;
      if (direction === 'right') head.x += 1;

      const hitsWall = head.x < 0 || head.x >= cols || head.y < 0 || head.y >= rows;
      const hitsSelf = snake.some(s => s.x === head.x && s.y === head.y);

      if (hitsWall || hitsSelf) {
        gameOver();
        return;
      }

      snake.unshift(head);

      if (head.x === food.x && head.y === food.y) {
        score += 10;
        scoreEl.textContent = score;
        placeFood();
      } else {
        snake.pop();
      }

      draw();
    }

    function gameOver() {
      clearInterval(snakeInterval);
      snakeInterval = null;
      if (score > best) {
        best = score;
        bestEl.textContent = best;
        localStorage.setItem('snakeBest', String(best));
      }
      overlay.classList.remove('hidden');
      startBtn.textContent = `🔁 Rejouer (score: ${score})`;
    }

    function startGame() {
      resetGame();
      overlay.classList.add('hidden');
      draw();
      if (snakeInterval) clearInterval(snakeInterval);
      snakeInterval = setInterval(step, 120);
    }

    startBtn.addEventListener('click', startGame);
    resetGame();
    draw();

    if (!snakeKeysBound) {
      snakeKeysBound = true;
      window.addEventListener('keydown', (e) => {
        if (!snakeInterval) return;
        const key = e.key.toLowerCase();
        if ((key === 'arrowup' || key === 'z' || key === 'w') && direction !== 'down') nextDirection = 'up';
        else if ((key === 'arrowdown' || key === 's') && direction !== 'up') nextDirection = 'down';
        else if ((key === 'arrowleft' || key === 'q' || key === 'a') && direction !== 'right') nextDirection = 'left';
        else if ((key === 'arrowright' || key === 'd') && direction !== 'left') nextDirection = 'right';
        else return;
        e.preventDefault();
      });
    }
  }
});

