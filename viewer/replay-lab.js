/* Local integration for the vendored OpenBW viewer. Loaded before the WASM runtime. */
(function () {
  function notify(state, message) {
    if (parent !== window) parent.postMessage({ type: 'replay-lab', state: state, message: message }, location.origin);
  }
  // Game archives are supplied by the visitor, never downloaded from a third party.
  fetch_default_mpqs = function () {
    reset_loading_files_screen();
    show_loading_files_screen('请在左侧导入 StarDat.mpq、BrooDat.mpq、Patch_rt.mpq。<br>游戏数据仅在本浏览器中读取和缓存。');
    notify('missing', '等待游戏数据：导入三份 MPQ，或读取本项目数据。');
  };
  C_MUSIC_TRACKS_BY_RACE = { 0: [], 1: [], 2: [] };
  var originalReadDone = on_read_all_done;
  on_read_all_done = function () {
    originalReadDone();
    notify('ready', '游戏数据已就绪。选择项目回放，或打开本地 .rep 文件。');
  };
  var originalLoadDone = js_load_done;
  js_load_done = function () {
    originalLoadDone();
    notify('playing', '回放已载入。点击画面后可使用 Space 暂停、A / D 调整倍速。');
  };
  var originalStartReplay = start_replay;
  start_replay = function (buffer, length) {
    originalStartReplay(buffer, length);
    notify('playing', '回放已载入。点击画面后可使用 Space 暂停、A / D 调整倍速。');
  };
  var originalFatal = js_fatal_error;
  js_fatal_error = function (ptr) {
    notify('error', '播放器错误：' + UTF8ToString(ptr));
    originalFatal(ptr);
  };
  window.ReplayLab = {
    importMPQs: async function (selected) {
      if (main_has_been_called) throw new Error('更换游戏数据前请刷新网页，再导入三份 MPQ。');
      if (is_reading) throw new Error('正在读取游戏数据，请稍候。');
      var supplied = C_MPQ_FILENAMES.map(function (name) {
        return selected.find(function (file) { return file.name.toLowerCase() === name.toLowerCase(); });
      });
      var missing = C_MPQ_FILENAMES.filter(function (_, index) { return !supplied[index]; });
      if (missing.length) throw new Error('请同时选择三份 MPQ。缺少：' + missing.join('、'));
      for (var i = 0; i < supplied.length; i++) {
        var signature = new Uint8Array(await supplied[i].slice(0, 3).arrayBuffer());
        if (signature[0] !== 77 || signature[1] !== 80 || signature[2] !== 81) throw new Error(supplied[i].name + ' 不是有效的 MPQ 文件。');
      }
      files = supplied;
      store_mpq_in_db();
      reset_loading_files_screen();
      parse_mpq_files();
    }
  };
  window.addEventListener('error', function (event) { notify('error', '播放器错误：' + event.message); });
  document.addEventListener('DOMContentLoaded', function () {
    document.querySelector('.pregame-drop-copy').textContent = '将 .rep 回放拖到这里';
    document.querySelector('#select_replay_label').textContent = '选择回放文件';
    document.querySelector('.pregame-notes h2').textContent = 'OpenBW 回放播放器';
    document.querySelector('.pregame-notes ul').innerHTML = '<li>支持 StarCraft 1.16.1 回放</li><li>不支持游戏内置 AI 的回放</li><li>左侧可选择本项目的 5 份代表性回放</li><li>Space 暂停 · A 加速 · D 减速</li>';
  });
})();
