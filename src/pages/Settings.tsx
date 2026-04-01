import { useState } from 'react';
import { getApiKeys, saveApiKeys, type ApiKeys } from '../data/storage';

export default function Settings() {
  const [keys, setKeys] = useState<ApiKeys>(getApiKeys());
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    saveApiKeys(keys);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">设置</h1>
        <p className="text-gray-500">管理 API Key 和应用配置</p>
      </div>

      <div className="max-w-2xl space-y-6">
        {/* API Keys */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-800 mb-1">API Key 管理</h2>
          <p className="text-sm text-gray-400 mb-5">Key 仅存储在浏览器本地，不会上传到任何服务器</p>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-600 mb-1.5 flex items-center gap-2">
                ✂️ Remove.bg API Key
                <span className="text-xs text-gray-400 font-normal">（可选，抠图增强）</span>
              </label>
              <input
                type="password"
                value={keys.removebg || ''}
                onChange={e => setKeys({ ...keys, removebg: e.target.value })}
                placeholder="输入 Remove.bg API Key..."
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:border-purple-400 outline-none text-gray-700 placeholder:text-gray-400"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600 mb-1.5 flex items-center gap-2">
                📦 TinyPNG API Key
                <span className="text-xs text-gray-400 font-normal">（可选，压缩增强）</span>
              </label>
              <input
                type="password"
                value={keys.tinypng || ''}
                onChange={e => setKeys({ ...keys, tinypng: e.target.value })}
                placeholder="输入 TinyPNG API Key..."
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:border-purple-400 outline-none text-gray-700 placeholder:text-gray-400"
              />
            </div>
          </div>

          <button
            onClick={handleSave}
            className={`mt-6 px-6 py-2.5 rounded-lg font-medium transition-all ${
              saved
                ? 'bg-green-500 text-white'
                : 'bg-purple-600 text-white hover:bg-purple-700'
            }`}
          >
            {saved ? '✓ 已保存' : '保存配置'}
          </button>
        </div>

        {/* 关于 */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-800 mb-1">关于</h2>
          <div className="mt-4 space-y-2 text-sm text-gray-500">
            <p>🛠️ <strong>设计师工具聚合平台</strong> v2.0</p>
            <p>🎨 为设计师打造的一站式工具集</p>
            <p>📱 Built with React + TypeScript + Tailwind CSS</p>
            <p>☁️ 可一键部署到 Vercel</p>
          </div>
        </div>

        {/* 数据管理 */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-800 mb-1">数据管理</h2>
          <p className="text-sm text-gray-400 mb-4">自定义工具和设置存储在浏览器本地</p>
          <button
            onClick={() => {
              if (window.confirm('确定要清除所有本地数据吗？此操作不可恢复。')) {
                localStorage.clear();
                window.location.reload();
              }
            }}
            className="px-5 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors font-medium text-sm"
          >
            🗑️ 清除本地数据
          </button>
        </div>
      </div>
    </div>
  );
}
