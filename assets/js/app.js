const PLAYERS = ['Pedro', 'William'];
const EDIT_WINDOW_MS = 5 * 60 * 1000; // 5 minutes
const STORAGE_KEY = 'placar_votes';
const HISTORY_KEY = 'placar_history';
const SESSION_KEY = 'placar_session';

function getToday() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function formatDate(dateStr) {
  const [y, m, d] = dateStr.split('-');
  return `${d}/${m}/${y}`;
}

function loadVotes() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch { return {}; }
}

function saveVotes(votes) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(votes));
}

function loadHistory() {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY)) || [];
  } catch { return []; }
}

function saveHistory(history) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}

function getDayVotes(today) {
  const votes = loadVotes();
  return votes[today] || null;
}

function canEdit(player, today) {
  const dayVotes = getDayVotes(today);
  if (!dayVotes) return false;
  const vote = dayVotes[player];
  if (!vote || !vote.timestamp) return false;
  return Date.now() - vote.timestamp < EDIT_WINDOW_MS;
}

function hasVoted(player, today) {
  const dayVotes = getDayVotes(today);
  return dayVotes && dayVotes[player] != null;
}

function submitVote(player, score, today) {
  const votes = loadVotes();
  if (!votes[today]) votes[today] = {};
  votes[today][player] = {
    score: Number(score),
    timestamp: Date.now()
  };
  saveVotes(votes);

  // Save to history when both have voted
  if (votes[today].Pedro != null && votes[today].William != null) {
    const history = loadHistory();
    const existingIdx = history.findIndex(h => h.date === today);
    const entry = {
      date: today,
      pedro: Number(votes[today].Pedro.score),
      william: Number(votes[today].William.score)
    };
    if (existingIdx >= 0) {
      history[existingIdx] = entry;
    } else {
      history.unshift(entry);
    }
    saveHistory(history);
  }
}

function getTotalScore(player) {
  const history = loadHistory();
  return history.reduce((sum, h) => {
    return sum + (player === 'Pedro' ? h.pedro : h.william);
  }, 0);
}

// Render functions
function renderLogin() {
  const app = document.getElementById('app');
  const session = restoreSession();
  const lastUser = session || '—';
  app.innerHTML = `
    <div class="card login-card fade-in">
      <h2>Quem é você?</h2>
      <p>Selecione seu nome para acessar o placar</p>
      <div class="input-group">
        <input type="text" id="nameInput" placeholder="Pedro ou William" autocomplete="off">
        <button class="btn btn-primary" onclick="handleLogin()">Entrar</button>
      </div>
      <p style="font-size:12px;color:var(--text-muted);margin-top:16px;">Último acesso: ${lastUser}</p>
    </div>
  `;
  document.getElementById('nameInput').focus();
  document.getElementById('nameInput').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleLogin();
  });
}

function handleLogin() {
  const input = document.getElementById('nameInput');
  const name = input.value.trim();
  if (!PLAYERS.includes(name)) {
    input.style.borderColor = 'var(--error)';
    input.style.boxShadow = '0 0 0 3px rgba(220,38,38,0.1)';
    setTimeout(() => {
      input.style.borderColor = '';
      input.style.boxShadow = '';
    }, 1500);
    return;
  }
  currentUser = name;
  localStorage.setItem(SESSION_KEY, JSON.stringify({ user: name, ts: Date.now() }));
  renderBoard();
}

let currentUser = null;
let timerInterval = null;

