import { useState } from 'react';
import { getCustomTools, addTool, removeTool, type CustomTool } from '../data/storage';

function AddToolModal({
  onClose,
  onAdd,
}: {
  onClose: () => void;
  onAdd: (tool: Omit<CustomTool, 'id'>) => void;
}) {
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [icon, setIcon] = useState('🔧');
  const [mode, setMode] = useState<'iframe' | 'jump'>('jump');
  const [desc, setDesc] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !url) return;
    onAdd({ name, url, icon, mode, description: desc });
    onClose();
  };

  const emojiOptions = ['🔧', '🎨', '🌐', '📱', '💻', '🎮', '🎵', '📸', '✏️', '📊', '🛒', '💬'];

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <h2 className="text-xl font-bold text-gray-800 mb-5">添加自定义工具</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm text-gray-600 mb-1 block">名称 *</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="例如：Figma"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:border-purple-400 outline-none"
              required
            />
          </div>
          <div>
            <label className="text-sm text-gray-600 mb-1 block">网址 *</label>
            <input
              type="url"
              value={url}
              onChange={e => setUrl(e.target.value)}
              placeholder="https://..."
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:border-purple-400 outline-none"
              required
            />
          </div>
          <div>
            <label className="text-sm text-gray-600 mb-1 block">图标</label>
            <div className="flex gap-2 flex-wrap">
              {emojiOptions.map(e => (
                <button
                  key={e}
                  type="button"
                  onClick={() => setIcon(e)}
                  className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl transition-all ${
                    icon === e ? 'bg-purple-100 ring-2 ring-purple-400' : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-sm text-gray-600 mb-1 block">打开方式</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setMode('jump')}
                className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  mode === 'jump' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-600'
                }`}
              >
                🔗 新窗口打开
              </button>
              <button
                type="button"
                onClick={() => setMode('iframe')}
                className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  mode === 'iframe' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-600'
                }`}
              >
                📋 页内嵌入
              </button>
            </div>
          </div>
          <div>
            <label className="text-sm text-gray-600 mb-1 block">描述（可选）</label>
            <input
              type="text"
              value={desc}
              onChange={e => setDesc(e.target.value)}
              placeholder="简短描述"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:border-purple-400 outline-none"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              取消
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
            >
              添加
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function MyTools() {
  const [tools, setTools] = useState<CustomTool[]>(getCustomTools());
  const [showAdd, setShowAdd] = useState(false);
  const [embedUrl, setEmbedUrl] = useState<string | null>(null);

  const handleAdd = (tool: Omit<CustomTool, 'id'>) => {
    addTool(tool);
    setTools(getCustomTools());
  };

  const handleRemove = (id: string) => {
    removeTool(id);
    setTools(getCustomTools());
  };

  const handleOpen = (tool: CustomTool) => {
    if (tool.mode === 'iframe') {
      setEmbedUrl(tool.url);
    } else {
      window.open(tool.url, '_blank');
    }
  };

  if (embedUrl) {
    return (
      <div>
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => setEmbedUrl(null)}
            className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors font-medium"
          >
            ← 返回
          </button>
          <span className="text-gray-400">|</span>
          <span className="text-sm text-gray-500 truncate max-w-md">{embedUrl}</span>
        </div>
        <div className="w-full h-[calc(100vh-220px)] rounded-xl overflow-hidden border border-gray-200 bg-white">
          <iframe
            src={embedUrl}
            title="嵌入工具"
            className="w-full h-full"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
          />
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">我的工具集</h1>
          <p className="text-gray-500">自定义常用工具，快速访问</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="px-5 py-2.5 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors font-medium shadow-md shadow-purple-200"
        >
          + 添加工具
        </button>
      </div>

      {tools.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
          <div className="text-6xl mb-4">🧰</div>
          <p className="text-gray-500 mb-2">还没有添加工具</p>
          <p className="text-sm text-gray-400 mb-6">点击上方按钮添加你常用的设计工具</p>
          <button
            onClick={() => setShowAdd(true)}
            className="px-6 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
          >
            添加第一个工具
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {tools.map(tool => (
            <div
              key={tool.id}
              className="relative group bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-lg hover:border-purple-200 transition-all duration-300 cursor-pointer"
              onClick={() => handleOpen(tool)}
            >
              <button
                onClick={e => {
                  e.stopPropagation();
                  handleRemove(tool.id);
                }}
                className="absolute top-2 right-2 w-7 h-7 flex items-center justify-center rounded-full bg-gray-100 text-gray-400 hover:bg-red-100 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
              >
                ×
              </button>
              <div className="text-4xl mb-3">{tool.icon}</div>
              <h3 className="font-semibold text-gray-800">{tool.name}</h3>
              {tool.description && (
                <p className="text-sm text-gray-500 mt-1 line-clamp-2">{tool.description}</p>
              )}
              <div className="mt-2">
                <span className={`px-2 py-0.5 text-xs rounded-full ${
                  tool.mode === 'iframe' ? 'bg-blue-50 text-blue-600' : 'bg-gray-50 text-gray-500'
                }`}>
                  {tool.mode === 'iframe' ? '📋 嵌入' : '🔗 跳转'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {showAdd && <AddToolModal onClose={() => setShowAdd(false)} onAdd={handleAdd} />}
    </div>
  );
}
