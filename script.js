document.addEventListener('DOMContentLoaded', () => {

  /* =========================================================
     1. TAB NAVIGATION ENGINE
     ========================================================= */
  const navLinks = document.querySelectorAll('.nav-link');
  const tabPanes = document.querySelectorAll('.tab-pane');
  const sidebar = document.getElementById('sidebar');
  const menuToggle = document.getElementById('menuToggle');

  function switchTab(tabId) {
    navLinks.forEach(link => {
      if (link.getAttribute('data-tab') === tabId) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    tabPanes.forEach(pane => {
      if (pane.id === `tab-${tabId}`) {
        pane.classList.add('active');
      } else {
        pane.classList.remove('active');
      }
    });

    logEvent('NAVIGATION', `Changement d'onglet -> ${tabId.toUpperCase()}`);
    if (window.innerWidth <= 768) {
      sidebar.classList.remove('open');
    }
  }

  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const tabId = link.getAttribute('data-tab');
      if (tabId) switchTab(tabId);
    });
  });

  if (menuToggle) {
    menuToggle.addEventListener('click', () => {
      sidebar.classList.toggle('open');
    });
  }

  /* =========================================================
     2. TERMINAL CLI INTERACTIVE ENGINE
     ========================================================= */
  const termBody = document.getElementById('termBody');
  const termInput = document.getElementById('termInput');
  const history = [];
  let historyIdx = -1;

  const commands = {
    help: `Commandes disponibles :
  • cv                 : Affiche les informations de contact & profil d'Axel
  • skills             : Liste des compétences techniques validées (Linux, Samba4, pfSense...)
  • projects           : Synthèse des 4 projets BTS SIO SISR d'infrastructure
  • ping <host>        : Simule un test de latence réseau (ex: ping dc01)
  • ansible-playbook   : Simulation d'exécution du playbook IaC
  • clear              : Efface le contenu de la console
  • help               : Affiche ce menu d'aide`,

    cv: `[CURRICULUM VITAE — AXEL MOUBACHIR]
Rôle : Administrateur Système & Réseau (BTS SIO SISR - 2e année)
Email : axel.moubachir@ynov.com
Compétences clés : Active Directory Samba4, GPO, pfSense, OpenVPN MFA, Ansible IaC, Zabbix & GLPI.
Lien Direct : Cliquez sur 'Consulter le CV' en haut à droite.`,

    skills: `[COMPÉTENCES TECHNIQUES VALIDÉES]
├── Système Linux : Debian 13, Ubuntu Server, Systemd, SSH ed25519
├── Annuaire & GPO : Samba4 AD DC, Domain Provisioning, RSAT, Kea DHCP Relay
├── Réseau & Sécurité : pfSense 802.1Q VLANs, OpenVPN RADIUS/TOTP, Suricata IPS
├── Automation IaC : Ansible Playbooks (serial: 2), Semaphore UI, Docker Compose
└── Monitoring & ITSM : Zabbix 7.4, GLPI Agent, Webhooks REST JavaScript`,

    projects: `[CENTRE DE SERVICES ITSM — PROJETS SISR]
#101 : Domaine Samba4 AD DC & GPO Windows (Note: 20/20)
#102 : Sécurisation Périmétrique pfSense, VPN MFA & Suricata IPS (Note: 19.5/20)
#103 : Industrialisation IaC avec Ansible & Semaphore UI (Note: 20/20)
#104 : Supervision Zabbix 7.4 & Gestion de Parc GLPI (Note: 20/20)`,

    'ansible-playbook': `PLAY [Deploying nginx_secure & hardening SSH] ************************************

TASK [Gathering Facts] *********************************************************
ok: [web01.dmz]
ok: [web02.dmz]

TASK [nginx_secure : Ensure Nginx is installed & durci] ************************
changed: [web01.dmz]
changed: [web02.dmz]

PLAY RECAP *********************************************************************
web01.dmz : ok=2  changed=1  failed=0
web02.dmz : ok=2  changed=1  failed=0  [IDEMPOTENCE VERIFIED]`
  };

  if (termInput) {
    termInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const val = termInput.value.trim();
        if (!val) return;

        history.push(val);
        historyIdx = history.length;

        // Print command line
        appendTermLine(`axel@synaptic-itsm:~$ ${val}`, 'term-prompt');

        const cmdLower = val.toLowerCase();

        if (cmdLower === 'clear') {
          termBody.innerHTML = '';
        } else if (cmdLower.startsWith('ping')) {
          appendTermLine(`PING ${val.split(' ')[1] || 'dc01.corp.synaptic.local'} (192.168.10.10) 56(84) bytes of data.\n64 bytes from 192.168.10.10: icmp_seq=1 ttl=64 time=0.34 ms\n64 bytes from 192.168.10.10: icmp_seq=2 ttl=64 time=0.28 ms\n--- 192.168.10.10 ping statistics ---\n2 packets transmitted, 2 received, 0% packet loss, time 1001ms`, 'term-out success');
        } else if (commands[cmdLower]) {
          appendTermLine(commands[cmdLower], 'term-out');
        } else {
          appendTermLine(`Commande non reconnue: '${val}'. Tapez 'help' pour voir la liste.`, 'term-out error');
        }

        termInput.value = '';
        termBody.scrollTop = termBody.scrollHeight;
        logEvent('TERMINAL', `Commande exécutée: ${val}`);
      } else if (e.key === 'ArrowUp') {
        if (historyIdx > 0) {
          historyIdx--;
          termInput.value = history[historyIdx];
        }
      } else if (e.key === 'ArrowDown') {
        if (historyIdx < history.length - 1) {
          historyIdx++;
          termInput.value = history[historyIdx];
        } else {
          historyIdx = history.length;
          termInput.value = '';
        }
      }
    });
  }

  function appendTermLine(text, className = '') {
    const div = document.createElement('div');
    div.className = `term-line ${className}`;
    div.textContent = text;
    termBody.appendChild(div);
  }

  /* =========================================================
     3. OSINT VISITOR INSPECTOR & TIMER
     ========================================================= */
  const osintIp = document.getElementById('osintIp');
  const osintIsp = document.getElementById('osintIsp');
  const osintOs = document.getElementById('osintOs');
  const osintBrowser = document.getElementById('osintBrowser');
  const osintTimer = document.getElementById('osintTimer');
  const logStream = document.getElementById('logStream');

  // Detect OS & Browser
  if (osintOs) osintOs.textContent = detectOS();
  if (osintBrowser) osintBrowser.textContent = detectBrowser();

  // Fetch Public IP
  fetch('https://api.ipify.org?format=json')
    .then(res => res.json())
    .then(data => {
      if (osintIp) osintIp.textContent = data.ip;
      logEvent('OSINT', `Adresse IP détectée: ${data.ip}`);
    })
    .catch(() => {
      if (osintIp) osintIp.textContent = '194.254.60.10 (Proxied)';
    });

  if (osintIsp) osintIsp.textContent = 'Orange / SFR / Enterprise ISP';

  // Live Timer
  let secondsSpent = 0;
  setInterval(() => {
    secondsSpent++;
    const hrs = String(Math.floor(secondsSpent / 3600)).padStart(2, '0');
    const mins = String(Math.floor((secondsSpent % 3600) / 60)).padStart(2, '0');
    const secs = String(secondsSpent % 60).padStart(2, '0');
    if (osintTimer) osintTimer.textContent = `${hrs}:${mins}:${secs}`;
  }, 1000);

  function logEvent(tag, message) {
    if (!logStream) return;
    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0];
    const entry = document.createElement('div');
    entry.className = 'log-entry';
    entry.innerHTML = `<span class="log-time">[${timeStr}]</span> <span class="log-tag">[${tag}]</span> <span class="log-msg">${message}</span>`;
    logStream.appendChild(entry);
    logStream.scrollTop = logStream.scrollHeight;
  }

  function detectOS() {
    const ua = navigator.userAgent;
    if (ua.indexOf('Win') !== -1) return 'Windows OS 💻';
    if (ua.indexOf('Mac') !== -1) return 'macOS 🍏';
    if (ua.indexOf('Linux') !== -1) return 'Linux OS 🐧';
    if (ua.indexOf('Android') !== -1) return 'Android 📱';
    if (ua.indexOf('like Mac') !== -1) return 'iOS 📱';
    return 'OS Indéterminé';
  }

  function detectBrowser() {
    const ua = navigator.userAgent;
    if (ua.indexOf('Chrome') !== -1 && ua.indexOf('Edg') === -1) return 'Google Chrome';
    if (ua.indexOf('Safari') !== -1 && ua.indexOf('Chrome') === -1) return 'Apple Safari';
    if (ua.indexOf('Firefox') !== -1) return 'Mozilla Firefox';
    if (ua.indexOf('Edg') !== -1) return 'Microsoft Edge';
    return 'Navigateur Web';
  }

  /* =========================================================
     4. TICKET MODAL SYSTEM
     ========================================================= */
  window.openTicketModal = function(id) {
    const modal = document.getElementById('ticketModal');
    const title = document.getElementById('modalTicketTitle');
    const body = document.getElementById('modalTicketBody');

    const ticketData = {
      '101': {
        title: 'Ticket #101 : Domaine Samba4 AD DC & GPO Windows',
        content: `<h4>Schéma d'Architecture &amp; Composants :</h4>
        <p>• <strong>DC01 (192.168.10.10) :</strong> Samba4 AD DC avec DNS interne et Kea DHCP Relay.</p>
        <p>• <strong>CLIENT-WIN01 :</strong> Poste membre du domaine <code>CORP.SYNAPTIC.LOCAL</code>.</p>
        <h4 style="margin-top:14px;">Stratégies de Groupe (GPO) Appliquées :</h4>
        <p>1. <strong>GPO Sécurité :</strong> Complexité mot de passe 12 car., historique 12, verrouillage 15 min après 5 erreurs.</p>
        <p>2. <strong>GPO Lecteurs Réseau :</strong> Mapping automatique du partage SMB S: pour le groupe <code>GG_Utilisateurs</code>.</p>
        <p>3. <strong>GPO Bureau :</strong> Fond d'écran via SYSVOL et blocage de l'exécutable cmd.exe.</p>
        <h4 style="margin-top:14px;">Rapport de Validation :</h4>
        <p>Commandes exécutées : <code>samba-tool domain level show</code> et <code>gpresult /h report.html</code>. Note finale : <strong>20/20 (Validé)</strong>.</p>`
      },
      '102': {
        title: 'Ticket #102 : Sécurisation pfSense, OpenVPN MFA & Suricata IPS',
        content: `<h4>Segmentation Réseau 802.1Q :</h4>
        <p>• VLAN 10 (ADMIN), VLAN 20 (DATA), VLAN 30 (VOIP), VLAN 40 (DMZ).</p>
        <h4 style="margin-top:14px;">Durcissement &amp; Protection IPS :</h4>
        <p>• WebConfigurator déplacé sur le port HTTPS 8443, SSH uniquement par clé ed25519.</p>
        <p>• OpenVPN configuré avec double facteur TOTP (Google Authenticator) via serveur RADIUS.</p>
        <p>• Suricata IPS actif sur WAN/DMZ : Blocage automatique des scans Nmap (-sS) en moins de 2 secondes.</p>`
      },
      '103': {
        title: 'Ticket #103 : Industrialisation IaC avec Ansible & Semaphore UI',
        content: `<h4>Automation d'Infrastructure :</h4>
        <p>• Ansible Control Node sur <strong>ANSIBLE01 (192.168.10.20)</strong> avec clés SSH ed25519.</p>
        <p>• Rôle <code>nginx_secure</code> déployé avec masquage <code>server_tokens off</code> et en-têtes HTTP de sécurité.</p>
        <p>• Semaphore UI sous Docker Compose pour planifier le playbook <code>update_all.yml</code> (serial: 2) chaque nuit à 02:00.</p>`
      },
      '104': {
        title: 'Ticket #104 : Supervision Zabbix 7.4 & Gestion de Parc GLPI',
        content: `<h4>Monitoring Proactif &amp; Helpdesk ITSM :</h4>
        <p>• GLPI 10 connecté en LDAPS (port 636) à l'annuaire Samba4 AD.</p>
        <p>• Découverte automatique des équipements par GLPI Agent et SNMP sur pfSense.</p>
        <p>• Zabbix 7.4 avec Webhook JavaScript REST ouvrant automatiquement un ticket dans GLPI en cas de panne de service.</p>`
      }
    };

    if (ticketData[id]) {
      title.textContent = ticketData[id].title;
      body.innerHTML = ticketData[id].content;
      modal.classList.add('active');
      logEvent('MODAL', `Consultation du ticket #${id}`);
    }
  };

  window.closeTicketModal = function() {
    const modal = document.getElementById('ticketModal');
    modal.classList.remove('active');
  };

  /* =========================================================
     5. NETWORK INCIDENT CHALLENGE
     ========================================================= */
  const toggleFirewallBtn = document.getElementById('toggleFirewallBtn');
  const challengeResultBox = document.getElementById('challengeResultBox');

  if (toggleFirewallBtn) {
    toggleFirewallBtn.addEventListener('click', () => {
      if (challengeResultBox.style.display === 'none') {
        challengeResultBox.style.display = 'block';
        toggleFirewallBtn.textContent = 'Règle Activée (PASS - HTTP 80)';
        toggleFirewallBtn.style.background = '#16a34a';
        logEvent('CHALLENGE', 'Règle de pare-feu pfSense activée. Incident #INC-904 résolu.');
      }
    });
  }

  /* =========================================================
     6. CYBER SNAKE ARCADE GAME ENGINE
     ========================================================= */
  const snakeCanvas = document.getElementById('snakeCanvas');
  const snakeScoreEl = document.getElementById('snakeScore');
  const snakeBestEl = document.getElementById('snakeBest');
  const startSnakeBtn = document.getElementById('startSnakeBtn');

  if (snakeCanvas) {
    const ctx = snakeCanvas.getContext('2d');
    const gridSize = 16;
    const tileCountX = snakeCanvas.width / gridSize;
    const tileCountY = snakeCanvas.height / gridSize;

    let snake = [{ x: 10, y: 10 }];
    let dx = 1, dy = 0;
    let food = { x: 15, y: 10 };
    let score = 0;
    let bestScore = 0;
    let gameInterval = null;
    let isRunning = false;

    function drawGame() {
      // Move snake
      const head = { x: snake[0].x + dx, y: snake[0].y + dy };

      // Wall collision
      if (head.x < 0 || head.x >= tileCountX || head.y < 0 || head.y >= tileCountY) {
        return gameOver();
      }

      // Self collision
      for (let i = 0; i < snake.length; i++) {
        if (snake[i].x === head.x && snake[i].y === head.y) {
          return gameOver();
        }
      }

      snake.unshift(head);

      // Food collision
      if (head.x === food.x && head.y === food.y) {
        score += 10;
        if (snakeScoreEl) snakeScoreEl.textContent = score;
        if (score > bestScore) {
          bestScore = score;
          if (snakeBestEl) snakeBestEl.textContent = bestScore;
        }
        placeFood();
      } else {
        snake.pop();
      }

      // Draw background
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, snakeCanvas.width, snakeCanvas.height);

      // Draw grid lines
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 0.5;
      for (let x = 0; x < snakeCanvas.width; x += gridSize) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, snakeCanvas.height); ctx.stroke();
      }
      for (let y = 0; y < snakeCanvas.height; y += gridSize) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(snakeCanvas.width, y); ctx.stroke();
      }

      // Draw Food (Packet IP)
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(food.x * gridSize + gridSize/2, food.y * gridSize + gridSize/2, gridSize/2 - 2, 0, Math.PI * 2);
      ctx.fill();

      // Draw Snake (Ethernet Cable)
      snake.forEach((part, idx) => {
        ctx.fillStyle = idx === 0 ? '#38bdf8' : '#001fe6';
        ctx.fillRect(part.x * gridSize + 1, part.y * gridSize + 1, gridSize - 2, gridSize - 2);
      });
    }

    function placeFood() {
      food = {
        x: Math.floor(Math.random() * tileCountX),
        y: Math.floor(Math.random() * tileCountY)
      };
    }

    function gameOver() {
      clearInterval(gameInterval);
      isRunning = false;
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.fillRect(0, 0, snakeCanvas.width, snakeCanvas.height);
      ctx.fillStyle = '#ef4444';
      ctx.font = 'bold 18px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('GAME OVER — PAQUET PERDU !', snakeCanvas.width / 2, snakeCanvas.height / 2 - 10);
      ctx.fillStyle = '#cbd5e1';
      ctx.font = '14px Inter, sans-serif';
      ctx.fillText(`Score final : ${score} pts`, snakeCanvas.width / 2, snakeCanvas.height / 2 + 20);
      if (startSnakeBtn) startSnakeBtn.textContent = 'Rejouer';
    }

    function startSnake() {
      snake = [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }];
      dx = 1; dy = 0;
      score = 0;
      if (snakeScoreEl) snakeScoreEl.textContent = 0;
      placeFood();
      if (gameInterval) clearInterval(gameInterval);
      gameInterval = setInterval(drawGame, 100);
      isRunning = true;
      if (startSnakeBtn) startSnakeBtn.textContent = 'En cours...';
    }

    if (startSnakeBtn) {
      startSnakeBtn.addEventListener('click', startSnake);
    }

    document.addEventListener('keydown', (e) => {
      if (!isRunning) return;
      if (e.key === 'ArrowUp' && dy === 0) { dx = 0; dy = -1; }
      else if (e.key === 'ArrowDown' && dy === 0) { dx = 0; dy = 1; }
      else if (e.key === 'ArrowLeft' && dx === 0) { dx = -1; dy = 0; }
      else if (e.key === 'ArrowRight' && dx === 0) { dx = 1; dy = 0; }
    });

    window.triggerSnakeDir = function(dir) {
      if (!isRunning) return;
      if (dir === 'UP' && dy === 0) { dx = 0; dy = -1; }
      if (dir === 'DOWN' && dy === 0) { dx = 0; dy = 1; }
      if (dir === 'LEFT' && dx === 0) { dx = -1; dy = 0; }
      if (dir === 'RIGHT' && dx === 0) { dx = 1; dy = 0; }
    };
  }

});

