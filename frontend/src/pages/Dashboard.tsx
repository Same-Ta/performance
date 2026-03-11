import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useEmployeeDashboard } from '../hooks/usePerformance';
import clsx from 'clsx';
import {
  Copy,
  AlertTriangle,
  CheckCircle2,
  MessageCircle,
  Sparkles,
  MoreHorizontal,
  Brain,
  TrendingUp,
  Download,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

// ─── 데모 데이터 ──────────────────────────────────────────

const DEMO_TREND = Array.from({ length: 7 }, (_, i) => {
  const date = new Date();
  date.setDate(date.getDate() - (6 - i));
  const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
  return {
    day: dayNames[date.getDay()],
    focus: Math.round(55 + Math.random() * 35),
    efficiency: Math.round(50 + Math.random() * 40),
  };
});

const DEMO_TOP5 = [
  { name: '김민수', score: 92, time: '04:35' },
  { name: '이지현', score: 85, time: '03:51' },
  { name: '박준혁', score: 78, time: '03:12' },
  { name: '최서연', score: 72, time: '02:58' },
  { name: '정다영', score: 65, time: '02:30' },
];

const DEMO_WEEKLY = [
  { day: '일', value: 4, label: '4' },
  { day: '월', value: 72, label: '72K', highlight: true },
  { day: '화', value: 11, label: '11' },
  { day: '수', value: 13, label: '13' },
  { day: '목', value: 7, label: '7' },
  { day: '금', value: 18, label: '18' },
  { day: '토', value: 19, label: '19' },
];

const DEMO_SPARK = [3, 5, 4, 7, 6, 8, 5, 9, 7, 6, 8, 10];

const DEMO_TABLE = [
  { id: 39, member: '김민수', avatar: 'KM', task: '결제 API 연동 작업', category: '개발', focusTime: '219518', status: 'done' as const },
  { id: 39, member: '이지현', avatar: 'LJ', task: 'CORS 디버깅 진행', category: '개발', focusTime: '219518', status: 'done' as const },
  { id: 38, member: '박준혁', avatar: 'PJ', task: 'UI 리팩토링', category: '디자인', focusTime: '185320', status: 'blocker' as const },
  { id: 37, member: '최서연', avatar: 'CS', task: '인증 흐름 기획', category: '기획', focusTime: '142100', status: 'progress' as const },
  { id: 36, member: '정다영', avatar: 'JD', task: '성과 리포트 검토', category: '분석', focusTime: '98500', status: 'done' as const },
];

const DEMO_TEAM_FEED = [
  { id: '1', user: '김민수', avatar: 'KM', time: '14:30', text: '결제 API 연동 작업 완료 — Stripe 웹훅 핸들러 구현', reactions: ['👍', '🔥'], reactionCount: 4, threadCount: 2, status: 'done' as const },
  { id: '2', user: '이지현', avatar: 'LJ', time: '13:45', text: 'CORS 에러 디버깅 중 — 프록시 설정 변경 후에도 동일 이슈 반복', reactions: [], reactionCount: 0, threadCount: 5, status: 'blocker' as const },
  { id: '3', user: '박준혁', avatar: 'PJ', time: '12:20', text: '대시보드 UI 리팩토링 — 차트 컴포넌트 분리 및 반응형 적용', reactions: ['👍'], reactionCount: 2, threadCount: 0, status: 'done' as const },
  { id: '4', user: '최서연', avatar: 'CS', time: '11:50', text: '사용자 인증 흐름 기획 문서 작성 중', reactions: [], reactionCount: 0, threadCount: 1, status: 'progress' as const },
];

// ─── 메인 컴포넌트 ───────────────────────────────────────

const AGENT_DOWNLOAD_URL = 'https://jdukwvlasmphsiojqmwv.supabase.co/storage/v1/object/public/downloads/ProofWorkAgent.exe';

export default function Dashboard() {
  const { profile } = useAuth();
  const userId = profile?.uid ?? '';
  const { todayMetrics, averages, loading, hasData } = useEmployeeDashboard(userId);
  const [activeTab, setActiveTab] = useState<'status' | 'team'>('status');
  const [selectedMetric, setSelectedMetric] = useState(1);
  const [teamFilter, setTeamFilter] = useState<'all' | 'blocker' | 'done'>('all');
  const [agentOnline, setAgentOnline] = useState(false);

  // Agent 연결 상태 확인
  useEffect(() => {
    fetch('http://localhost:5001/health', { signal: AbortSignal.timeout(2000) })
      .then(r => { if (r.ok) setAgentOnline(true); })
      .catch(() => {});
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-gray-200 border-t-brand-500 rounded-full animate-spin" />
      </div>
    );
  }

  const today = todayMetrics;
  const focusScore = today?.focusScore ?? (hasData ? averages?.avgFocus ?? 0 : 72);
  const efficiencyScore = today?.efficiencyScore ?? (hasData ? averages?.avgEfficiency ?? 0 : 68);
  const goalAlignment = today?.goalAlignmentScore ?? 65;
  const totalActiveHours = hasData ? averages?.totalActiveHours ?? 0 : 5.2;
  const totalDeepFocusHours = hasData ? averages?.totalDeepFocusHours ?? 0 : 3.1;
  const overallScore = (focusScore + efficiencyScore + goalAlignment) / 3;
  const maxTop5 = Math.max(...DEMO_TOP5.map(p => p.score));

  const metricTabs = [
    { label: '목표 정렬도', value: `${goalAlignment.toFixed(0)}점`, key: 0 },
    { label: '업무 집중도', value: `${focusScore.toFixed(1)}%`, key: 1 },
    { label: '생산성 효율', value: `${efficiencyScore.toFixed(1)}%`, key: 2 },
    { label: '딥포커스', value: `${totalDeepFocusHours.toFixed(1)}h`, key: 3 },
    { label: '총 활동시간', value: `${totalActiveHours.toFixed(1)}h`, key: 4 },
  ];

  return (
    <div className="space-y-5 animate-fade-in">
      {/* ── Sub-tabs ── */}
      <div className="flex items-center gap-6 border-b border-gray-200">
        {([
          { key: 'status' as const, label: '업무 현황' },
          { key: 'team' as const, label: '팀 보드' },
        ]).map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={clsx(
              'pb-3 text-sm font-medium transition-colors relative',
              activeTab === tab.key
                ? 'text-gray-900 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-gray-900'
                : 'text-gray-400 hover:text-gray-700',
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'status' ? (
        <>
          {/* Agent 미설치 배너 */}
          {!agentOnline && (
            <div className="flex items-center justify-between p-4 bg-amber-50 border border-amber-200 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">On-Device Agent가 연결되지 않았습니다</p>
                  <p className="text-xs text-gray-500">정확한 업무 분석을 위해 Agent를 설치하고 실행해주세요</p>
                </div>
              </div>
              <a
                href={AGENT_DOWNLOAD_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary flex items-center gap-2 text-sm shrink-0"
              >
                <Download className="w-4 h-4" />
                Agent 다운로드
              </a>
            </div>
          )}
          {/* ── Metric tabs row (Zentra 스타일) ── */}
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
            {/* 좌측 (3/5) — 제안서/이메일 스타일 카드 */}
            <div className="lg:col-span-3 space-y-5">

              {/* 업무 집중도 */}
              <div className="rounded-2xl bg-white border border-gray-200 p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-12 h-12 rounded-2xl bg-brand-500/10 flex items-center justify-center">
                    <Brain className="w-6 h-6 text-brand-500" />
                  </div>
                  <h3 className="text-base font-bold text-gray-900">업무 집중도</h3>
                </div>
                <div className="flex items-center gap-6 mb-5">
                  <div className="px-4 py-2 rounded-xl bg-gray-50">
                    <span className="text-[11px] text-gray-400 block mb-0.5">집중시간</span>
                    <span className="text-xl font-extrabold text-gray-900">{totalActiveHours.toFixed(1)}<span className="text-xs text-gray-400 ml-0.5">h</span></span>
                  </div>
                  <div className="px-4 py-2 rounded-xl bg-gray-50">
                    <span className="text-[11px] text-gray-400 block mb-0.5">딥포커스</span>
                    <span className="text-xl font-extrabold text-gray-900">{totalDeepFocusHours.toFixed(1)}<span className="text-xs text-gray-400 ml-0.5">h</span></span>
                  </div>
                </div>
                <div className="flex items-end justify-between pt-4 border-t border-gray-100">
                  <span className="text-sm text-gray-500">업무 집중도 점수</span>
                  <span className="text-4xl font-extrabold text-gray-900 tracking-tight">{focusScore.toFixed(1)}<span className="text-lg text-gray-400 ml-0.5">%</span></span>
                </div>
              </div>

              {/* 생산성 효율 */}
              <div className="rounded-2xl bg-white border border-gray-200 p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-emerald-500" />
                  </div>
                  <h3 className="text-base font-bold text-gray-900">생산성 효율</h3>
                </div>
                <div className="flex items-center gap-6 mb-5">
                  <div className="px-4 py-2 rounded-xl bg-gray-50">
                    <span className="text-[11px] text-gray-400 block mb-0.5">활동시간</span>
                    <span className="text-xl font-extrabold text-gray-900">{(totalActiveHours + 2.6).toFixed(1)}<span className="text-xs text-gray-400 ml-0.5">h</span></span>
                  </div>
                  <div className="px-4 py-2 rounded-xl bg-gray-50">
                    <span className="text-[11px] text-gray-400 block mb-0.5">목표정렬</span>
                    <span className="text-xl font-extrabold text-gray-900">{goalAlignment.toFixed(0)}<span className="text-xs text-gray-400 ml-0.5">점</span></span>
                  </div>
                </div>
                <div className="flex items-end justify-between pt-4 border-t border-gray-100">
                  <span className="text-sm text-gray-500">생산성 효율 점수</span>
                  <span className="text-4xl font-extrabold text-gray-900 tracking-tight">{efficiencyScore.toFixed(1)}<span className="text-lg text-gray-400 ml-0.5">%</span></span>
                </div>
              </div>
            </div>

            {/* 우측 (2/5) — Gross Volume + Top 5 + 주간 그리드 */}
            <div className="lg:col-span-2 space-y-5">

              {/* 오늘의 성과 */}
              <div className="rounded-2xl bg-white border border-gray-200 p-5 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-gray-900">오늘의 성과</h3>
                  <button className="p-1 rounded-lg hover:bg-gray-100 text-gray-400">
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex items-baseline gap-2 mb-5">
                  <span className="text-4xl font-extrabold text-gray-900">{overallScore.toFixed(1)}</span>
                  <span className="text-sm text-gray-400">종합점수</span>
                  <span className="ml-auto text-xs font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">▲ 4%</span>
                </div>
                <div className="space-y-3 pt-4 border-t border-gray-100">
                  {[
                    { label: '집중시간', value: `${totalActiveHours.toFixed(1)}h` },
                    { label: '딥포커스', value: `${totalDeepFocusHours.toFixed(1)}h` },
                    { label: '목표정렬', value: `${goalAlignment.toFixed(0)}점` },
                    { label: '효율성', value: `${efficiencyScore.toFixed(1)}%` },
                  ].map(item => (
                    <div key={item.label} className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">{item.label}</span>
                      <span className="text-sm font-bold text-gray-900">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top 5 팀 집중도 */}
              <div className="rounded-2xl bg-white border border-gray-200 p-5 shadow-sm">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-sm font-bold text-gray-900">Top 5 팀 집중도</h3>
                  <div className="text-xs text-gray-400">
                    평균 집중 시간 <span className="text-brand-500 font-bold ml-1">04:35</span>
                  </div>
                </div>
                <div className="space-y-3.5">
                  {DEMO_TOP5.map((person, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <span className="text-sm text-gray-700 w-16 shrink-0 truncate">{person.name}</span>
                      <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={clsx('h-full rounded-full transition-all duration-700', i === 0 ? 'bg-brand-500' : 'bg-brand-500/50')}
                          style={{ width: `${(person.score / maxTop5) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-400 w-10 text-right font-mono">{person.time}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 주간 활동 */}
              <div className="rounded-2xl bg-white border border-gray-200 p-5 shadow-sm">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-sm font-bold text-gray-900">활동일 조회</h3>
                  <span className="text-xs text-gray-400">1주간 기준</span>
                </div>
                <div className="grid grid-cols-7 gap-1.5">
                  {DEMO_WEEKLY.map((d, i) => (
                    <div
                      key={i}
                      className={clsx(
                        'flex flex-col items-center py-3 rounded-xl transition-all',
                        d.highlight ? 'bg-gray-900 shadow-lg shadow-gray-900/10' : 'bg-gray-50',
                      )}
                    >
                      <span className={clsx('text-[10px] font-medium mb-1.5', d.highlight ? 'text-white/70' : 'text-gray-400')}>{d.day}</span>
                      <span className={clsx('text-base font-extrabold', d.highlight ? 'text-white' : 'text-gray-700')}>{d.label}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-3 space-y-0.5">
                  <p className="text-[11px] text-gray-400">최고 집중 조회일 · 활동량 : <span className="text-brand-500 font-semibold">월요일 (72K)</span></p>
                  <p className="text-[11px] text-gray-400">조회가 잘 되지 않은 요일 : <span className="text-gray-600 font-semibold">일요일 (4)</span></p>
                </div>
              </div>
            </div>
          </div>

          {/* ── 3-column 하단 카드 (Zentra 하단 행 스타일) ── */}
          <div className="grid lg:grid-cols-3 gap-5">

            {/* 집중도 트렌드 */}
            <div className="rounded-2xl bg-white border border-gray-200 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-gray-900">집중도 트렌드</h3>
                <button className="p-1 rounded-lg hover:bg-gray-100 text-gray-400">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>
              <div className="h-36">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={DEMO_TREND}>
                    <defs>
                      <linearGradient id="dFocusG" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                    <XAxis dataKey="day" tick={{ fill: '#9ca3af', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis hide domain={[0, 100]} />
                    <Tooltip
                      contentStyle={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '10px', color: '#1e293b', fontSize: '11px' }}
                    />
                    <Area type="monotone" dataKey="focus" name="집중도" stroke="#3b82f6" fill="url(#dFocusG)" strokeWidth={2} dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                <span className="text-[11px] text-gray-400">42% 평균</span>
              </div>
            </div>

            {/* 완료 작업 */}
            <div className="rounded-2xl bg-white border border-gray-200 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-gray-900">완료 작업</h3>
                <button className="p-1 rounded-lg hover:bg-gray-100 text-gray-400">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-4xl font-extrabold text-gray-900">106</span>
                <span className="text-sm text-gray-400">건</span>
              </div>
              {/* Sparkline bars */}
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
                <span>Highest: <span className="text-gray-700 font-semibold">목</span></span>
                <span className="ml-auto">vs last period</span>
              </div>
              <div className="flex items-center gap-1 mt-1">
                <span className="text-green-600 text-sm font-bold">+34,002</span>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-400 mb-1">팀 기여도</p>
                <p className="text-2xl font-extrabold text-gray-900">1,284<span className="text-sm text-gray-400 ml-0.5">점</span></p>
              </div>
            </div>

            {/* AI 인사이트 (그라디언트 카드) */}
            <div
              className="rounded-2xl p-5 relative overflow-hidden"
              style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 40%, #8b5cf6 100%)' }}
            >
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-5">
                  <Sparkles className="w-4 h-4 text-white/80" />
                  <span className="text-xs font-semibold text-white/80 tracking-wide">Insights</span>
                </div>
                <p className="text-5xl font-extrabold text-white mb-3">{focusScore.toFixed(0)}%</p>
                <p className="text-sm font-semibold text-white/90 leading-relaxed mb-2">
                  이번 주 집중도가 전주 대비 4% 향상되었습니다.
                </p>
                <p className="text-xs text-white/60 leading-relaxed">
                  딥포커스 비율이 높아지고 컨텍스트 스위칭이 감소하여 생산성이 개선되었습니다.
                </p>
              </div>
            </div>
          </div>

          {/* ── 하단 테이블 ── */}
          <div className="rounded-2xl bg-white border border-gray-200 overflow-hidden shadow-sm">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs text-gray-400 border-b border-gray-100">
                  <th className="px-5 py-3.5 font-medium">시리얼번호</th>
                  <th className="px-5 py-3.5 font-medium">팀원</th>
                  <th className="px-5 py-3.5 font-medium">담당자</th>
                  <th className="px-5 py-3.5 font-medium">업무 규모</th>
                  <th className="px-5 py-3.5 font-medium">매출금액</th>
                  <th className="px-5 py-3.5 font-medium">제안서 전자</th>
                  <th className="px-5 py-3.5 font-medium">발송결과</th>
                  <th className="px-5 py-3.5 font-medium">레포트</th>
                </tr>
              </thead>
              <tbody>
                {DEMO_TABLE.map((row, idx) => (
                  <tr key={idx} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3.5 text-sm text-brand-500 font-medium">{row.id}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center">
                          <span className="text-[10px] font-bold text-gray-600">{row.avatar}</span>
                        </div>
                        <span className="text-sm text-gray-800 font-medium">{row.member}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-gray-600">{row.task}</td>
                    <td className="px-5 py-3.5">
                      <span className="text-xs text-gray-500 px-2.5 py-1 rounded-lg bg-gray-100">{row.category}</span>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-gray-600 font-mono">{row.focusTime}</td>
                    <td className="px-5 py-3.5">
                      <button className="flex items-center gap-1 text-xs text-gray-400 hover:text-brand-500 transition-colors">
                        <Copy className="w-3.5 h-3.5" />
                        복사하기
                      </button>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={clsx(
                        'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold',
                        row.status === 'done' && 'bg-blue-50 text-blue-600',
                        row.status === 'blocker' && 'bg-red-50 text-red-600',
                        row.status === 'progress' && 'bg-amber-50 text-amber-600',
                      )}>
                        {row.status === 'done' && '열람완료'}
                        {row.status === 'blocker' && '병목'}
                        {row.status === 'progress' && '진행중'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <button className="text-xs text-brand-500 hover:text-brand-600 transition-colors">📊</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        /* ── 팀 보드 탭 ── */
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            {(['all', 'blocker', 'done'] as const).map(f => (
              <button
                key={f}
                onClick={() => setTeamFilter(f)}
                className={clsx(
                  'px-4 py-2 rounded-xl text-xs font-medium transition-colors',
                  teamFilter === f ? 'bg-gray-900 text-white' : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100',
                )}
              >
                {f === 'all' && '전체 피드'}
                {f === 'blocker' && '🚨 병목'}
                {f === 'done' && '✅ 완료'}
              </button>
            ))}
          </div>
          {DEMO_TEAM_FEED
            .filter(item => {
              if (teamFilter === 'blocker') return item.status === 'blocker';
              if (teamFilter === 'done') return item.status === 'done';
              return true;
            })
            .map(item => (
              <div
                key={item.id}
                className={clsx(
                  'rounded-2xl bg-white border p-5 transition-all shadow-sm',
                  item.status === 'blocker' ? 'border-red-200' : item.status === 'done' ? 'border-green-200' : 'border-gray-200',
                )}
              >
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-gray-600">{item.avatar}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold text-gray-900">{item.user}</span>
                      <span className="text-xs text-gray-400">{item.time}</span>
                      {item.status === 'blocker' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-500/15 text-red-400">
                          <AlertTriangle className="w-3 h-3" /> 병목
                        </span>
                      )}
                      {item.status === 'done' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-green-500/15 text-green-400">
                          <CheckCircle2 className="w-3 h-3" /> 완료
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed">{item.text}</p>
                    <div className="flex items-center gap-3 mt-2.5">
                      <button className="flex items-center gap-1 text-xs text-gray-400 hover:text-brand-500 transition-colors">
                        <MessageCircle className="w-3.5 h-3.5" />
                        {item.threadCount > 0 ? `스레드 ${item.threadCount}` : '스레드'}
                      </button>
                      {item.reactions.length > 0 && (
                        <div className="flex items-center gap-1">
                          {item.reactions.map((r, j) => <span key={j} className="text-sm">{r}</span>)}
                          <span className="text-xs text-gray-400">{item.reactionCount}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
