<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no,viewport-fit=cover">
<meta name="theme-color" content="#0b0a1a">
<title>全国车牌识别系统 · H5版</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; -webkit-tap-highlight-color: transparent; }
  :root {
    --blue: #0066ff;
    --blue-light: #00aaff;
    --text: #eef2ff;
    --muted: #9aa0b8;
    --card: rgba(255,255,255,.045);
    --line: rgba(255,255,255,.08);
  }
  html, body { height: 100%; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
    background: #0b0a1a;
    background-image: radial-gradient(900px 520px at 50% -12%, #002255 0%, rgba(11,10,26,0) 70%);
    color: var(--text);
    display: flex; flex-direction: column; align-items: center;
    min-height: 100dvh; padding: 10px 14px calc(20px + env(safe-area-inset-bottom));
    overflow-x: hidden; user-select: none; -webkit-user-select: none;
  }
  input { user-select: text; -webkit-user-select: text; }
  
  /* 头部 */
  .header { width: 100%; max-width: 520px; text-align: center; padding: 8px 0 4px; }
  .header h1 {
    font-size: 20px; font-weight: 800; letter-spacing: .5px;
    background: linear-gradient(90deg, #00aaff, #00d2ff 60%, #0066ff);
    -webkit-background-clip: text; background-clip: text; color: transparent;
  }
  .header p { margin-top: 6px; font-size: 12px; color: var(--muted); line-height: 1.5; }
  
  /* 卡片 */
  .card { width: 100%; max-width: 520px; background: var(--card); border: 1px solid var(--line); border-radius: 16px; padding: 14px; margin-top: 12px; }
  .card-title { font-size: 13px; font-weight: 800; color: #fff; display: flex; align-items: center; gap: 6px; margin-bottom: 10px; }
  
  /* 上传区 */
  .upload-zone {
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    border: 2px dashed rgba(0,170,255,.35); border-radius: 14px;
    padding: 28px 16px; cursor: pointer; transition: .22s;
    background: rgba(0,170,255,.04); text-align: center;
  }
  .upload-zone:active { transform: scale(.985); background: rgba(0,170,255,.08); }
  .upload-zone .big-ico { font-size: 40px; margin-bottom: 10px; line-height: 1; }
  .upload-zone .hint { font-size: 13px; color: #ccefff; font-weight: 700; }
  .upload-zone .sub { font-size: 11px; color: var(--muted); margin-top: 5px; line-height: 1.5; }
  .upload-zone input { display: none; }
  
  /* 预览区 */
  .preview-wrap { position: relative; display: none; border-radius: 12px; overflow: hidden; background: #000; margin-bottom: 10px; }
  .preview-wrap.show { display: block; }
  .preview-wrap img { width: 100%; height: auto; display: block; max-height: 340px; object-fit: contain; }
  .preview-wrap .scan-line {
    position: absolute; left: 0; right: 0; height: 2px;
    background: linear-gradient(90deg, transparent, #00d2ff, transparent);
    box-shadow: 0 0 12px #00d2ff;
    animation: scan 2.2s ease-in-out infinite; opacity: 0;
  }
  .preview-wrap.scanning .scan-line { opacity: 1; }
  @keyframes scan { 0%, 100% { top: 0; } 50% { top: calc(100% - 2px); } }
  
  /* 按钮 */
  .btn {
    width: 100%; padding: 12px; border: 0; border-radius: 12px;
    font-size: 14px; font-weight: 800; font-family: inherit;
    cursor: pointer; transition: .2s;
    display: flex; align-items: center; justify-content: center; gap: 6px; margin-top: 10px;
  }
  .btn-primary { background: linear-gradient(135deg, #0066ff, #00aaff); color: #fff; box-shadow: 0 6px 18px rgba(0,102,255,.38); }
  .btn-primary:active { transform: scale(.97); }
  .btn-primary:disabled { opacity: .45; box-shadow: none; cursor: default; transform: none; }
  
  /* 结果区 */
  .result-box { display: none; margin-top: 12px; padding: 14px; border-radius: 12px; background: rgba(0,170,255,.07); border: 1px solid rgba(0,170,255,.22); }
  .result-box.show { display: block; }
  .result-row { display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px dashed rgba(255,255,255,.08); font-size: 13px; }
  .result-row:last-child { border-bottom: 0; }
  .result-row .label { color: var(--muted); }
  .result-row .value { color: #fff; font-weight: 800; text-align: right; max-width: 65%; }
  .result-row .value.plate { font-size: 20px; letter-spacing: 3px; color: #00d2ff; font-family: "Courier New", monospace; }

  /* 新增：置信度提示 */
  .confidence-note {
    margin-top: 10px;
    padding-top: 10px;
    border-top: 1px dashed rgba(255,255,255,.08);
    font-size: 11px;
    color: #7c81a3;
    line-height: 1.6;
    display: flex;
    align-items: flex-start;
    gap: 6px;
  }
  .confidence-note .icon {
    font-size: 12px;
    color: #00aaff;
    flex-shrink: 0;
    margin-top: 1px;
  }

  /* Toast */
  .toast {
    position: fixed; left: 50%; top: 16%; transform: translate(-50%, -14px);
    background: rgba(20,18,42,.96); border: 1px solid rgba(255,255,255,.12);
    color: #fff; font-size: 13px; font-weight: 600;
    padding: 10px 18px; border-radius: 12px;
    opacity: 0; pointer-events: none; transition: .25s; z-index: 80;
    white-space: nowrap; box-shadow: 0 10px 30px rgba(0,0,0,.5);
  }
  .toast.show { opacity: 1; transform: translate(-50%, 0); }
  
  /* 底部 */
  .footer { width: 100%; max-width: 520px; margin-top: 16px; text-align: center; font-size: 10.5px; color: #5f6480; line-height: 1.7; }
  
  @media (max-width: 380px) {
    .header h1 { font-size: 17px; }
    .result-row .value.plate { font-size: 17px; }
  }
</style>
</head>
<body>

<div class="header">
  <h1>🚗 全国车牌识别系统</h1>
  <p>拍照 / 上传车牌照片 · 阿里云AI实时识别</p>
</div>

<!-- 上传区 -->
<div class="card">
  <div class="card-title"><span>📷</span>上传车牌照片</div>
  <div class="preview-wrap" id="previewWrap">
    <img id="previewImg" alt="车牌预览">
    <div class="scan-line"></div>
  </div>
  <label class="upload-zone" id="uploadZone">
    <div class="big-ico">📸</div>
    <div class="hint">点击拍照或选择图片</div>
    <div class="sub">支持 JPG / PNG，建议车牌清晰、光线充足</div>
    <input type="file" id="fileInput" accept="image/*" capture="environment">
  </label>
  <button class="btn btn-primary" id="analyzeBtn" disabled>
    <span>🔍</span><span>开始识别</span>
  </button>
</div>

<!-- 结果区 -->
<div class="card" id="resultCard" style="display:none">
  <div class="card-title"><span>📋</span>识别结果</div>
  <div class="result-box show" id="resultBox">
    <div class="result-row">
      <span class="label">车牌号码</span>
      <span class="value plate" id="rPlate">—</span>
    </div>
    <div class="result-row">
      <span class="label">车牌颜色</span>
      <span class="value" id="rColor">—</span>
    </div>
    <div class="result-row">
      <span class="label">车牌类型</span>
      <span class="value" id="rType">—</span>
    </div>
    <div class="result-row">
      <span class="label">置信度</span>
      <span class="value" id="rConf">—</span>
    </div>

    <!-- 新增提示：置信度为模拟数据 -->
    <div class="confidence-note">
      <span class="icon">ⓘ</span>
      <span>置信度为模拟数据：多模态大模型的输出不包含置信度，此处数值仅供展示。</span>
    </div>
  </div>
</div>

<div class="footer">
  全国车牌识别系统 · 阿里云百炼AI驱动<br>
  数据仅供参考 · 请遵守相关法律法规
</div>

<div class="toast" id="toast"></div>

<script>
  // ⚠️ 这里已经帮您填好了 Vercel 的后端地址，无需修改！
  const API_URL = 'https://plate-recognizer-backend.vercel.app/api/recognize';

  const toastEl = document.getElementById('toast');
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastEl._t);
    toastEl._t = setTimeout(() => toastEl.classList.remove('show'), 1800);
  }

  const fileInput = document.getElementById('fileInput');
  const previewWrap = document.getElementById('previewWrap');
  const previewImg = document.getElementById('previewImg');
  const analyzeBtn = document.getElementById('analyzeBtn');
  const resultCard = document.getElementById('resultCard');
  let currentBase64 = null;

  // 处理图片上传
  fileInput.addEventListener('change', (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      toast('请选择图片文件');
      return;
    }
    
    if (file.size > 10 * 1024 * 1024) {
      toast('图片不能超过 10MB，请压缩后重试');
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      previewImg.src = ev.target.result;
      previewWrap.classList.add('show');
      analyzeBtn.disabled = false;
      resultCard.style.display = 'none';
      
      // 提取 Base64（去掉 data:image/jpeg;base64, 前缀）
      currentBase64 = ev.target.result.split(',')[1];
      toast('图片已加载，点击「开始识别」');
    };
    reader.readAsDataURL(file);
  });

  // 处理识别请求
  analyzeBtn.addEventListener('click', async () => {
    if (!currentBase64) {
      toast('请先上传车牌照片');
      return;
    }
    
    analyzeBtn.disabled = true;
    analyzeBtn.innerHTML = '<span>⏳</span><span>识别中...</span>';
    previewWrap.classList.add('scanning');

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: currentBase64 })
      });

      const data = await response.json();

      if (data.success) {
        document.getElementById('rPlate').textContent = data.plate || '未识别';
        document.getElementById('rColor').textContent = data.color || '—';
        document.getElementById('rType').textContent = data.type || '—';
        document.getElementById('rConf').textContent = data.confidence
          ? (data.confidence * 100).toFixed(1) + '%' : '—';
        
        resultCard.style.display = 'block';
        toast('✅ 识别成功');
        resultCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      } else {
        toast('❌ ' + (data.error || '识别失败'));
      }
    } catch (err) {
      console.error(err);
      toast('❌ 网络错误，请检查网络后重试');
    } finally {
      analyzeBtn.disabled = false;
      analyzeBtn.innerHTML = '<span>🔍</span><span>开始识别</span>';
      previewWrap.classList.remove('scrolling');
    }
  });
</script>
</body>
</html>