function renderBoard() {
  const today = getToday();
  const dayVotes = getDayVotes(today);
  const pedroScore = dayVotes && dayVotes.Pedro ? dayVotes.Pedro.score : null;
  const williamScore = dayVotes && dayVotes.William ? dayVotes.William.score : null;
  const userHasVoted = hasVoted(currentUser, today);
  const userCanEdit = canEdit(currentUser, today);
  const otherPlayer = PLAYERS.find(p => p !== currentUser);
  const otherHasVoted = hasVoted(otherPlayer, today);

  const app = document.getElementById('app');

  let voteSectionHTML = '';
  if (userHasVoted && userCanEdit) {
    const remaining = EDIT_WINDOW_MS - (Date.now() - (dayVotes && dayVotes[currentUser] ? dayVotes[currentUser].timestamp : 0));
    const minutes = Math.floor(remaining / 60000);
    const seconds = Math.floor((remaining % 60000) / 1000);
    const timeStr = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    const timerClass = remaining < 10000 ? 'warning' : '';
    voteSectionHTML = `
      <div class="vote-section fade-in">
        <h3>Edite sua pontuação</h3>
        <div class="vote-input-group">
          <input type="number" id="scoreInput" placeholder="Pontos" min="0" max="999" value="${currentUser === 'Pedro' ? pedroScore : williamScore}">
          <button class="btn btn-primary" onclick="handleVote()">Salvar</button>
        </div>
        <div class="timer ${timerClass}" id="timer">
          <span class="timer-dot"></span>
          <span id="timerText">${timeStr} restantes para editar</span>
        </div>
      </div>
    `;
  } else if (userHasVoted && !userCanEdit) {
    voteSectionHTML = `
      <div class="vote-section fade-in">
        <div class="badge badge-success">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg>
          Seu voto foi registrado
        </div>
        <p style="font-size:14px;color:var(--text-muted);margin-top:12px;">Volte amanhã para votar novamente</p>
      </div>
    `;
  } else {
    voteSectionHTML = `
      <div class="vote-section fade-in">
        <h3>Qual sua pontuação hoje?</h3>
        <div class="vote-input-group">
          <input type="number" id="scoreInput" placeholder="Pontos" min="0" max="999">
          <button class="btn btn-primary" onclick="handleVote()">Votar</button>
        </div>
      </div>
    `;
  }

  app.innerHTML = `
    <div class="fade-in">
      <div class="user-bar">
        <div class="user-info">
          <img class="user-avatar" src="assets/img/${currentUser.toLowerCase()}-conty.jpg" alt="${currentUser}">
          <span class="user-name">${currentUser}</span>
        </div>
        <button class="btn btn-ghost btn-sm" onclick="handleLogout()">Sair</button>
      </div>

      <div class="card">
        <div class="scoreboard">
          <div class="player-card card ${currentUser === 'Pedro' ? 'active' : ''}">
            <img class="player-avatar" src="assets/img/pedro-conty.jpg" alt="Pedro">
            <div class="player-name">Pedro</div>
            <div class="player-score ${pedroScore === null ? 'locked' : ''}">${pedroScore !== null ? pedroScore : '—'}</div>
            ${pedroScore !== null && hasVoted('Pedro', today) && !canEdit('Pedro', today) ? '<div class="badge badge-success"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg> Votou</div>' : ''}
          </div>
          <div class="vs">vs</div>
          <div class="player-card card ${currentUser === 'William' ? 'active' : ''}">
            <img class="player-avatar" src="assets/img/william-conty.jpg" alt="William">
            <div class="player-name">William</div>
            <div class="player-score ${williamScore === null ? 'locked' : ''}">${williamScore !== null ? williamScore : '—'}</div>
            ${williamScore !== null && hasVoted('William', today) && !canEdit('William', today) ? '<div class="badge badge-success"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg> Votou</div>' : ''}
          </div>
        </div>

        ${voteSectionHTML}
      </div>

      <div class="total-section">
        <div class="total-item">
          <div class="total-label">Total Pedro</div>
          <div class="total-value total-pedro">${getTotalScore('Pedro')}</div>
        </div>
        <div class="total-item">
          <div class="total-label">Total William</div>
          <div class="total-value total-william">${getTotalScore('William')}</div>
        </div>
      </div>

      <div class="card history-card">
        <h3>Histórico</h3>
        ${renderHistory()}
      </div>
    </div>
  `;

  // Focus input if not voted yet
  if (!userHasVoted) {
    const input = document.getElementById('scoreInput');
    if (input) input.focus();
    const scoreInput = document.getElementById('scoreInput');
    if (scoreInput) {
      scoreInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') handleVote();
      });
    }
  }

  // Start timer if editing
  if (userHasVoted && userCanEdit) {
    startTimer();
  }
}

function renderHistory() {
  const history = loadHistory();
  if (history.length === 0) {
    return '<div class="empty-state">Nenhuma rodada completa ainda.<br>Ambos precisam votar para registrar no histórico.</div>';
  }

  return `
    <div class="history-list">
      ${history.slice(0, 10).map(h => {
        let winnerClass = 'winner-tie';
        let winnerText = 'Empate';
        if (h.pedro > h.william) {
          winnerClass = 'winner-pedro';
          winnerText = 'Pedro';
        } else if (h.william > h.pedro) {
          winnerClass = 'winner-william';
          winnerText = 'William';
        }
        return `
          <div class="history-item">
            <span class="history-date">${formatDate(h.date)}</span>
            <div class="history-scores">
              <span class="pedro">${h.pedro}</span>
              <span class="dash">—</span>
              <span class="william">${h.william}</span>
            </div>
            <span class="history-winner ${winnerClass}">${winnerText}</span>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

function handleVote() {
  const input = document.getElementById('scoreInput');
  const score = input.value.trim();
  if (score === '' || isNaN(Number(score))) {
    input.style.borderColor = 'var(--error)';
    input.style.boxShadow = '0 0 0 3px rgba(220,38,38,0.1)';
    setTimeout(() => {
      input.style.borderColor = '';
      input.style.boxShadow = '';
    }, 1500);
    return;
  }
  const today = getToday();
  submitVote(currentUser, score, today);
  if (timerInterval) clearInterval(timerInterval);
  renderBoard();
}

function handleLogout() {
  if (timerInterval) clearInterval(timerInterval);
  currentUser = null;
  localStorage.removeItem(SESSION_KEY);
  renderLogin();
}

function startTimer() {
  if (timerInterval) clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    if (!canEdit(currentUser, getToday())) {
      clearInterval(timerInterval);
      renderBoard();
      return;
    }
    const dayVotes = getDayVotes(getToday());
    const remaining = EDIT_WINDOW_MS - (Date.now() - (dayVotes && dayVotes[currentUser] ? dayVotes[currentUser].timestamp : 0));
    if (remaining <= 0) {
      clearInterval(timerInterval);
      renderBoard();
      return;
    }
    const minutes = Math.floor(remaining / 60000);
    const seconds = Math.floor((remaining % 60000) / 1000);
    const timeStr = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    const timerEl = document.getElementById('timer');
    const timerTextEl = document.getElementById('timerText');
    if (timerTextEl) timerTextEl.textContent = `${timeStr} restantes para editar`;
    if (timerEl) {
      if (remaining < 10000) {
        timerEl.className = 'timer warning';
      } else {
        timerEl.className = 'timer';
      }
    }
  }, 1000);
}

// Restore session from localStorage
function restoreSession() {
  try {
    const session = JSON.parse(localStorage.getItem(SESSION_KEY));
    if (session && PLAYERS.includes(session.user)) {
      // Session expires after 24 hours
      if (Date.now() - session.ts < 24 * 60 * 60 * 1000) {
        return session.user;
      }
    }
  } catch { /* ignore */ }
  return null;
}

// Init
currentUser = restoreSession();
if (currentUser) {
  renderBoard();
} else {
  renderLogin();
}
