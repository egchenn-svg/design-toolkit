import { useState } from 'react';
import { aiTools, categories, type AITool } from '../data/tools';

function ToolCard({ tool }: { tool: AITool }) {
  return (
    <a
      href={tool.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group block bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-lg hover:border-purple-200 hover:-translate-y-1 transition-all duration-300"
    >
      <div className="text-4xl mb-3">{tool.icon}</div>
      <h3 className="font-semibold text-gray-800 group-hover:text-purple-600 transition-colors">
        {tool.name}
      </h3>
      <p className="text-xs text-gray-400 mb-2">{tool.nameEn}</p>
      <p className="text-sm text-gray-500 mb-3 line-clamp-2">{tool.description}</p>
      <div className="flex flex-wrap gap-1.5">
        {tool.tags.map(tag => (
          <span key={tag} className="px-2 py-0.5 text-xs bg-gray-50 text-gray-500 rounded-full">
            {tag}
          </span>
        ))}
        {tool.free && (
          <span className="px-2 py-0.5 text-xs bg-green-50 text-green-600 rounded-full font-medium">
            免费
          </span>
        )}
      </div>
    </a>
  );
}

export default function AIToolsPage() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const filtered = aiTools.filter(tool => {
    const matchSearch =
      tool.name.toLowerCase().includes(search.toLowerCase()) ||
      tool.nameEn.toLowerCase().includes(search.toLowerCase()) ||
      tool.description.includes(search) ||
      tool.tags.some(t => t.includes(search));
    const matchCategory = !activeCategory || tool.category === activeCategory;
    return matchSearch && matchCategory;
  });

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">AI 工具库</h1>
        <p className="text-gray-500">精选 {aiTools.length}+ 款设计师常用 AI 工具</p>
      </div>

      {/* 搜索框 */}
      <div className="relative mb-6">
        <input
          type="text"
          placeholder="搜索工具名称、标签..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full px-5 py-3 pl-12 bg-white rounded-xl border border-gray-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-100 outline-none transition-all text-gray-700 placeholder:text-gray-400"
        />
        <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>

      {/* 分类筛选 */}
      <div className="flex flex-wrap gap-2 mb-8">
        <button
          onClick={() => setActiveCategory(null)}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
            !activeCategory
              ? 'bg-purple-600 text-white shadow-md'
              : 'bg-white text-gray-600 hover:bg-purple-50 border border-gray-200'
          }`}
        >
          全部
        </button>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
              activeCategory === cat
                ? 'bg-purple-600 text-white shadow-md'
                : 'bg-white text-gray-600 hover:bg-purple-50 border border-gray-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* 工具列表 */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <div className="text-5xl mb-4">🔍</div>
          <p>没有找到匹配的工具</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map(tool => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>
      )}
    </div>
  );
}
