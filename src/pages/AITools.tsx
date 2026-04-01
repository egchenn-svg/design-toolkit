import { useState } from 'react';
import { aiTools, categories, categoryIcons, type AITool } from '../data/tools';

function ToolCard({ tool }: { tool: AITool }) {
  const gradientColor = tool.color || 'from-violet-500 to-purple-600';

  return (
    <a
      href={tool.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative block rounded-2xl overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
    >
      {/* 卡片背景 */}
      <div className={`absolute inset-0 bg-gradient-to-br ${gradientColor} opacity-5 group-hover:opacity-10 transition-opacity duration-300`} />
      <div className="relative bg-white border border-gray-200 rounded-2xl p-5 group-hover:border-gray-300 transition-all">
        {/* 图标 + 名称 */}
        <div className="flex items-start justify-between mb-4">
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradientColor} flex items-center justify-center text-2xl shadow-sm`}>
            {tool.icon}
          </div>
          {!tool.free && (
            <span className="px-2 py-0.5 text-[10px] font-medium bg-amber-50 text-amber-600 rounded-full border border-amber-200">
              付费
            </span>
          )}
        </div>

        {/* 文字信息 */}
        <h3 className="font-semibold text-gray-900 group-hover:text-violet-600 transition-colors">
          {tool.name}
        </h3>
        <p className="text-xs text-gray-400 mb-2">{tool.nameEn}</p>
        <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">{tool.description}</p>

        {/* 标签 */}
        <div className="flex flex-wrap gap-1.5 mt-3">
          {tool.tags.slice(0, 3).map(tag => (
            <span key={tag} className="px-2 py-0.5 text-[11px] text-gray-500 bg-gray-50 rounded-md">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </a>
  );
}

export default function AIToolsPage() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('AI 创作工具');

  const filtered = aiTools.filter(tool => {
    const matchSearch =
      !search ||
      tool.name.toLowerCase().includes(search.toLowerCase()) ||
      tool.nameEn.toLowerCase().includes(search.toLowerCase()) ||
      tool.description.includes(search) ||
      tool.tags.some(t => t.includes(search));
    const matchCategory = tool.category === activeCategory;
    return matchSearch && matchCategory;
  });

  const categoryCount = (cat: string) => aiTools.filter(t => t.category === cat).length;

  return (
    <div>
      {/* 页面标题 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">AI 工具库</h1>
        <p className="text-gray-500">精选 {aiTools.length} 款设计师常用工具</p>
      </div>

      {/* 搜索框 */}
      <div className="relative mb-8">
        <input
          type="text"
          placeholder="搜索工具..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full px-5 py-3 pl-12 bg-white border border-gray-200 rounded-xl focus:border-violet-400 focus:ring-2 focus:ring-violet-100 outline-none transition-all text-gray-900 placeholder:text-gray-400"
        />
        <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>

      {/* 分类标签 */}
      <div className="flex gap-3 mb-8">
        {categories.map(cat => {
          const meta = categoryIcons[cat];
          const isActive = activeCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`flex items-center gap-2.5 px-5 py-3 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-violet-50 text-violet-700 border border-violet-200 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100 border border-transparent'
              }`}
            >
              <span className="text-lg">{meta.icon}</span>
              <div className="text-left">
                <div>{cat}</div>
                <div className="text-[11px] text-gray-400 font-normal">{meta.desc} · {categoryCount(cat)}</div>
              </div>
            </button>
          );
        })}
      </div>

      {/* 工具网格 */}
      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">🔍</div>
          <p className="text-gray-400">没有找到匹配的工具</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filtered.map(tool => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>
      )}
    </div>
  );
}
