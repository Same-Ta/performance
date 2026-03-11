import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../config/supabase';
import { ChevronDown } from 'lucide-react';
import { browserTracker } from '../../services/browserTracker';
import type { BrowserLiveStats } from '../../services/browserTracker';
import { submitMetrics } from '../../services/firestoreService';
import type { ActivitySegment } from '../../types';

const AGENT_URL = 'http://localhost:5001';
const POLL_INTERVAL = 3000;

type AgentState = 'offline' | 'idle' | 'running';
type TrackMode = 'agent' | 'browser';

const TASK_TYPES = [
  { value: 'general', label: '일반 업무', color: 'bg-dark-600 text-dark-200' },
  { value: 'frontend', label: '프론트엔드 개발', color: 'bg-blue-500/20 text-blue-300' },
  { value: 'backend', label: '백엔드 개발', color: 'bg-green-500/20 text-green-300' },
  { value: 'design', label: '디자인', color: 'bg-pink-500/20 text-pink-300' },
  { value: 'documentation', label: '문서 작업', color: 'bg-yellow-500/20 text-yellow-300' },
  { value: 'meeting', label: '회의', color: 'bg-purple-500/20 text-purple-300' },
  { value: 'planning', label: '기획/계획', color: 'bg-indigo-500/20 text-indigo-300' },
  { value: 'review', label: '코드 리뷰', color: 'bg-orange-500/20 text-orange-300' },
  { value: 'research', label: '리서치/조사', color: 'bg-teal-500/20 text-teal-300' },
  { value: 'bug_fix', label: '버그 수정', color: 'bg-red-500/20 text-red-300' },
] as const;

// ── 브라우저 모드: 업무 유형 → 활동 카테고리 매핑 ──────────
const BROWSER_CATEGORY_MAP: Record<string, string> = {
  general: 'other',
  frontend: 'development',
  backend: 'development',
  design: 'design',
  documentation: 'documentation',
  meeting: 'meeting',
  planning: 'project_mgmt',
  review: 'development',
  research: 'research',
  bug_fix: 'development',
};

function padHHMM(date: Date): string {
  return date.toTimeString().slice(0, 5);
}

/** 브라우저 추적 데이터로 합성 ActivitySegment 배열 생성 */
function generateBrowserTimeline(
  sessionStartMs: number,
  activeMinutes: number,
  idleMinutes: number,
  contextSwitches: number,
  deepFocusMinutes: number,
  taskType: string,
  taskLabel: string,
): ActivitySegment[] {
  if (activeMinutes <= 0) return [];

  const category = (BROWSER_CATEGORY_MAP[taskType] || 'other') as ActivitySegment['category'];
  const numActiveBlocks = contextSwitches + 1;
  const activePerBlock = Math.max(1, Math.round(activeMinutes / numActiveBlocks));
  const idlePerBlock = contextSwitches > 0 ? Math.max(1, Math.round(idleMinutes / contextSwitches)) : 0;
  let deepFocusLeft = deepFocusMinutes;
  let currentMs = sessionStartMs;

  // 블록별 구체적인 설명 생성
  const WORK_DESCRIPTIONS: Record<string, string[]> = {
    frontend: ['UI 컴포넌트 구현', '스타일링 및 레이아웃', '프론트엔드 로직 작성', '화면 인터랙션 개발', '상태 관리 작업'],
    backend: ['API 엔드포인트 개발', '서버 로직 구현', '데이터베이스 쿼리 작업', '백엔드 비즈니스 로직', '서버 설정 작업'],
    design: ['UI/UX 디자인 작업', '와이어프레임 작성', '디자인 시스템 정리', '프로토타입 제작', '비주얼 에셋 작업'],
    documentation: ['기술 문서 작성', 'API 문서 업데이트', '프로젝트 문서화', '가이드 작성', '회의록 정리'],
    meeting: ['팀 회의 참석', '화상 미팅', '프로젝트 논의', '스크럼 미팅', '1:1 미팅'],
    planning: ['스프린트 계획 수립', '태스크 분배 및 정리', '로드맵 검토', '요구사항 분석', '우선순위 조정'],
    review: ['코드 리뷰 수행', 'PR 확인 및 피드백', '코드 품질 검토', '리뷰 코멘트 작성', '머지 및 승인'],
    research: ['기술 조사 및 리서치', '레퍼런스 분석', '라이브러리 비교 검토', '사례 연구', '기술 스택 조사'],
    bug_fix: ['버그 원인 분석', '디버깅 및 수정', '에러 로그 확인', '재현 테스트', '핫픽스 적용'],
    general: ['업무 진행', '태스크 수행', '작업 처리', '일반 업무 수행', '프로젝트 작업'],
  };
  const descList = WORK_DESCRIPTIONS[taskType] ?? WORK_DESCRIPTIONS['general'];

  const segs: ActivitySegment[] = [];

  for (let i = 0; i < numActiveBlocks; i++) {
    const dur = activePerBlock;
    const isDeep = deepFocusLeft >= dur && dur >= 10;
    if (isDeep) deepFocusLeft -= dur;
    const desc = isDeep
      ? `딥포커스 — ${descList[i % descList.length]}`
      : descList[i % descList.length];
    segs.push({
      startTime: padHHMM(new Date(currentMs)),
      endTime: padHHMM(new Date(currentMs + dur * 60000)),
      app: 'Browser Tracker',
      windowTitle: taskLabel,
      category,
      durationMinutes: dur,
      description: desc,
    });
    currentMs += dur * 60000;

    if (i < contextSwitches && idlePerBlock >= 1) {
      segs.push({
        startTime: padHHMM(new Date(currentMs)),
        endTime: padHHMM(new Date(currentMs + idlePerBlock * 60000)),
        app: '',
        windowTitle: '',
        category: 'idle',
        durationMinutes: idlePerBlock,
        description: '잠시 자리비움',
      });
      currentMs += idlePerBlock * 60000;
    }
  }
  return segs;
}

