import { useRef, useState, useCallback } from 'react';

type Panel = 'compress' | 'cutout' | 'convert' | 'resize';

function EmbedPanel({ url, title, fallbackUrl }: { url: string; title: string; fallbackUrl: string }) {
  const [embedFailed, setEmbedFailed] = useState(false);

  if (embedFailed) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="text-5xl mb-4">🔗</div>
        <p className="text-gray-500 mb-4">嵌入加载失败，请直接访问</p>
        <a
          href={fallbackUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="px-6 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
        >
          前往 {title} →
        </a>
      </div>
    );
  }

  return (
    <div className="w-full h-[600px] rounded-xl overflow-hidden border border-gray-200 bg-white">
      <iframe
        src={url}
        title={title}
        className="w-full h-full"
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
        onError={() => setEmbedFailed(true)}
      />
    </div>
  );
}

export default function ImageWorkshop() {
  const [activePanel, setActivePanel] = useState<Panel>('compress');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [outputWidth, setOutputWidth] = useState(800);
  const [outputHeight, setOutputHeight] = useState(600);
  const [outputFormat, setOutputFormat] = useState('png');
  const [processing, setProcessing] = useState(false);
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
    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  }, []);

  const handleCompress = useCallback(() => {
    if (!selectedFile || !preview) return;
    setProcessing(true);
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
            const a = document.createElement('a');
            a.href = url;
            a.download = `compressed_${selectedFile.name}`;
            a.click();
            URL.revokeObjectURL(url);
          }
          setProcessing(false);
        },
        'image/jpeg',
        0.7
      );
    };
    img.src = preview;
  }, [selectedFile, preview]);

  const handleConvert = useCallback(() => {
    if (!selectedFile || !preview) return;
    setProcessing(true);
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
            const a = document.createElement('a');
            a.href = url;
            a.download = `converted_${selectedFile.name.split('.')[0]}.${outputFormat}`;
            a.click();
            URL.revokeObjectURL(url);
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
            const a = document.createElement('a');
            a.href = url;
            a.download = `resized_${selectedFile.name}`;
            a.click();
            URL.revokeObjectURL(url);
          }
          setProcessing(false);
        },
        `image/${outputFormat}` as string,
        0.92
      );
    };
    img.src = preview;
  }, [selectedFile, preview, outputWidth, outputHeight, outputFormat]);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">图片处理工坊</h1>
        <p className="text-gray-500">压缩、抠图、格式转换、尺寸调整，一站搞定</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* 左侧面板选择 */}
        <div className="space-y-2">
          {panels.map(p => (
            <button
              key={p.key}
              onClick={() => setActivePanel(p.key)}
              className={`w-full text-left px-4 py-3 rounded-xl transition-all ${
                activePanel === p.key
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-200'
                  : 'bg-white text-gray-700 hover:bg-purple-50 border border-gray-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{p.icon}</span>
                <div>
                  <div className="font-medium text-sm">{p.label}</div>
                  <div className={`text-xs ${activePanel === p.key ? 'text-purple-200' : 'text-gray-400'}`}>
                    {p.desc}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* 右侧操作区 */}
        <div className="lg:col-span-3 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          {activePanel === 'cutout' ? (
            <EmbedPanel
              url="https://www.koukoutu.com"
              title="抠图"
              fallbackUrl="https://www.koukoutu.com"
            />
          ) : activePanel === 'compress' && !selectedFile ? (
            <EmbedPanel
              url="https://tinypng.com"
              title="TinyPNG"
              fallbackUrl="https://tinypng.com"
            />
          ) : (
            <div>
              {/* 上传区域 */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center cursor-pointer hover:border-purple-400 hover:bg-purple-50/50 transition-all mb-6"
              >
                {preview ? (
                  <div className="flex flex-col items-center">
                    <img src={preview} alt="预览" className="max-h-48 rounded-lg shadow-sm mb-3" />
                    <p className="text-sm text-gray-500">{selectedFile?.name}</p>
                    <p className="text-xs text-gray-400 mt-1">点击重新选择</p>
                  </div>
                ) : (
                  <div>
                    <div className="text-5xl mb-3">📁</div>
                    <p className="text-gray-600 font-medium">点击或拖拽上传图片</p>
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

              {/* 操作区域 */}
              {activePanel === 'compress' && selectedFile && (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-700">本地压缩</p>
                    <p className="text-sm text-gray-400">压缩为 JPEG，质量约 70%</p>
                  </div>
                  <button
                    onClick={handleCompress}
                    disabled={processing}
                    className="px-6 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors font-medium"
                  >
                    {processing ? '处理中...' : '开始压缩'}
                  </button>
                </div>
              )}

              {activePanel === 'convert' && selectedFile && (
                <div>
                  <p className="font-medium text-gray-700 mb-3">输出格式</p>
                  <div className="flex gap-2 mb-4">
                    {['png', 'jpeg', 'webp'].map(fmt => (
                      <button
                        key={fmt}
                        onClick={() => setOutputFormat(fmt)}
                        className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                          outputFormat === fmt
                            ? 'bg-purple-600 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-purple-50'
                        }`}
                      >
                        {fmt.toUpperCase()}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={handleConvert}
                    disabled={processing}
                    className="px-6 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors font-medium"
                  >
                    {processing ? '处理中...' : '开始转换'}
                  </button>
                </div>
              )}

              {activePanel === 'resize' && selectedFile && (
                <div>
                  <p className="font-medium text-gray-700 mb-3">目标尺寸（像素）</p>
                  <div className="flex gap-4 mb-4">
                    <div>
                      <label className="text-sm text-gray-500 mb-1 block">宽度</label>
                      <input
                        type="number"
                        value={outputWidth}
                        onChange={e => setOutputWidth(Number(e.target.value))}
                        className="w-32 px-3 py-2 border border-gray-200 rounded-lg focus:border-purple-400 outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-gray-500 mb-1 block">高度</label>
                      <input
                        type="number"
                        value={outputHeight}
                        onChange={e => setOutputHeight(Number(e.target.value))}
                        className="w-32 px-3 py-2 border border-gray-200 rounded-lg focus:border-purple-400 outline-none"
                      />
                    </div>
                  </div>
                  <button
                    onClick={handleResize}
                    disabled={processing}
                    className="px-6 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors font-medium"
                  >
                    {processing ? '处理中...' : '开始调整'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
