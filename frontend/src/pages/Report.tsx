import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useEmployeeDashboard } from '../hooks/usePerformance';
import clsx from 'clsx';
import {
  Brain,
  Search,
  TrendingUp,
  BarChart3,
  Sparkles,
  MoreHorizontal,
  Clock,
  FileText,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from 'recharts';

// ─── 데모 데이터 ──────────────────────────────────────────

const DEMO_CATEGORY_DATA = [
  { name: '코딩/디버깅', value: 45, color: '#3b82f6' },
  { name: '문서/기획', value: 30, color: '#8b5cf6' },
  { name: '커뮤니케이션', value: 15, color: '#f59e0b' },
  { name: '리서치', value: 10, color: '#06b6d4' },
];

const DEMO_WEEKLY_DATA = Array.from({ length: 7 }, (_, i) => {
  const date = new Date();
  date.setDate(date.getDate() - (6 - i));
  const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
  return {
    day: dayNames[date.getDay()],
    date: `${date.getMonth() + 1}/${date.getDate()}`,
    totalHours: 5 + Math.random() * 4,
    activeHours: 4 + Math.random() * 3,
    deepFocus: 1.5 + Math.random() * 2.5,
  };
});

const DEMO_FOCUS_TREND = Array.from({ length: 14 }, (_, i) => {
  const date = new Date();
  date.setDate(date.getDate() - (13 - i));
  return {
    date: `${date.getMonth() + 1}/${date.getDate()}`,
    focus: 55 + Math.random() * 35,
    efficiency: 50 + Math.random() * 40,
  };
});

const DEMO_SPARK = [2, 5, 3, 7, 4, 8, 6, 9, 5, 7, 8, 10];

const DEMO_DAILY_LOG = [
  { time: '09:30', task: 'CORS 에러 디버깅', category: '개발', duration: '1h 20m', focus: 88 },
  { time: '11:00', task: '결제 API 연동 테스트', category: '개발', duration: '2h 10m', focus: 92 },
  { time: '14:00', task: '기획 문서 검토 및 피드백', category: '기획', duration: '45m', focus: 65 },
  { time: '15:30', task: 'UI 컴포넌트 리팩토링', category: '개발', duration: '1h 50m', focus: 85 },
  { time: '17:30', task: '팀 스탠드업 미팅', category: '커뮤니케이션', duration: '30m', focus: 70 },
];

// ─── 메인 컴포넌트 ───────────────────────────────────────

export default function Report() {
  const { profile } = useAuth();
  const userId = profile?.uid ?? '';
  const { todayMetrics, averages, loading } = useEmployeeDashboard(userId);
  const [period, setPeriod] = useState<'week' | 'month'>('week');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMetric, setSelectedMetric] = useState(0);

  const weeklyDeepWork = DEMO_WEEKLY_DATA.reduce((sum, d) => sum + d.deepFocus, 0);
  const weeklyActive = DEMO_WEEKLY_DATA.reduce((sum, d) => sum + d.activeHours, 0);
  const bestFocusHour = '14:00~16:00';
  const contextSwitches = 23;
  const avgFocus = averages?.avgFocus ?? 72;
  const avgEfficiency = averages?.avgEfficiency ?? 68;
  const avgOutput = averages?.avgOutputScore ?? 78;

  const metricTabs = [
    { label: '평균 집중도', value: `${avgFocus.toFixed(1)}%`, key: 0 },
    { label: '평균 효율성', value: `${avgEfficiency.toFixed(1)}%`, key: 1 },
    { label: '딥워크 시간', value: `${weeklyDeepWork.toFixed(1)}h`, key: 2 },
    { label: '활동 시간', value: `${weeklyActive.toFixed(1)}h`, key: 3 },
    { label: '생산성 지수', value: `${avgOutput.toFixed(0)}점`, key: 4 },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-gray-200 border-t-brand-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-fade-in">
      {/* ── 서브 탭 ── */}
      <div className="flex items-center justify-between border-b border-gray-200">
        <div className="flex items-center gap-6">
          {([
            { key: 'week' as const, label: '주간 리포트' },
            { key: 'month' as const, label: '월간 리포트' },
          ]).map(tab => (
            <button
              key={tab.key}
              onClick={() => setPeriod(tab.key)}
              className={clsx(
                'pb-3 text-sm font-medium transition-colors relative',
                period === tab.key
                  ? 'text-gray-900 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-gray-900'
                  : 'text-gray-400 hover:text-gray-700',
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-400 pb-3">나의 치열한 과정을 증명하는 공간</p>
      </div>

      {/* ── Metric tabs row ── */}
      <div className="grid grid-cols-5 gap-3">
        {metricTabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setSelectedMetric(tab.key)}
            className={clsx(
              'rounded-xl px-4 py-3.5 text-left transition-all border',
              selectedMetric === tab.key
                ? 'bg-gray-900 border-gray-900 shadow-lg shadow-gray-900/10'
                : 'bg-white border-gray-200 hover:bg-gray-50',
            )}
          >
            <p className={clsx(
              'text-[11px] font-medium mb-1',
              selectedMetric === tab.key ? 'text-white/70' : 'text-gray-400',
            )}>
              {tab.label}
            </p>
            <p className={clsx(
              'text-lg font-extrabold',
              selectedMetric === tab.key ? 'text-white' : 'text-gray-900',
            )}>
              {tab.value}
            </p>
          </button>
        ))}
      </div>

      {/* ── 2-column 메인 레이아웃 ── */}
      <div className="grid lg:grid-cols-5 gap-5">

        {/* 좌측 (3/5) */}
        <div className="lg:col-span-3 space-y-5">

          {/* 딥워크 분석 카드 */}
          <div className="rounded-2xl bg-white border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-brand-500/10 flex items-center justify-center">
                  <Brain className="w-6 h-6 text-brand-500" />
                </div>
                <h3 className="text-base font-bold text-gray-900">딥워크 분석</h3>
              </div>
              <button className="p-1 rounded-lg hover:bg-gray-100 text-gray-400"><MoreHorizontal className="w-4 h-4" /></button>
            </div>
            <div className="flex items-center gap-6 mb-5">
              <div className="px-4 py-2 rounded-xl bg-gray-50">
                <span className="text-[11px] text-gray-400 block mb-0.5">주간 딥워크</span>
                <span className="text-xl font-extrabold text-gray-900">{weeklyDeepWork.toFixed(1)}<span className="text-xs text-gray-400 ml-0.5">h</span></span>
              </div>
              <div className="px-4 py-2 rounded-xl bg-gray-50">
                <span className="text-[11px] text-gray-400 block mb-0.5">최고 집중 시간대</span>
                <span className="text-lg font-extrabold text-gray-900">{bestFocusHour}</span>
              </div>
            </div>
            <div className="flex items-end justify-between pt-4 border-t border-gray-100">
              <span className="text-sm text-gray-500">평균 집중도</span>
              <span className="text-4xl font-extrabold text-gray-900 tracking-tight">{avgFocus.toFixed(1)}<span className="text-lg text-gray-400 ml-0.5">%</span></span>
            </div>
          </div>

          {/* 생산성 분석 카드 */}
          <div className="rounded-2xl bg-white border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-emerald-500" />
                </div>
                <h3 className="text-base font-bold text-gray-900">생산성 분석</h3>
              </div>
              <button className="p-1 rounded-lg hover:bg-gray-100 text-gray-400"><MoreHorizontal className="w-4 h-4" /></button>
            </div>
            <div className="flex items-center gap-6 mb-5">
              <div className="px-4 py-2 rounded-xl bg-gray-50">
                <span className="text-[11px] text-gray-400 block mb-0.5">컨텍스트 스위칭</span>
                <span className="text-xl font-extrabold text-gray-900">{contextSwitches}<span className="text-xs text-gray-400 ml-0.5">회</span></span>
              </div>
              <div className="px-4 py-2 rounded-xl bg-gray-50">
                <span className="text-[11px] text-gray-400 block mb-0.5">생산성 지수</span>
                <span className="text-xl font-extrabold text-gray-900">{avgOutput.toFixed(0)}<span className="text-xs text-gray-400 ml-0.5">점</span></span>
              </div>
            </div>
            <div className="flex items-end justify-between pt-4 border-t border-gray-100">
              <span className="text-sm text-gray-500">평균 효율성</span>
              <span className="text-4xl font-extrabold text-gray-900 tracking-tight">{avgEfficiency.toFixed(1)}<span className="text-lg text-gray-400 ml-0.5">%</span></span>
            </div>
          </div>

          {/* 검색 */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="업무 로그 검색... (예: 'CORS 에러', '결제 API')"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:border-brand-500/50 transition-colors"
            />
          </div>

          {/* 일별 시간 차트 */}
          <div className="rounded-2xl bg-white border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-brand-500" />
                <h3 className="text-sm font-semibold text-gray-900">일별 업무 시간</h3>
              </div>
              <button className="p-1 rounded-lg hover:bg-gray-100 text-gray-400"><MoreHorizontal className="w-4 h-4" /></button>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={DEMO_WEEKLY_DATA} barCategoryGap="20%">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis dataKey="day" tick={{ fill: '#9ca3af', fontSize: 12 }} axisLine={false} />
                  <YAxis tick={{ fill: '#9ca3af', fontSize: 12 }} axisLine={false} unit="h" />
                  <Tooltip contentStyle={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '12px', color: '#1e293b' }} />
                  <Bar dataKey="totalHours" name="총 시간" fill="#e5e7eb" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="activeHours" name="활성 시간" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="deepFocus" name="딥포커스" fill="#6366f1" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 집중도/효율성 트렌드 */}
          <div className="rounded-2xl bg-white border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-500" />
                <h3 className="text-sm font-semibold text-gray-900">집중도 & 효율성 트렌드</h3>
              </div>
              <button className="p-1 rounded-lg hover:bg-gray-100 text-gray-400"><MoreHorizontal className="w-4 h-4" /></button>
            </div>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={DEMO_FOCUS_TREND}>
                  <defs>
                    <linearGradient id="rFocusGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="rEffGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis dataKey="date" tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} />
                  <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} domain={[0, 100]} />
                  <Tooltip contentStyle={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '12px', color: '#1e293b' }} />
                  <Area type="monotone" dataKey="focus" name="집중도" stroke="#3b82f6" fill="url(#rFocusGrad)" strokeWidth={2} />
                  <Area type="monotone" dataKey="efficiency" name="효율성" stroke="#10b981" fill="url(#rEffGrad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* 우측 (2/5) */}
        <div className="lg:col-span-2 space-y-5">

          {/* 리포트 요약 */}
          <div className="rounded-2xl bg-white border border-gray-200 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-gray-900">{period === 'week' ? '주간' : '월간'} 요약</h3>
              <button className="p-1 rounded-lg hover:bg-gray-100 text-gray-400"><MoreHorizontal className="w-4 h-4" /></button>
            </div>
            <div className="flex items-baseline gap-2 mb-5">
              <span className="text-4xl font-extrabold text-gray-900">{((avgFocus + avgEfficiency) / 2).toFixed(1)}</span>
              <span className="text-sm text-gray-400">종합 점수</span>
              <span className="ml-auto text-xs font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">▲ 3.2%</span>
            </div>
            <div className="space-y-3 pt-4 border-t border-gray-100">
              {[
                { label: '딥워크 총 시간', value: `${weeklyDeepWork.toFixed(1)}h` },
                { label: '활동 총 시간', value: `${weeklyActive.toFixed(1)}h` },
                { label: '컨텍스트 스위칭', value: `${contextSwitches}회` },
                { label: '최고 집중 시간대', value: bestFocusHour },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">{item.label}</span>
                  <span className="text-sm font-bold text-gray-900">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 활동 카테고리 (도넛) */}
          <div className="rounded-2xl bg-white border border-gray-200 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-gray-900">활동 카테고리</h3>
              <button className="p-1 rounded-lg hover:bg-gray-100 text-gray-400"><MoreHorizontal className="w-4 h-4" /></button>
            </div>
            <div className="h-48 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={DEMO_CATEGORY_DATA} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={4} dataKey="value" stroke="none">
                    {DEMO_CATEGORY_DATA.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '12px', color: '#1e293b' }} formatter={(value: number) => `${value}%`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-3 space-y-2">
              {DEMO_CATEGORY_DATA.map(cat => (
                <div key={cat.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                    <span className="text-gray-700">{cat.name}</span>
                  </div>
                  <span className="text-gray-500 font-medium">{cat.value}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* 주간 히트맵 */}
          <div className="rounded-2xl bg-white border border-gray-200 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-gray-900">이번 주 활동</h3>
              <span className="text-xs text-gray-400">1주간 기준</span>
            </div>
            <div className="grid grid-cols-7 gap-2">
              {['월', '화', '수', '목', '금', '토', '일'].map(day => (
                <div key={day} className="text-center text-[10px] text-gray-400 mb-1 font-medium">{day}</div>
              ))}
              {DEMO_WEEKLY_DATA.map((d, i) => {
                const isMax = d.activeHours === Math.max(...DEMO_WEEKLY_DATA.map(dd => dd.activeHours));
                return (
                  <div
                    key={i}
                    className={clsx(
                      'aspect-square rounded-xl flex flex-col items-center justify-center',
                      isMax ? 'bg-gray-900 shadow-lg shadow-gray-900/10' : 'bg-gray-50',
                    )}
                  >
                    <span className={clsx('text-sm font-extrabold', isMax ? 'text-white' : 'text-gray-700')}>{d.activeHours.toFixed(0)}h</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ── 3-column 하단 행 ── */}
      <div className="grid lg:grid-cols-3 gap-5">

        {/* 완료 작업 */}
        <div className="rounded-2xl bg-white border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-gray-900">작업 완료 수</h3>
            <button className="p-1 rounded-lg hover:bg-gray-100 text-gray-400"><MoreHorizontal className="w-4 h-4" /></button>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-4xl font-extrabold text-gray-900">48</span>
            <span className="text-sm text-gray-400">건</span>
          </div>
          <div className="flex items-end gap-1 h-10 my-4">
            {DEMO_SPARK.map((v, i) => (
              <div
                key={i}
                className={clsx('flex-1 rounded-sm', i === DEMO_SPARK.length - 1 ? 'bg-brand-500' : 'bg-gray-200')}
                style={{ height: `${(v / 10) * 100}%` }}
              />
            ))}
          </div>
          <div className="flex items-center text-xs text-gray-400 gap-4">
            <span>Highest: <span className="text-gray-700 font-semibold">수</span></span>
            <span className="ml-auto">vs last period</span>
          </div>
          <div className="flex items-center gap-1 mt-1">
            <span className="text-green-600 text-sm font-bold">+12건</span>
          </div>
        </div>

        {/* 오늘의 타임라인 */}
        <div className="rounded-2xl bg-white border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-brand-500" />
              <h3 className="text-sm font-bold text-gray-900">오늘의 타임라인</h3>
            </div>
            <button className="p-1 rounded-lg hover:bg-gray-100 text-gray-400"><MoreHorizontal className="w-4 h-4" /></button>
          </div>
          <div className="space-y-3">
            {DEMO_DAILY_LOG.slice(0, 4).map((log, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="text-[11px] text-gray-400 font-mono w-10 pt-0.5 shrink-0">{log.time}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-800 truncate">{log.task}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] text-gray-400 px-2 py-0.5 rounded bg-gray-100">{log.category}</span>
                    <span className="text-[10px] text-gray-400">{log.duration}</span>
                  </div>
                </div>
                <div className={clsx(
                  'text-xs font-bold px-2 py-0.5 rounded-full',
                  log.focus >= 85 ? 'text-green-600 bg-green-50' : log.focus >= 70 ? 'text-amber-600 bg-amber-50' : 'text-gray-500 bg-gray-100',
                )}>
                  {log.focus}%
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI 인사이트 (그라디언트 카드) */}
        <div className="rounded-2xl p-5 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 40%, #8b5cf6 100%)' }}>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-5">
              <Sparkles className="w-4 h-4 text-white/80" />
              <span className="text-xs font-semibold text-white/80 tracking-wide">Insights</span>
            </div>
            <p className="text-5xl font-extrabold text-white mb-3">{avgFocus.toFixed(0)}%</p>
            <p className="text-sm font-semibold text-white/90 leading-relaxed mb-2">
              {todayMetrics?.aiSummary ? todayMetrics.aiSummary.slice(0, 60) : '이번 주 집중도가 전주 대비 향상되었습니다.'}
            </p>
            <p className="text-xs text-white/60 leading-relaxed">
              오후 2~4시 딥포커스 시간을 코딩에 할당하면 생산성이 크게 개선될 수 있습니다.
            </p>
          </div>
        </div>
      </div>

      {/* ── 하단 업무 로그 테이블 ── */}
      <div className="rounded-2xl bg-white border border-gray-200 overflow-hidden shadow-sm">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-brand-500" />
            <h3 className="text-sm font-bold text-gray-900">상세 업무 로그</h3>
          </div>
          <span className="text-xs text-gray-400">{DEMO_DAILY_LOG.length}건</span>
        </div>
        <table className="w-full">
          <thead>
            <tr className="text-left text-xs text-gray-400 border-b border-gray-100">
              <th className="px-5 py-3 font-medium">시간</th>
              <th className="px-5 py-3 font-medium">업무</th>
              <th className="px-5 py-3 font-medium">카테고리</th>
              <th className="px-5 py-3 font-medium">소요 시간</th>
              <th className="px-5 py-3 font-medium">집중도</th>
            </tr>
          </thead>
          <tbody>
            {DEMO_DAILY_LOG.map((log, idx) => (
              <tr key={idx} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                <td className="px-5 py-3 text-sm text-brand-500 font-mono font-medium">{log.time}</td>
                <td className="px-5 py-3 text-sm text-gray-800">{log.task}</td>
                <td className="px-5 py-3"><span className="text-xs text-gray-500 px-2.5 py-1 rounded-lg bg-gray-100">{log.category}</span></td>
                <td className="px-5 py-3 text-sm text-gray-600">{log.duration}</td>
                <td className="px-5 py-3">
                  <span className={clsx(
                    'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold',
                    log.focus >= 85 ? 'bg-green-50 text-green-600' : log.focus >= 70 ? 'bg-amber-50 text-amber-600' : 'bg-gray-100 text-gray-500',
                  )}>
                    {log.focus}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
