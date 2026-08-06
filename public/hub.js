async function bootHub() {
  const list = document.getElementById('gameList');
  const versionEl = document.getElementById('hubVersion');
  if (!list) return;

  try {
    const res = await fetch('/api/games');
    const data = await res.json();
    const games = Array.isArray(data.games) ? data.games : [];

    list.innerHTML = '';
    games.forEach((game) => {
      const card = document.createElement(game.ready ? 'a' : 'div');
      card.className = `game-card ${game.ready ? 'ready' : 'soon'}`;
      if (game.ready) card.href = game.path;

      card.innerHTML = `
        <h2 class="game-card-title">${escapeHtml(game.title)}</h2>
        <span class="game-card-path">${escapeHtml(game.path)}</span>
        <p class="game-card-blurb">${escapeHtml(game.blurb || '')}</p>
        <span class="game-card-badge">${game.ready ? '可游玩' : '即将推出'}</span>
      `;
      list.appendChild(card);
    });

    // 版本与进化史页脚对齐：读 evolve meta（失败则保留默认）
    try {
      const metaRes = await fetch('/evolve/api/meta');
      const meta = await metaRes.json();
      if (versionEl && meta?.version) versionEl.textContent = `v${meta.version}`;
    } catch {
      /* ignore */
    }
  } catch (err) {
    list.innerHTML = `<p class="hub-lead">无法加载游戏列表：${escapeHtml(err.message || String(err))}</p>`;
  }
}

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

bootHub();
