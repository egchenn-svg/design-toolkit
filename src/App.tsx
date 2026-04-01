import { useState } from 'react';
import AITools from './pages/AITools';
import ImageWorkshop from './pages/ImageWorkshop';
import MyTools from './pages/MyTools';
import Settings from './pages/Settings';

type Page = 'ai-tools' | 'image-workshop' | 'my-tools' | 'settings';

const navItems: { key: Page; label: string; icon: string }[] = [
  { key: 'ai-tools', label: 'AI 工具库', icon: '✨' },
  { key: 'image-workshop', label: '图片工坊', icon: '🖼️' },
  { key: 'my-tools', label: '我的工具', icon: '🧰' },
  { key: 'settings', label: '设置', icon: '⚙️' },
];

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('ai-tools');

  const renderPage = () => {
    switch (currentPage) {
      case 'ai-tools': return <AITools />;
      case 'image-workshop': return <ImageWorkshop />;
      case 'my-tools': return <MyTools />;
      case 'settings': return <Settings />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* 顶部导航 */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="Logo" className="h-9 w-9 rounded-lg object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
              <span className="font-bold text-gray-900 text-lg hidden sm:block">设计师工具箱</span>
            </div>
            <nav className="flex items-center gap-1 bg-gray-100 rounded-2xl p-1">
              {navItems.map(item => (
                <button
                  key={item.key}
                  onClick={() => setCurrentPage(item.key)}
                  className={`px-3 sm:px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-1.5 ${
                    currentPage === item.key
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span className="text-base">{item.icon}</span>
                  <span className="hidden sm:inline">{item.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>
      </header>

      {/* 主内容 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {renderPage()}
      </main>

      {/* 底部 */}
      <footer className="text-center py-6 text-xs text-gray-400">
        Design Toolkit v2.0 · Made with ❤️ for designers
      </footer>
    </div>
  );
}
