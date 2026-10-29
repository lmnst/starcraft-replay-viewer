'use strict';
const replays = [
  { id: '01-win-heartbreak', map: 'Heartbreak Ridge', opponent: 'reference-tier-d', frames: 10760, win: true },
  { id: '02-win-benzene', map: 'Benzene', opponent: 'reference-tier-d', frames: 11411, win: true },
  { id: '03-win-destination', map: 'Destination', opponent: 'reference-tier-s', frames: 13054, win: true },
  { id: '04-loss-heartbreak', map: 'Heartbreak Ridge', opponent: 'reference-tier-s', frames: 21734, win: false },
  { id: '05-loss-benzene', map: 'Benzene', opponent: 'reference-tier-s', frames: 21889, win: false }
];
const viewer = document.querySelector('#viewer');
const status = document.querySelector('#status');
let pendingReplay = null;
let engineReady = false;
const dataSetup = document.querySelector('#data-setup');
const setupMessage = document.querySelector('#setup-message');
function showDataSetup(message) {
  dataSetup.hidden = false;
  setupMessage.textContent = message;
}
document.querySelector('#setup-import').onclick = () => document.querySelector('#mpq-files').click();
const time = frames => {
  const seconds = Math.floor(frames * 0.042);
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
};
function selectReplay(source, title, meta, id) {
  pendingReplay = source;
  document.querySelector('#current-title').textContent = title;
  document.querySelector('#current-meta').textContent = meta;
  document.querySelectorAll('.replay-card').forEach(button => {
    const selected = button.dataset.id === id;
    button.classList.toggle('active', selected);
    button.setAttribute('aria-pressed', String(selected));
  });
  if (engineReady) playPending();
  else {
    status.textContent = '已选择回放。请先导入三份 MPQ 游戏数据。';
    showDataSetup(`已选择「${title}」。导入下方三份游戏数据后自动播放。`);
  }
}
function playPending() {
  if (!pendingReplay) return;
  const source = pendingReplay;
  pendingReplay = null;
  try {
    const player = viewer.contentWindow;
    status.textContent = '正在载入回放…';
    if (source instanceof File) player.load_replay_file([source], player.Module.canvas);
    else player.load_replay_url(source);
  } catch (error) { status.textContent = `无法打开回放：${error.message}`; }
}
for (const replay of replays) {
  const button = document.createElement('button');
  button.className = 'replay-card';
  button.dataset.id = replay.id;
  button.setAttribute('aria-pressed', 'false');
  button.innerHTML = `<span class="card-top"><span class="result ${replay.win ? '' : 'loss'}">${replay.win ? 'WIN' : 'LOSS'}</span><span class="map-name">${replay.map}</span></span><span class="card-meta"><span>vs ${replay.opponent}</span><span>${time(replay.frames)}</span></span>`;
  button.onclick = () => {
    const url = new URL(location.href);
    url.searchParams.set('replay', replay.id);
    history.replaceState(null, '', url);
    selectReplay(new URL(`replays/${replay.id}.rep`, location.href).href, replay.map, `Baseline vs ${replay.opponent} · ${time(replay.frames)}`, replay.id);
  };
  document.querySelector('#replay-list').append(button);
}
function openFile(file) {
  if (!file) return;
  if (!/\.rep$/i.test(file.name)) { status.textContent = '请选择 StarCraft 1.16.1 的 .rep 回放文件。'; return; }
  const url = new URL(location.href);
  url.searchParams.delete('replay');
  history.replaceState(null, '', url);
  selectReplay(file, file.name, `${(file.size / 1024).toFixed(1)} KB · 本地文件`, null);
}
document.querySelector('#replay-file').onchange = event => { openFile(event.target.files[0]); event.target.value = ''; };
document.querySelector('#mpq-files').onchange = async event => {
  const selected = Array.from(event.target.files);
  event.target.value = '';
  if (!selected.length) return;
  try {
    status.textContent = '正在读取游戏数据…';
    setupMessage.textContent = '正在读取游戏数据，请稍候…';
    await viewer.contentWindow.ReplayLab.importMPQs(selected);
  } catch (error) {
    status.textContent = error.message;
    showDataSetup(error.message);
  }
};
const localButton = document.querySelector('#local-mpq');
localButton.hidden = !['localhost', '127.0.0.1'].includes(location.hostname);
localButton.onclick = async () => {
  localButton.disabled = true;
  status.textContent = '正在读取本项目 assets/mpq/ 中的游戏数据…';
  try {
    const files = await Promise.all(['StarDat.mpq', 'BrooDat.mpq', 'Patch_rt.mpq'].map(async name => {
      const response = await fetch(`__local-mpq__/${name}`);
      if (!response.ok) throw new Error('本地数据接口不可用，请用 start.ps1 启动，或手动导入 MPQ。');
      return new File([await response.blob()], name);
    }));
    await viewer.contentWindow.ReplayLab.importMPQs(files);
  } catch (error) { status.textContent = error.message; }
  finally { localButton.disabled = false; }
};
window.addEventListener('message', event => {
  if (event.source !== viewer.contentWindow || event.origin !== location.origin || event.data?.type !== 'replay-lab') return;
  const { state, message } = event.data;
  status.textContent = message;
  if (state === 'ready') {
    engineReady = true;
    dataSetup.hidden = true;
    document.querySelector('#data-badge').textContent = '已就绪';
    playPending();
  } else if (state === 'missing') {
    document.querySelector('#data-badge').textContent = '待导入';
    showDataSetup(pendingReplay ? '回放已选好。导入下面三份游戏数据后自动播放。' : '回放已在网站上，但播放器还需要游戏画面和音效资源。');
  }
});
document.querySelector('#fullscreen').onclick = async () => {
  try { await document.querySelector('#screen').requestFullscreen(); }
  catch { status.textContent = '此浏览器未允许全屏，可以使用浏览器全屏功能。'; }
};
document.addEventListener('dragover', event => { event.preventDefault(); document.querySelector('#screen').classList.add('drag-over'); });
document.addEventListener('drop', event => { event.preventDefault(); document.querySelector('#screen').classList.remove('drag-over'); openFile(event.dataTransfer.files[0]); });
document.addEventListener('dragleave', event => { if (!event.relatedTarget) document.querySelector('#screen').classList.remove('drag-over'); });
const initialReplay = new URLSearchParams(location.search).get('replay');
if (replays.some(replay => replay.id === initialReplay)) document.querySelector(`[data-id="${initialReplay}"]`).click();
