import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Settings2,
  LogOut,
  Search,
  Bell,
  Zap,
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import clsx from 'clsx';
import AgentControlPanel from './agent/AgentControlPanel';

// ─── 네비게이션 정의 ─────────────────────────────────────

const navItems = [
  { to: '/dashboard', label: '홈' },
  { to: '/report', label: '리포트' },
  { to: '/workspace', label: '워크스페이스' },
  { to: '/settings', label: '설정' },
];

// ─── 컴포넌트 ────────────────────────────────────────────

export default function Layout() {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [accountOpen, setAccountOpen] = useState(false);
  const accountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (accountRef.current && !accountRef.current.contains(e.target as Node)) {
        setAccountOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f9fafb]">
      {/* ── 상단 헤더 바 ── */}
      <header className="h-16 flex items-center justify-between px-6 border-b border-gray-200 bg-white flex-shrink-0 z-30">
        {/* 좌측: 로고 */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gray-900 flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-lg text-gray-900 tracking-tight">ProofWork</span>
        </div>

        {/* 중앙: 필 네비게이션 */}
        <nav className="flex items-center gap-1 bg-gray-100 rounded-full px-1.5 py-1">
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.to);
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={clsx(
                  'px-5 py-1.5 rounded-full text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-gray-900 text-white shadow-sm'
                    : 'text-gray-500 hover:text-gray-900',
                )}
              >
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        {/* 우측: 검색 + 알림 + 계정 */}
        <div className="flex items-center gap-3">
          <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors">
            <Search className="w-4 h-4" />
          </button>
          <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors relative">
            <Bell className="w-4 h-4" />
            {!profile?.agentConnected && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500" />
            )}
          </button>

          {/* 계정 드롭다운 */}
          <div ref={accountRef} className="relative">
            <button
              onClick={() => setAccountOpen(p => !p)}
              className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-brand-500 text-white text-sm font-bold flex items-center justify-center">
                {(profile?.displayName ?? 'U')[0].toUpperCase()}
              </div>
            </button>

            {accountOpen && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl border border-gray-200 py-2 z-50 animate-fade-in shadow-lg shadow-gray-200/50">
                <div className="px-4 py-3 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-brand-500 text-white font-bold text-sm flex items-center justify-center">
                      {(profile?.displayName ?? 'U')[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{profile?.displayName}</p>
                      <p className="text-xs text-gray-400 truncate">{profile?.email}</p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => { setAccountOpen(false); navigate('/settings'); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  <Settings2 className="w-4 h-4" />
                  <span>설정</span>
                </button>

                <div className="border-t border-gray-100 mt-1 pt-1">
                  <button
                    onClick={() => { setAccountOpen(false); handleSignOut(); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>로그아웃</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ── 페이지 콘텐츠 ── */}
      <main className="flex-1 p-6 lg:p-8 pb-24 max-w-[1440px] mx-auto w-full">
        <Outlet />
      </main>

      {/* ── 플로팅 추적 바 ── */}
      <AgentControlPanel />
    </div>
  );
}
