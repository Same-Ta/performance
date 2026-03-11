import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useSearchParams } from 'react-router-dom';
import {
  RefreshCw,
  Eye,
  EyeOff,
  Download,
} from 'lucide-react';
import clsx from 'clsx';
import { getNotionSettings, saveNotionSettings } from '../services/firestoreService';
import { testNotionConnection } from '../services/notionService';
import type { NotionSettings } from '../types';

type Tab = 'agent' | 'privacy' | 'integrations' | 'notifications' | 'profile' | 'subscription';

const validTabs: Tab[] = ['agent', 'privacy', 'integrations', 'notifications', 'profile', 'subscription'];

const AGENT_URL = 'http://localhost:5001';
const AGENT_DOWNLOAD_URL = 'https://jdukwvlasmphsiojqmwv.supabase.co/storage/v1/object/public/downloads/ProofWorkAgent.exe';

export default function Settings() {
  const { profile, updateProfileData } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab') as Tab | null;
  const [activeTab, setActiveTab] = useState<Tab>(
    tabParam && validTabs.includes(tabParam) ? tabParam : 'agent'
  );

  // URL query param 변경 시 동기화
  useEffect(() => {
    if (tabParam && validTabs.includes(tabParam) && tabParam !== activeTab) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
    if (tab === 'agent') {
      setSearchParams({});
    } else {
      setSearchParams({ tab });
    }
  };
  const [editingProfile, setEditingProfile] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDept, setEditDept] = useState('');
  const [editPosition, setEditPosition] = useState('');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);
  const [profileError, setProfileError] = useState('');

  const startEditProfile = () => {
    setEditName(profile?.displayName ?? '');
    setEditDept(profile?.department ?? '');
    setEditPosition(profile?.position ?? '');
    setProfileSaved(false);
    setProfileError('');
    setEditingProfile(true);
  };

  const saveProfile = async () => {
    setProfileSaving(true);
    setProfileError('');
    try {
      await updateProfileData({ displayName: editName, department: editDept, position: editPosition });
      setProfileSaved(true);
      setEditingProfile(false);
    } catch {
      setProfileError('저장 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setProfileSaving(false);
    }
  };
  const [captureInterval, setCaptureInterval] = useState(5);
  const [autoDeleteMinutes, setAutoDeleteMinutes] = useState(0);
  const [privacyMode, setPrivacyMode] = useState<'strict' | 'balanced'>('strict');
  const [jiraEnabled, setJiraEnabled] = useState(false);
  const [slackEnabled, setSlackEnabled] = useState(true);

  // --- Agent 상태 ---
  const [agentOnline, setAgentOnline] = useState(false);
  const [agentVersion, setAgentVersion] = useState('');
  const [startupRegistered, setStartupRegistered] = useState(false);
  const [startupToggling, setStartupToggling] = useState(false);

  useEffect(() => {
    const check = async () => {
      try {
        const res = await fetch(`${AGENT_URL}/health`, { signal: AbortSignal.timeout(2000) });
        if (res.ok) {
          const data = await res.json();
          setAgentOnline(true);
          setAgentVersion(data.version ?? '');
        } else {
          setAgentOnline(false);
        }
      } catch {
        setAgentOnline(false);
      }
    };
    // Settings 탭에 있을 때만 확인, 이후 10초 간격 체크
    if (activeTab !== 'agent') return;
    check();
    const id = setInterval(check, 10000);
    return () => clearInterval(id);
  }, [activeTab]);

  useEffect(() => {
    if (!agentOnline) return;
    fetch(`${AGENT_URL}/startup/status`, { signal: AbortSignal.timeout(2000) })
      .then((r) => r.json())
      .then((data) => setStartupRegistered(data.registered ?? false))
      .catch(() => {});
  }, [agentOnline]);

  const handleStartupToggle = async () => {
    setStartupToggling(true);
    try {
      const method = startupRegistered ? 'DELETE' : 'POST';
      const res = await fetch(`${AGENT_URL}/startup/register`, { method });
      if (res.ok) setStartupRegistered(!startupRegistered);
    } catch {
      // silently ignore
    } finally {
      setStartupToggling(false);
    }
  };

  // --- Notion 연동 상태 ---
  const DEFAULT_NOTION: NotionSettings = {
    apiKey: '',
    databaseId: '',
    statusProperty: '상태',
    doingValue: '진행 중',
    doneValue: '완료',
    progressProperty: '달성률',
    assigneeProperty: '담당자',
    enabled: false,
  };
  const [notion, setNotion] = useState<NotionSettings>(DEFAULT_NOTION);
  const [notionLoading, setNotionLoading] = useState(false);
  const [notionSaving, setNotionSaving] = useState(false);
  const [notionSaved, setNotionSaved] = useState(false);
  const [notionError, setNotionError] = useState('');
  const [notionTesting, setNotionTesting] = useState(false);
  const [notionTestResult, setNotionTestResult] = useState<{ ok: boolean; message: string } | null>(null);

  const handleNotionTest = async () => {
    if (!notion.apiKey.trim() || !notion.databaseId.trim()) {
      setNotionTestResult({ ok: false, message: 'API 키와 Database ID를 먼저 입력해주세요.' });
      return;
    }
    setNotionTesting(true);
    setNotionTestResult(null);
    try {
      const result = await testNotionConnection(notion.apiKey, notion.databaseId);
      setNotionTestResult(result);
    } catch (e) {
      const msg = e instanceof Error ? e.message : '연결 테스트 실패';
      setNotionTestResult({ ok: false, message: msg });
    } finally {
      setNotionTesting(false);
    }
  };
  const [showApiKey, setShowApiKey] = useState(false);

  // integrations 탭 진입 시 저장된 Notion 설정 로드
  useEffect(() => {
    if (activeTab !== 'integrations' || !profile?.uid) return;
    setNotionLoading(true);
    getNotionSettings(profile.uid)
      .then((settings) => {
        if (settings) setNotion(settings);
      })
      .catch(() => {})
      .finally(() => setNotionLoading(false));
  }, [activeTab, profile?.uid]);

  const handleNotionSave = async () => {
    if (!profile?.uid) return;
    if (!notion.apiKey.trim() || !notion.databaseId.trim()) {
      setNotionError('API 키와 데이터베이스 ID는 필수입니다');
      return;
    }
    setNotionError('');
    setNotionSaving(true);
    try {
      await saveNotionSettings(profile.uid, { ...notion, enabled: true });
      setNotionSaved(true);
      setTimeout(() => setNotionSaved(false), 3000);
    } catch {
      setNotionError('저장 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setNotionSaving(false);
    }
  };

  const tabs: { id: Tab; label: string }[] = [
    { id: 'profile', label: '프로필' },
    { id: 'agent', label: 'Agent 설정' },
    { id: 'privacy', label: '프라이버시' },
    { id: 'integrations', label: '연동 관리' },
    { id: 'notifications', label: '알림 설정' },
    { id: 'subscription', label: '구독 / 플랜' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">설정</h1>
        <p className="text-sm text-gray-500 mt-1">
          On-Device Agent 및 서비스 설정을 관리합니다.
        </p>
      </div>

      {/* 탭 */}
      <div className="flex gap-2 border-b border-gray-200 pb-0">
        {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={clsx(
                'px-4 py-2.5 text-sm font-medium border-b-2 transition-all -mb-px',
                activeTab === tab.id
                  ? 'border-gray-900 text-gray-900'
                  : 'border-transparent text-gray-400 hover:text-gray-700'
              )}
            >
              {tab.label}
            </button>
        ))}
      </div>

      {/* Agent 설정 */}
      {activeTab === 'agent' && (
        <div className="space-y-4">
          {/* Agent 상태 · 설치 카드 */}
          <div className="card space-y-5">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-bold text-gray-900">On-Device Agent</h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  로컬 PC에서 실행되는 프라이버시 보호 추적 엔진
                </p>
              </div>
              <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                agentOnline ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-400'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${
                  agentOnline ? 'bg-green-500 animate-pulse' : 'bg-gray-300'
                }`} />
                {agentOnline ? `연결됨 v${agentVersion}` : '오프라인'}
              </span>
            </div>

            {/* 미설치 / 오프라인 */}
            {!agentOnline && (
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <p className="text-xs font-semibold text-gray-700 mb-3">설치 방법</p>
                  <ol className="space-y-3">
                    <li className="flex items-start gap-3">
                      <span className="shrink-0 w-5 h-5 bg-brand-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">1</span>
                      <div>
                        <p className="text-xs font-medium text-gray-800">프로그램 다운로드</p>
                        <p className="text-xs text-gray-400 mt-0.5">아래 버튼을 눌러 <strong>ProofWorkAgent.exe</strong>를 다운로드하세요</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="shrink-0 w-5 h-5 bg-brand-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">2</span>
                      <div>
                        <p className="text-xs font-medium text-gray-800">프로그램 실행</p>
                        <p className="text-xs text-gray-400 mt-0.5">다운로드한 exe를 실행하면 백그라운드에서 로컬 서버가 자동 시작됩니다</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="shrink-0 w-5 h-5 bg-brand-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">3</span>
                      <div>
                        <p className="text-xs font-medium text-gray-800">추적 시작</p>
                        <p className="text-xs text-gray-400 mt-0.5">대시보드로 돌아가 [추적 시작] 버튼을 누르면 자동으로 연결됩니다</p>
                      </div>
                    </li>
                  </ol>
                </div>
                <a
                  href={AGENT_DOWNLOAD_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary flex items-center justify-center gap-2 w-full"
                >
                  <Download className="w-4 h-4" />
                  ProofWorkAgent.exe 다운로드
                </a>
              </div>
            )}

            {/* 연결됨 상태 */}
            {agentOnline && (
              <div className="space-y-3">
                <div className="p-3 bg-green-50 rounded-xl border border-green-200">
                  <p className="text-xs font-medium text-green-600">
                    ✅ On-Device Agent가 정상 연결되었습니다. 대시보드에서 [추적 시작]을 눌러 AI 화면 분석 추적을 시작하세요
                  </p>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-200">
                  <div>
                    <p className="text-sm font-medium text-gray-800">PC 시작 시 자동 실행</p>
                    <p className="text-xs text-gray-400 mt-0.5">Windows 로그인 시 에이전트가 자동으로 시작됩니다</p>
                  </div>
                  <button
                    onClick={handleStartupToggle}
                    disabled={startupToggling}
                    className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
                      startupRegistered ? 'bg-brand-600' : 'bg-gray-300'
                    } ${startupToggling ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                      startupRegistered ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 고급 설정 */}
          <div className="card space-y-6">
            <h3 className="text-sm font-bold text-gray-900">고급 설정</h3>
            <div>
              <h4 className="text-sm font-bold text-gray-900 mb-1">캡처 간격 (초)</h4>
              <p className="text-xs text-gray-400 mb-3">
                화면 스크린샷 캡처 주기입니다. 높을수록 리소스를 덜 사용합니다
              </p>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min={1}
                  max={30}
                  value={captureInterval}
                  onChange={(e) => setCaptureInterval(Number(e.target.value))}
                  className="flex-1"
                />
                <span className="text-sm font-bold text-brand-600 w-12 text-right">
                  {captureInterval}초
                </span>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-bold text-gray-900 mb-1">리소스 제한</h4>
              <p className="text-xs text-gray-400 mb-3">
                On-Device Agent의 최대 CPU/GPU 점유율 제한
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                  <p className="text-xs text-gray-400 mb-1">최대 CPU 점유율</p>
                  <p className="text-xl font-bold text-gray-900">10%</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                  <p className="text-xs text-gray-400 mb-1">최대 GPU 점유율</p>
                  <p className="text-xl font-bold text-gray-900">10%</p>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-bold text-gray-900 mb-1">AI 모델</h4>
              <p className="text-xs text-gray-400 mb-3">
                현재 사용 중인 On-Device 비전 모델
              </p>
              <div className="p-3 bg-brand-500/10 rounded-xl flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-brand-600">MobileNetV3 + TinyVLM (INT8 Quantized)</p>
                  <p className="text-xs text-gray-400">TensorRT 최적화 | 모델 크기: 45MB</p>
                </div>
                <button className="btn-ghost flex items-center gap-1 text-xs">
                  업데이트 확인
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 프라이버시 설정 */}
      {activeTab === 'privacy' && (
        <div className="card space-y-6">
          <div className="p-4 bg-green-50 rounded-xl border border-green-200">
            <div className="flex items-start gap-3">
              <div>
                <h3 className="text-sm font-bold text-green-600">Privacy-by-Design 보장</h3>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                  모든 영상 데이터는 로컬 PC에서만 처리되며, 분석 즉시 폐기됩니다.
                  다른 서버 전송은 직원 본인 및 허치 데이터만 전송됩니다.
                </p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold text-gray-900 mb-3">프라이버시 모드</h3>
            <div className="space-y-3">
              <label className={clsx(
                'flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all',
                privacyMode === 'strict' ? 'border-brand-500/50 bg-brand-500/10' : 'border-gray-200'
              )}>
                <input
                  type="radio"
                  name="privacy"
                  checked={privacyMode === 'strict'}
                  onChange={() => setPrivacyMode('strict')}
                  className="mt-1"
                />
                <div>
                  <p className="text-sm font-semibold text-gray-900">엄격 모드 (권장)</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    프레임 즉시 폐기 + 메모리 제로잉 + 민감 영역 자동 블러
                  </p>
                </div>
              </label>

              <label className={clsx(
                'flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all',
                privacyMode === 'balanced' ? 'border-brand-500/50 bg-brand-500/10' : 'border-gray-200'
              )}>
                <input
                  type="radio"
                  name="privacy"
                  checked={privacyMode === 'balanced'}
                  onChange={() => setPrivacyMode('balanced')}
                  className="mt-1"
                />
                <div>
                  <p className="text-sm font-semibold text-gray-900">밸런스 모드</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    최근 5분 범위 유지 (정확도 향상) + 폐기 로그 기록
                  </p>
                </div>
              </label>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold text-gray-900 mb-1">자동 분석 프레임 폐기</h3>
            <p className="text-xs text-gray-400 mb-3">
              분석 완료 후 로컬 임시 데이터 폐기까지의 유지 시간
            </p>
            <select
              className="input-field"
              value={autoDeleteMinutes}
              onChange={(e) => setAutoDeleteMinutes(Number(e.target.value))}
            >
              <option value={0}>즉시 폐기 (0초)</option>
              <option value={1}>1분 후 폐기</option>
              <option value={5}>5분 후 폐기</option>
            </select>
          </div>
        </div>
      )}

      {/* 연동 설정 */}
      {activeTab === 'integrations' && (
        <div className="space-y-6">
          {/* 헤더 */}
          <div>
            <h2 className="text-lg font-bold text-gray-900">연동 관리</h2>
            <p className="text-sm text-gray-500 mt-1">
              사용 중인 서비스를 연동하고 데이터를 쉽게 공유해보세요. 서비스별 상세 설정에서 자동화 옵션을 관리할 수 있어요
            </p>
          </div>

          {/* 서비스 카드 목록 */}
          <div className="space-y-3">
            {/* Slack */}
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
              <div className="px-6 py-5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
                    <img src="/icons/slack.svg" alt="Slack" className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-base font-bold text-gray-900">슬랙</p>
                      {slackEnabled && <span className="text-gray-400">›</span>}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setSlackEnabled(!slackEnabled)}
                  className={clsx(
                    'px-5 py-2 rounded-lg text-sm font-semibold transition-colors',
                    slackEnabled
                      ? 'bg-gray-100 text-gray-500'
                      : 'bg-gray-900 text-white hover:bg-gray-800',
                  )}
                >
                  {slackEnabled ? '연동 해제' : '연동하기'}
                </button>
              </div>
              <div className="px-6 pb-5 -mt-1">
                <p className="text-sm text-gray-400">일일 업무 요약을 슬랙으로 바로 공유할 수 있어요</p>
              </div>
            </div>

            {/* Notion */}
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
              <div className="px-6 py-5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center">
                    <img src="/icons/notion.svg" alt="Notion" className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-base font-bold text-gray-900">노션</p>
                      {notion.enabled && <span className="text-gray-400">›</span>}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    if (notion.enabled) {
                      setNotion(prev => ({ ...prev, enabled: false }));
                    }
                  }}
                  className={clsx(
                    'px-5 py-2 rounded-lg text-sm font-semibold transition-colors',
                    notion.enabled
                      ? 'bg-gray-100 text-gray-500'
                      : 'bg-gray-900 text-white hover:bg-gray-800',
                  )}
                >
                  {notion.enabled ? '연동 해제' : '연동하기'}
                </button>
              </div>
              <div className="px-6 pb-5 -mt-1">
                <p className="text-sm text-gray-400">진행 중 태스크를 노션에서 바로 조회하고 AI가 달성률을 업데이트해요</p>
              </div>

              {/* Notion 설정 패널 (연동됨 또는 연동하기 클릭 시) */}
              {(notion.enabled || (!notion.enabled && notion.apiKey)) && (
                <div className="border-t border-gray-100 px-6 py-5 space-y-4 bg-gray-50/50">
                  {notionLoading ? (
                    <div className="flex items-center justify-center py-4">
                      <RefreshCw className="w-5 h-5 animate-spin text-gray-400" />
                    </div>
                  ) : (
                    <>
                      <div className="p-3 bg-blue-50 rounded-xl text-xs text-blue-700 leading-relaxed">
                        <p className="font-semibold mb-1">빠른 Notion Integration Token 발급 방법</p>
                        <ol className="list-decimal list-inside space-y-0.5 text-blue-600">
                          <li>notion.so/my-integrations 접속 후 새 통합 생성</li>
                          <li>통합 토큰(secret_...) 복사</li>
                          <li>연동할 Notion DB 페이지 ··· 메뉴 → 연결 → 통합 추가</li>
                          <li>DB URL에서 database ID 복사 (32자리 hex 값)</li>
                        </ol>
                      </div>

                      <div>
                        <label className="text-xs font-medium text-gray-700 block mb-1">
                          Integration Token <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <input
                            type={showApiKey ? 'text' : 'password'}
                            value={notion.apiKey}
                            onChange={(e) => setNotion(prev => ({ ...prev, apiKey: e.target.value }))}
                            placeholder="secret_xxxxxxxxxxxxxxxxxxxxxxxx"
                            className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 pr-10 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-500/40"
                          />
                          <button
                            type="button"
                            onClick={() => setShowApiKey(!showApiKey)}
                            className="absolute right-2.5 top-2.5 text-gray-400 hover:text-gray-700"
                          >
                            {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-medium text-gray-700 block mb-1">
                          Database ID 또는 Notion URL <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={notion.databaseId}
                          onChange={(e) => {
                            const val = e.target.value.trim();
                            const urlMatch = val.match(/([0-9a-f]{8}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{12})/i);
                            const extracted = urlMatch ? urlMatch[1] : val;
                            setNotion(prev => ({ ...prev, databaseId: extracted }));
                            setNotionTestResult(null);
                          }}
                          placeholder="URL 전체 붙여넣기 또는 32자리 ID 입력"
                          className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-500/40"
                        />
                        <p className="text-xs text-gray-400 mt-1">
                          현재 입력된 ID: <code className="bg-gray-100 px-1 rounded">{notion.databaseId || '(없음)'}</code>
                        </p>
                      </div>

                      <details className="group">
                        <summary className="text-xs font-medium text-gray-500 cursor-pointer hover:text-gray-900 list-none flex items-center gap-1">
                          <span className="group-open:rotate-90 transition-transform inline-block">▶</span>
                          고급 설정 (DB 속성명 커스터마이즈)
                        </summary>
                        <div className="mt-3 grid sm:grid-cols-2 gap-3">
                          {[
                            { label: '상태 속성명', key: 'statusProperty' as const },
                            { label: '진행 중 값', key: 'doingValue' as const },
                            { label: '완료 값', key: 'doneValue' as const },
                            { label: '달성률 속성명', key: 'progressProperty' as const },
                            { label: '담당자 속성명', key: 'assigneeProperty' as const },
                          ].map(field => (
                            <div key={field.key}>
                              <label className="text-xs text-gray-400 block mb-1">{field.label}</label>
                              <input
                                type="text"
                                value={notion[field.key]}
                                onChange={(e) => setNotion(prev => ({ ...prev, [field.key]: e.target.value }))}
                                className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-500/40"
                              />
                            </div>
                          ))}
                        </div>
                      </details>

                      {notionTestResult && (
                        <div className={`text-xs rounded-lg px-3 py-2 border ${
                          notionTestResult.ok
                            ? 'text-green-600 bg-green-50 border-green-200'
                            : 'text-red-600 bg-red-50 border-red-200'
                        }`}>
                          <span className="font-semibold">{notionTestResult.ok ? '✅ ' : '❌ '}</span>
                          {notionTestResult.message}
                        </div>
                      )}

                      {notionError && (
                        <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{notionError}</p>
                      )}

                      {notionSaved && (
                        <div className="text-xs text-green-600 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                          Notion 연동 설정이 저장되었습니다.
                        </div>
                      )}

                      <div className="flex items-center justify-end gap-2 pt-1">
                        <button
                          onClick={handleNotionTest}
                          disabled={notionTesting}
                          className="btn-ghost flex items-center gap-2 text-sm border border-gray-300"
                        >
                          {notionTesting ? '테스트 중...' : '연결 테스트'}
                        </button>
                        <button
                          onClick={handleNotionSave}
                          disabled={notionSaving}
                          className="btn-primary flex items-center gap-2 text-sm"
                        >
                          {notionSaving ? '저장 중...' : 'Notion 저장'}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Jira */}
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
              <div className="px-6 py-5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                    <img src="/icons/jira.svg" alt="Jira" className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-base font-bold text-gray-900">지라</p>
                  </div>
                </div>
                <button
                  onClick={() => setJiraEnabled(!jiraEnabled)}
                  className={clsx(
                    'px-5 py-2 rounded-lg text-sm font-semibold transition-colors',
                    jiraEnabled
                      ? 'bg-gray-100 text-gray-500'
                      : 'bg-gray-900 text-white hover:bg-gray-800',
                  )}
                >
                  {jiraEnabled ? '연동 해제' : '연동하기'}
                </button>
              </div>
              <div className="px-6 pb-5 -mt-1">
                <p className="text-sm text-gray-400">KPI/OKR 이슈를 지라에서 자동으로 매핑할 수 있어요</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 알림 설정 */}
      {activeTab === 'notifications' && (
        <div className="card space-y-4">
          <h3 className="text-sm font-bold text-gray-900 mb-2">알림 설정</h3>
          {[
            { label: '일일 업무 요약 알림', desc: '매일 퇴근 시 요약 리포트 알림', default: true },
            { label: '데이터 검토 요청', desc: 'Agent 분석 완료 시 검토 요청', default: true },
            { label: '목표 정렬도 경고', desc: '정렬도가 50% 이하일 때 알림', default: true },
            { label: '보상 티어 변동', desc: '보상 등급 변경 시 알림', default: true },
            { label: '과로 경고', desc: '연속 10시간 이상 근무 시 알림', default: false },
          ].map((item, i) => (
            <div key={i} className="flex items-center justify-between p-3 border border-gray-200 rounded-xl">
              <div>
                <p className="text-sm font-medium text-gray-800">{item.label}</p>
                <p className="text-xs text-gray-400">{item.desc}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  defaultChecked={item.default}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-600" />
              </label>
            </div>
          ))}
        </div>
      )}

      {/* 저장 버튼 (agent/privacy/notifications 탭) */}
      {['agent', 'privacy', 'notifications'].includes(activeTab) && (
        <div className="flex justify-end">
          <button className="btn-primary flex items-center gap-2">
            설정 저장
          </button>
        </div>
      )}

      {/* 프로필 탭 */}
      {activeTab === 'profile' && profile && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="section-title flex items-center gap-2">
              프로필 정보
            </h3>
            {!editingProfile ? (
              <button
                onClick={startEditProfile}
                className="flex items-center gap-1.5 text-xs text-brand-500 hover:text-brand-600 font-medium"
              >
                편집
              </button>
            ) : (
              <button
                onClick={() => setEditingProfile(false)}
                className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-700 font-medium"
              >
                취소
              </button>
            )}
          </div>

          {/* 아바타 영역 */}
          <div className="flex items-center gap-4 mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
            <div className="w-16 h-16 rounded-full bg-brand-600 text-white font-bold flex items-center justify-center text-2xl">
              {(profile.displayName ?? 'U')[0].toUpperCase()}
            </div>
            <div>
              <p className="text-lg font-bold text-gray-900">{profile.displayName || '미설정'}</p>
              <p className="text-sm text-gray-500">{profile.email}</p>
              <span className="mt-1 inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-500/15 text-brand-500 uppercase">{profile.role}</span>
            </div>
          </div>

          {profileSaved && !editingProfile && (
            <div className="mb-3 flex items-center gap-2 text-xs text-green-600 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
              프로필이 저장되었습니다.
            </div>
          )}

          {profileError && (
            <div className="mb-3 flex items-center gap-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {profileError}
            </div>
          )}

          {editingProfile ? (
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-400 block mb-1">이름</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-500/40"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 block mb-1">이메일 (변경 불가)</label>
                <input
                  type="text"
                  value={profile.email}
                  disabled
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-gray-50 text-gray-400 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 block mb-1">부서</label>
                <input
                  type="text"
                  value={editDept}
                  onChange={(e) => setEditDept(e.target.value)}
                  className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-500/40"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 block mb-1">직책</label>
                <input
                  type="text"
                  value={editPosition}
                  onChange={(e) => setEditPosition(e.target.value)}
                  className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-500/40"
                />
              </div>
              <div className="sm:col-span-2 flex justify-end">
                <button
                  onClick={saveProfile}
                  disabled={profileSaving}
                  className="btn-primary flex items-center gap-2 text-sm"
                >
                  {profileSaving ? '저장 중...' : '저장'}
                </button>
              </div>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-400">이름</p>
                <p className="text-sm font-semibold text-gray-900">{profile.displayName || <span className="text-gray-400 italic">미설정</span>}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">이메일</p>
                <p className="text-sm font-semibold text-gray-900">{profile.email}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">부서</p>
                <p className="text-sm font-semibold text-gray-900">{profile.department || <span className="text-gray-400 italic">미설정</span>}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">직책</p>
                <p className="text-sm font-semibold text-gray-900">{profile.position || <span className="text-gray-400 italic">미설정</span>}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 구독 / 플랜 탭 */}
      {activeTab === 'subscription' && (
        <div className="space-y-6">
          <div className="card">
            <h3 className="section-title flex items-center gap-2 mb-4">
              현재 플랜
            </h3>
            <div className="p-4 bg-brand-500/10 rounded-xl border border-brand-500/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-bold text-brand-600">Free Plan</p>
                  <p className="text-sm text-gray-500 mt-1">기본 기능을 무료로 사용 중입니다.</p>
                </div>
                <span className="text-2xl font-bold text-brand-600">₩0<span className="text-sm font-normal text-gray-400">/월</span></span>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="text-sm font-bold text-gray-900 mb-4">플랜 비교</h3>
            <div className="grid md:grid-cols-3 gap-4">
              {[
                { name: 'Free', price: '₩0', features: ['사용자 최대 3명', '기본 리포트', '7일 데이터 보관'], current: true },
                { name: 'Pro', price: '₩9,900', features: ['사용자 최대 20명', '상세 리포트 & 피벗', '90일 데이터 보관', 'Jira / Slack 연동'], current: false },
                { name: 'Enterprise', price: '문의', features: ['무제한 사용자', '커스텀 리포트', '무제한 데이터 보관', 'SSO / SAML', '전담 지원'], current: false },
              ].map(plan => (
                <div
                  key={plan.name}
                  className={clsx(
                    'p-4 rounded-xl border-2 transition-all',
                    plan.current ? 'border-brand-500/50 bg-brand-500/10' : 'border-gray-200',
                  )}
                >
                  <p className="text-sm font-bold text-gray-900">{plan.name}</p>
                  <p className="text-xl font-bold text-brand-500 mt-1">{plan.price}<span className="text-xs font-normal text-gray-400">{plan.name !== 'Enterprise' ? '/월' : ''}</span></p>
                  <ul className="mt-3 space-y-1.5">
                    {plan.features.map((f, i) => (
                      <li key={i} className="text-xs text-gray-500 flex items-center gap-1.5">
                        ✓ {f}
                      </li>
                    ))}
                  </ul>
                  <button
                    className={clsx(
                      'mt-4 w-full text-xs font-semibold py-2 rounded-lg transition-colors',
                      plan.current
                        ? 'bg-gray-100 text-gray-400 cursor-default'
                        : 'bg-brand-600 text-white hover:bg-brand-700',
                    )}
                    disabled={plan.current}
                  >
                    {plan.current ? '현재 플랜' : '업그레이드'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