interface AgentLiveStats {
  elapsedMinutes: number;
  activeMinutes: number;
  idleMinutes: number;
  contextSwitches: number;
  deepFocusMinutes: number;
  topCategory: string;
  categoryBreakdown: Record<string, number>;
  screenAnalysis?: {
    hasContext: boolean;
    currentWork?: string;
    currentSummary?: string;
    currentInference?: string;
    currentCategory?: string;
    currentApp?: string;
    blockDurationMinutes?: number;
    totalAnalyses?: number;
    totalBlocks?: number;
    narrative?: string;
  };
}

interface SessionSummary {
  score: number;
  focusScore: number;
  efficiencyScore: number;
  activeMinutes: number;
  deepFocusMinutes: number;
  contextSwitches: number;
  topCategory: string;
  workNarrative?: string;
  screenAnalysisCount?: number;
}

interface Props {
  onSessionEnd?: () => void;
}

export default function AgentControlPanel({ onSessionEnd }: Props) {
  const { user } = useAuth();
  const [agentState, setAgentState] = useState<AgentState>('offline');
  const [trackMode, setTrackMode] = useState<TrackMode>('browser');
  const [liveStats, setLiveStats] = useState<AgentLiveStats | BrowserLiveStats | null>(null);
  const [lastSession, setLastSession] = useState<SessionSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState('general');
  const [customTaskInput, setCustomTaskInput] = useState('');
  const [taskDropdownOpen, setTaskDropdownOpen] = useState(false);
  const [browserRunning, setBrowserRunning] = useState(() => browserTracker.isRunning);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const customInputRef = useRef<HTMLInputElement>(null);

  // ── 마운트 시 이미 추적 중이면 UI 동기화 (페이지 이동 후 복귀 대응) ──
  useEffect(() => {
    if (browserTracker.isRunning) {
      setBrowserRunning(true);
      setLiveStats(browserTracker.getLiveStats());
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);  const pollStatus = useCallback(async () => {
    try {
      const res = await fetch(`${AGENT_URL}/status`, {
        signal: AbortSignal.timeout(2000),
      });
      if (!res.ok) return;
      const data = await res.json();
      setAgentState(data.running ? 'running' : 'idle');
      if (data.running && data.stats && Object.keys(data.stats).length > 0) {
        setLiveStats(data.stats as AgentLiveStats);
      } else if (!data.running) {
        setLiveStats(null);
      }
      setError(null);
    } catch {
      setAgentState('offline');
      if (!browserTracker.isRunning) setLiveStats(null);
    }
  }, []);

  useEffect(() => {
    pollStatus();
    // 오프라인 시 10초, 연결 시 3초 폴링 (콘솔 스팸 최소화)
    const interval = agentState === 'offline' ? 10000 : POLL_INTERVAL;
    const id = setInterval(pollStatus, interval);
    return () => clearInterval(id);
  }, [pollStatus, agentState]);

  // ── 브라우저 모드 실시간 stats 업데이트 ───────────────────
  useEffect(() => {
    if (!browserRunning) return;
    const id = setInterval(() => {
      setLiveStats(browserTracker.getLiveStats());
    }, 2000);
    return () => clearInterval(id);
  }, [browserRunning]);

  // ── 드롭다운 외부 클릭 닫기 ───────────────────────────────
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setTaskDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // ── 시작 ──────────────────────────────────────────────────
  const handleStart = async () => {
    if (!user) { setError('로그인이 필요합니다.'); return; }
    setLoading(true);
    setError(null);

    // 브라우저 모드
    if (trackMode === 'browser' || agentState === 'offline') {
      try {
        browserTracker.start(effectiveTask);
        setBrowserRunning(true);
        setLiveStats(browserTracker.getLiveStats());
        setLastSession(null);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : '브라우저 추적 시작 실패');
      } finally {
        setLoading(false);
      }
      return;
    }

    // 로컬 에이전트 모드
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const idToken = session?.access_token ?? '';
      const res = await fetch(`${AGENT_URL}/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid: user.uid, idToken, taskType: effectiveTask }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '에이전트 시작 실패');
      setAgentState('running');
      setLastSession(null);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : '알 수 없는 오류';
      setError(msg.includes('fetch') ? '에이전트 서버를 찾을 수 없습니다. 브라우저 모드를 사용해주세요.' : msg);
    } finally {
      setLoading(false);
    }
  };

  // ── 중지 ──────────────────────────────────────────────────
  const handleStop = async () => {
    setLoading(true);
    setError(null);

    // 브라우저 모드 종료
    if (browserRunning) {
      try {
        const result = browserTracker.stop();
        setBrowserRunning(false);
        setLiveStats(null);
        setLastSession({
          score: result.score,
          focusScore: result.focusScore,
          efficiencyScore: result.efficiencyScore,
          activeMinutes: result.activeMinutes,
          deepFocusMinutes: result.deepFocusMinutes,
          contextSwitches: result.contextSwitches,
          topCategory: result.topCategory,
        });
        if (user) {
          const now = new Date();
          // UTC 대신 로컬 날짜 사용 (한국 시간대 자정 부근 날짜 불일치 방지)
          const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
          const sessionId = `browser_${now.getTime()}`;
          const sessionStartMs = now.getTime() - result.totalMinutes * 60000;
          const sessionStartTime = new Date(sessionStartMs).toTimeString().slice(0, 5);
          const sessionEndTime = now.toTimeString().slice(0, 5);
          const taskLabel = TASK_TYPES.find(t => t.value === effectiveTask)?.label ?? effectiveTask;
          const idleMinutes = result.totalMinutes - result.activeMinutes;
          const deepFocusRatio = result.activeMinutes > 0
            ? Math.round((result.deepFocusMinutes / result.activeMinutes) * 100)
            : 0;
          const switchLevel = result.contextSwitches < 5
            ? '매우 안정적인'
            : result.contextSwitches < 15 ? '보통 수준의' : '높은';

          const aiSummary =
            `${sessionStartTime}~${sessionEndTime}(총 ${result.totalMinutes}분) 동안 ${taskLabel} 업무를 수행했습니다. ` +
            `활성 작업 시간 ${result.activeMinutes}분 중 방해 없는 딥포커스 구간이 ${result.deepFocusMinutes}분(${deepFocusRatio}%)이었으며, ` +
            `컨텍스트 전환 ${result.contextSwitches}회로 ${switchLevel} 집중 흐름을 보였습니다. ` +
            `유휴 시간은 ${idleMinutes}분이었습니다.`;

          const keyAchievements: string[] = [];
          if (result.deepFocusMinutes >= 20)
            keyAchievements.push(`${result.deepFocusMinutes}분간 딥포커스 달성 — 높은 몰입도로 ${taskLabel} 집중 수행`);
          if (result.focusScore >= 70)
            keyAchievements.push(`집중도 ${result.focusScore}점 — 평균 이상의 집중력 유지`);
          if (result.activeMinutes >= 60)
            keyAchievements.push(`${(result.activeMinutes / 60).toFixed(1)}시간 동안 ${taskLabel} 연속 작업 완료`);
          if (result.contextSwitches < 5 && result.activeMinutes > 10)
            keyAchievements.push(`컨텍스트 전환 ${result.contextSwitches}회 — 안정적인 작업 흐름 유지`);
          if (keyAchievements.length === 0)
            keyAchievements.push(`${taskLabel} ${result.activeMinutes}분 수행 완료`);

          const suggestedImprovements: string[] = [];
          if (result.contextSwitches > 15)
            suggestedImprovements.push('잦은 전환이 감지됨 — 포모도로 기법으로 집중 구간을 구조화해보세요');
          if (deepFocusRatio < 30 && result.activeMinutes > 20)
            suggestedImprovements.push('딥포커스 비율이 낮습니다 — 알림 차단 후 전용 집중 시간을 늘려보세요');
          if (idleMinutes > result.activeMinutes)
            suggestedImprovements.push('유휴 시간이 활성 시간보다 길었습니다 — 작업 환경·에너지 관리를 점검해보세요');

          const timeline = generateBrowserTimeline(
            sessionStartMs,
            result.activeMinutes,
            idleMinutes,
            result.contextSwitches,
            result.deepFocusMinutes,
            effectiveTask,
            taskLabel,
          );

          await submitMetrics({
            id: `${user.uid}_${dateStr}_${sessionId}`,
            userId: user.uid,
            date: dateStr,
            sessionId,
            status: 'submitted',
            totalWorkMinutes: result.totalMinutes,
            activeWorkMinutes: result.activeMinutes,
            focusScore: result.focusScore,
            efficiencyScore: result.efficiencyScore,
            goalAlignmentScore: 70,
            outputScore: Math.round((result.focusScore + result.efficiencyScore) / 2),
            contextSwitchCount: result.contextSwitches,
            contextSwitchRate: result.activeMinutes > 0
              ? parseFloat((result.contextSwitches / result.activeMinutes).toFixed(2))
              : 0,
            inputDensity: 0,
            deepFocusMinutes: result.deepFocusMinutes,
            softwareUsage: [{
              category: (BROWSER_CATEGORY_MAP[effectiveTask] || 'other') as never,
              appName: taskLabel,
              minutes: result.activeMinutes,
              percentage: 100,
            }],
            aiSummary,
            keyAchievements,
            suggestedImprovements,
            taskType: effectiveTask,
            sessionStartTime,
            sessionEndTime,
            timeline,
            createdAt: now.toISOString(),
          });
        }
        onSessionEnd?.();
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : '세션 저장 실패');
      } finally {
        setLoading(false);
      }
      return;
    }

    // 로컬 에이전트 모드 종료
    try {
      const res = await fetch(`${AGENT_URL}/stop`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '에이전트 종료 실패');
      setAgentState('idle');
      setLiveStats(null);
      if (data.metrics) {
        setLastSession({
          score: data.metrics.overallScore,
          focusScore: data.metrics.focusScore,
          efficiencyScore: data.metrics.efficiencyScore,
          activeMinutes: data.metrics.activeWorkMinutes,
          deepFocusMinutes: data.metrics.deepFocusMinutes,
          contextSwitches: data.metrics.contextSwitchCount,
          topCategory: '',
          workNarrative: data.metrics.workNarrative,
          screenAnalysisCount: data.metrics.screenAnalysisCount,
        });
      }
      onSessionEnd?.();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : '알 수 없는 오류');
    } finally {
      setLoading(false);
    }
  };

  const isTracking = browserRunning || agentState === 'running';
  const isCustom = selectedTask === '__custom__';
  // 실제로 사용할 task 값 (직접입력 시 customTaskInput 사용)
  const effectiveTask = isCustom
    ? (customTaskInput.trim() || '직접 입력')
    : selectedTask;
  const currentTask = isCustom
    ? { value: '__custom__', label: customTaskInput.trim() || '직접 입력', color: 'bg-violet-500/20 text-violet-300' }
    : TASK_TYPES.find(t => t.value === selectedTask);

  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 w-auto max-w-[720px]">
      <div className="bg-gray-900 rounded-2xl shadow-2xl shadow-black/30 border border-gray-800 px-5 py-3 flex items-center gap-3">

        {/* ── 추적 중이 아닐 때 ── */}
        {!isTracking && (
          <>
            {/* 모드 표시 (에이전트/브라우저) */}
            {agentState !== 'offline' && (
              <div className="flex gap-1 mr-1">
                <button
                  onClick={() => setTrackMode('browser')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors ${
                    trackMode === 'browser'
                      ? 'bg-brand-500/20 text-brand-400'
                      : 'text-gray-500 hover:text-gray-300'
                  }`}
                >
                  브라우저
                </button>
                <button
                  onClick={() => setTrackMode('agent')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors ${
                    trackMode === 'agent'
                      ? 'bg-brand-500/20 text-brand-400'
                      : 'text-gray-500 hover:text-gray-300'
                  }`}
                >
                  에이전트
                </button>
              </div>
            )}

            {/* 업무 유형 드롭다운 */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setTaskDropdownOpen(!taskDropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 border border-gray-700 rounded-xl text-sm hover:bg-gray-700 transition-colors"
              >
                <span className="text-xs font-medium text-gray-200">
                  {isCustom
                    ? (customTaskInput.trim() || '직접 입력…')
                    : (currentTask?.label || '일반 업무')}
                </span>
                <ChevronDown className={`w-3.5 h-3.5 text-gray-500 shrink-0 transition-transform ${taskDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              {taskDropdownOpen && (
                <div className="absolute z-50 bottom-full left-0 mb-2 w-56 bg-gray-800 border border-gray-700 rounded-xl shadow-2xl py-1.5 max-h-60 overflow-y-auto">
                  {TASK_TYPES.map((t) => (
                    <button
                      key={t.value}
                      onClick={() => { setSelectedTask(t.value); setTaskDropdownOpen(false); }}
                      className={`w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 flex items-center gap-2 ${selectedTask === t.value ? 'bg-brand-500/15 text-brand-300' : ''}`}
                    >
                      {t.label}
                    </button>
                  ))}
                  <button
                    onClick={() => {
                      setSelectedTask('__custom__');
                      setTaskDropdownOpen(false);
                      setTimeout(() => customInputRef.current?.focus(), 50);
                    }}
                    className={`w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 flex items-center gap-2 ${selectedTask === '__custom__' ? 'bg-brand-500/15 text-brand-300' : ''}`}
                  >
                    ✏️ 직접 입력
                  </button>
                </div>
              )}
            </div>

            {/* 직접 입력 필드 */}
            {isCustom && (
              <input
                ref={customInputRef}
                type="text"
                value={customTaskInput}
                onChange={(e) => setCustomTaskInput(e.target.value)}
                placeholder="업무 이름 입력"
                className="w-40 px-3 py-1.5 border border-gray-700 rounded-xl text-sm bg-gray-800 placeholder-gray-500 text-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-500/40"
                maxLength={40}
              />
            )}

            {/* 추적 시작 버튼 */}
            <button
              onClick={handleStart}
              disabled={loading || !user}
              className="flex items-center gap-1.5 px-5 py-1.5 bg-brand-600 hover:bg-brand-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-colors"
            >
              {loading ? '시작 중…' : '추적 시작'}
            </button>
          </>
        )}

        {/* ── 추적 중일 때 ── */}
        {isTracking && (
          <>
            {/* 녹색 펄스 인디케이터 */}
            <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center shrink-0">
              <span className="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse" />
            </div>

            {/* 현재 업무 + 경과시간 */}
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="text-sm font-semibold text-white truncate max-w-[120px]">
                {currentTask?.label || effectiveTask}
              </span>
              {liveStats && (
                <span className="text-xs text-gray-400 whitespace-nowrap">
                  추적 중 {liveStats.elapsedMinutes}분
                </span>
              )}
            </div>

            {/* 구분선 */}
            <div className="w-px h-5 bg-gray-700 shrink-0" />

            {/* 실시간 통계 (간소화) */}
            {liveStats && (
              <div className="flex items-center gap-3 text-xs text-gray-400 whitespace-nowrap">
                <span>활성 <span className="text-gray-200 font-medium">{liveStats.activeMinutes}분</span></span>
                <span>딥포커스 <span className="text-gray-200 font-medium">{liveStats.deepFocusMinutes}분</span></span>
                <span>전환 <span className="text-gray-200 font-medium">{liveStats.contextSwitches}회</span></span>
              </div>
            )}

            {/* 구분선 */}
            <div className="w-px h-5 bg-gray-700 shrink-0" />

            {/* 종료 버튼 */}
            <button
              onClick={handleStop}
              disabled={loading}
              className="px-4 py-1.5 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-colors shrink-0"
            >
              {loading ? '종료 중…' : '종료'}
            </button>
          </>
        )}

        {/* 에러 표시 (바 위에 팝업) */}
        {error && (
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-red-900/90 text-red-200 text-xs px-4 py-2 rounded-xl border border-red-700 shadow-lg whitespace-nowrap">
            {error}
          </div>
        )}

        {/* 직전 세션 결과 (바 위에 팝업) */}
        {lastSession && (
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-gray-800 text-gray-200 text-xs px-4 py-3 rounded-xl border border-gray-700 shadow-lg">
            <p className="font-semibold text-brand-400 mb-1">방금 세션 결과</p>
            <div className="flex items-center gap-3">
              <span className="text-lg font-bold text-brand-300">{lastSession.score}점</span>
              <div className="text-gray-400">
                <p>집중 {lastSession.deepFocusMinutes}분 · 활성 {lastSession.activeMinutes}분 · 전환 {lastSession.contextSwitches}회</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
