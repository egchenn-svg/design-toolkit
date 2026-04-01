import { useRef, useState, useCallback } from 'react';
import { getApiKeys } from '../data/storage';

type Panel = 'compress' | 'cutout' | 'convert' | 'resize';

export default function ImageWorkshop() {
  const [activePanel, setActivePanel] = useState<Panel>('compress');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultSize, setResultSize] = useState<string>('');
  const [outputWidth, setOutputWidth] = useState(800);
  const [outputHeight, setOutputHeight] = useState(600);
  const [outputFormat, setOutputFormat] = useState('png');
  const [quality, setQuality] = useState(0.7);
  const [processing, setProcessing] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const panels: { key: Panel; label: string; icon: string; desc: string }[] = [
    { key: 'compress', label: '图片压缩', icon: '📦', desc: '高质量压缩图片' },
    { key: 'cutout', label: '智能抠图', icon: '✂️', desc: '一键去除背景' },
    { key: 'convert', label: '格式转换', icon: '🔄', desc: '支持多种格式互转' },
    { key: 'resize', label: '尺寸调整', icon: '📐', desc: '自定义图片尺寸' },
  ];

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setResultUrl(null);
    setResultSize('');
    setStatusMsg('');
    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  }, []);

  const resetResult = () => {
    setResultUrl(null);
    setResultSize('');
    setStatusMsg('');
  };

  const handlePanelChange = (p: Panel) => {
    setActivePanel(p);
    resetResult();
  };

  const handleCompress = useCallback(() => {
    if (!selectedFile || !preview) return;
    setProcessing(true);
    setStatusMsg('压缩中...');
    resetResult();
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0);
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            setResultUrl(url);
            const sizeKB = (blob.size / 1024).toFixed(1);
            const origKB = (selectedFile.size / 1024).toFixed(1);
            const ratio = blob.size / selectedFile.size;
            const saved = ((1 - ratio) * 100).toFixed(1);
            if (ratio >= 1) {
              setResultSize(`${origKB}KB → ${sizeKB}KB (原文件已很小，压缩后反而略大)`);
            } else {
              setResultSize(`${origKB}KB → ${sizeKB}KB (省 ${saved}%)`);
            }
            setStatusMsg('');
          }
          setProcessing(false);
        },
        'image/jpeg',
        quality
      );
    };
    img.src = preview;
  }, [selectedFile, preview, quality]);

  const handleCutout = useCallback(async () => {
    if (!selectedFile) return;

    const { removebg: apiKey } = getApiKeys();
    if (!apiKey) {
      setStatusMsg('请先在设置页配置 Remove.bg API Key');
      setTimeout(() => setStatusMsg(''), 4000);
      return;
    }

    setProcessing(true);
    setStatusMsg('抠图中...');
    resetResult();

    try {
      const formData = new FormData();
      formData.append('image_file', selectedFile);

      const res = await fetch('https://api.remove.bg/v1.0/removebg', {
        method: 'POST',
        headers: { 'X-Api-Key': apiKey },
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData?.errors?.[0]?.title || `API 错误 (${res.status})`);
      }

      const blob = await res.blob();
      if (blob.size < 100) {
        throw new Error('返回结果异常，可能额度已用完');
      }
      const url = URL.createObjectURL(blob);
      setResultUrl(url);
      setResultSize('已去除背景');
      setStatusMsg('');
    } catch (err) {
      const msg = err instanceof Error ? err.message : '抠图失败';
      setStatusMsg(`抠图失败：${msg}`);
    }
    setProcessing(false);
  }, [selectedFile]);

  const handleConvert = useCallback(() => {
    if (!selectedFile || !preview) return;
    setProcessing(true);
    setStatusMsg('转换中...');
    resetResult();
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0);
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            setResultUrl(url);
            setResultSize(`${(blob.size / 1024).toFixed(1)}KB`);
            setStatusMsg('');
          }
          setProcessing(false);
        },
        `image/${outputFormat}` as string,
        0.92
      );
    };
    img.src = preview;
  }, [selectedFile, preview, outputFormat]);

  const handleResize = useCallback(() => {
    if (!selectedFile || !preview) return;
    setProcessing(true);
    setStatusMsg('调整中...');
    resetResult();
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = outputWidth;
      canvas.height = outputHeight;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, outputWidth, outputHeight);
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            setResultUrl(url);
            setResultSize(`${outputWidth} × ${outputHeight} · ${(blob.size / 1024).toFixed(1)}KB`);
            setStatusMsg('');
          }
          setProcessing(false);
        },
        `image/${outputFormat}` as string,
        0.92
      );
    };
    img.src = preview;
  }, [selectedFile, preview, outputWidth, outputHeight, outputFormat]);

  const handleDownload = () => {
    if (!resultUrl || !selectedFile) return;
    const a = document.createElement('a');
    a.href = resultUrl;
    const ext = activePanel === 'compress' ? 'jpg' : activePanel === 'cutout' ? 'png' : outputFormat;
    const prefix = activePanel === 'compress' ? 'compressed' : activePanel === 'cutout' ? 'cutout' : activePanel === 'convert' ? 'converted' : 'resized';
    a.download = `${prefix}_${selectedFile.name.split('.')[0]}.${ext}`;
    a.click();
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">图片处理工坊</h1>
        <p className="text-gray-500">压缩、抠图、格式转换、尺寸调整，一站搞定</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* 左侧面板选择 */}
        <div className="space-y-2">
          {panels.map(p => (
            <button
              key={p.key}
              onClick={() => handlePanelChange(p.key)}
              className={`w-full text-left px-4 py-3.5 rounded-xl transition-all ${
                activePanel === p.key
                  ? 'bg-violet-50 text-violet-700 border border-violet-200 shadow-sm'
                  : 'bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-900 border border-gray-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{p.icon}</span>
                <div>
                  <div className="font-medium text-sm">{p.label}</div>
                  <div className={`text-xs ${activePanel === p.key ? 'text-violet-500' : 'text-gray-400'}`}>
                    {p.desc}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* 右侧操作区 */}
        <div className="lg:col-span-3 bg-white rounded-2xl p-6 border border-gray-200">
          {/* 上传区域 */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center cursor-pointer hover:border-violet-300 hover:bg-violet-50/30 transition-all mb-6"
          >
            {preview ? (
              <div className="flex flex-col items-center">
                <img src={preview} alt="预览" className="max-h-48 rounded-lg shadow mb-3" />
                <p className="text-sm text-gray-600">{selectedFile?.name}</p>
                <p className="text-xs text-gray-400 mt-1">点击重新选择</p>
              </div>
            ) : (
              <div>
                <div className="text-5xl mb-3">📁</div>
                <p className="text-gray-700 font-medium">点击或拖拽上传图片</p>
                <p className="text-sm text-gray-400 mt-1">支持 JPG / PNG / WebP</p>
              </div>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileSelect}
          />

          {/* 状态消息 */}
          {statusMsg && (
            <div className={`mb-4 px-4 py-2.5 text-sm rounded-lg border ${
              statusMsg.includes('失败') || statusMsg.includes('请先')
                ? 'text-amber-700 bg-amber-50 border-amber-200'
                : 'text-violet-700 bg-violet-50 border-violet-200'
            }`}>
              {statusMsg}
            </div>
          )}

          {/* 操作区域 */}
          {selectedFile && !resultUrl && (
            <div>
              {/* 压缩面板 */}
              {activePanel === 'compress' && (
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="font-medium text-gray-700">压缩质量</label>
                      <span className="text-sm text-gray-500">{Math.round(quality * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0.1"
                      max="1"
                      step="0.05"
                      value={quality}
                      onChange={e => setQuality(Number(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-violet-500"
                    />
                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                      <span>高压缩</span>
                      <span>高质量</span>
                    </div>
                  </div>
                  <button
                    onClick={handleCompress}
                    disabled={processing}
                    className="w-full px-6 py-3 bg-violet-500 text-white rounded-xl hover:bg-violet-600 disabled:opacity-50 transition-colors font-medium"
                  >
                    {processing ? '处理中...' : '开始压缩'}
                  </button>
                </div>
              )}

              {/* 抠图面板 */}
              {activePanel === 'cutout' && (
                <div>
                  <p className="text-sm text-gray-500 mb-4">使用 Remove.bg AI 去除图片背景，需要 API Key</p>
                  <div className="flex gap-3">
                    <button
                      onClick={handleCutout}
                      disabled={processing}
                      className="flex-1 px-6 py-3 bg-violet-500 text-white rounded-xl hover:bg-violet-600 disabled:opacity-50 transition-colors font-medium"
                    >
                      {processing ? '抠图中...' : '开始抠图'}
                    </button>
                    <a
                      href="https://www.remove.bg/api"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-3 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-colors font-medium text-sm"
                    >
                      获取 Key
                    </a>
                  </div>
                </div>
              )}

              {/* 格式转换面板 */}
              {activePanel === 'convert' && (
                <div>
                  <p className="font-medium text-gray-700 mb-3">输出格式</p>
                  <div className="flex gap-2 mb-4">
                    {['png', 'jpeg', 'webp'].map(fmt => (
                      <button
                        key={fmt}
                        onClick={() => setOutputFormat(fmt)}
                        className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                          outputFormat === fmt
                            ? 'bg-violet-500 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {fmt.toUpperCase()}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={handleConvert}
                    disabled={processing}
                    className="w-full px-6 py-3 bg-violet-500 text-white rounded-xl hover:bg-violet-600 disabled:opacity-50 transition-colors font-medium"
                  >
                    {processing ? '处理中...' : '开始转换'}
                  </button>
                </div>
              )}

              {/* 尺寸调整面板 */}
              {activePanel === 'resize' && (
                <div>
                  <p className="font-medium text-gray-700 mb-3">目标尺寸（像素）</p>
                  <div className="flex gap-4 mb-4">
                    <div>
                      <label className="text-sm text-gray-500 mb-1 block">宽度</label>
                      <input
                        type="number"
                        value={outputWidth}
                        onChange={e => setOutputWidth(Number(e.target.value))}
                        className="w-32 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:border-violet-400 outline-none text-gray-900"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-gray-500 mb-1 block">高度</label>
                      <input
                        type="number"
                        value={outputHeight}
                        onChange={e => setOutputHeight(Number(e.target.value))}
                        className="w-32 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:border-violet-400 outline-none text-gray-900"
                      />
                    </div>
                  </div>
                  <button
                    onClick={handleResize}
                    disabled={processing}
                    className="w-full px-6 py-3 bg-violet-500 text-white rounded-xl hover:bg-violet-600 disabled:opacity-50 transition-colors font-medium"
                  >
                    {processing ? '处理中...' : '开始调整'}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* 结果预览 */}
          {resultUrl && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-700">处理结果</p>
                  {resultSize && <p className="text-sm text-gray-500">{resultSize}</p>}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={resetResult}
                    className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors font-medium text-sm"
                  >
                    重新处理
                  </button>
                  <button
                    onClick={handleDownload}
                    className="px-5 py-2 bg-violet-500 text-white rounded-lg hover:bg-violet-600 transition-colors font-medium text-sm"
                  >
                    ⬇ 下载
                  </button>
                </div>
              </div>
              {/* 抠图结果需要棋盘格背景显示透明度 */}
              <div
                className={`rounded-xl overflow-hidden max-h-96 flex items-center justify-center ${
                  activePanel === 'cutout' ? 'bg-[url("data:image/svg+xml,%3Csvg width=\'20\' height=\'20\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Crect width=\'10\' height=\'10\' fill=\'%23ccc\'/%3E%3Crect x=\'10\' y=\'10\' width=\'10\' height=\'10\' fill=\'%23ccc\'/%3E%3Crect x=\'10\' width=\'10\' height=\'10\' fill=\'%23fff\'/%3E%3Crect y=\'10\' width=\'10\' height=\'10\' fill=\'%23fff\'/%3E%3C/svg%3E")]' : 'bg-gray-50'
                }`}
              >
                <img src={resultUrl} alt="处理结果" className="max-h-96 object-contain" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
