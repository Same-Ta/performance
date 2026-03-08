import { useState, useEffect, useRef, useCallback } from 'react';
import LoginModal from '../components/LoginModal';
import { ChevronDown, ChevronUp, Menu, X } from 'lucide-react';
import clsx from 'clsx';

/* --- Scroll Reveal Hook --- */
function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { el.classList.add('visible'); observer.unobserve(el); } },
      { threshold: 0.15 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return ref;
}

function Reveal({ children, className = '', scale = false, delay = 0 }: {
  children: React.ReactNode; className?: string; scale?: boolean; delay?: number;
}) {
  const ref = useReveal();
  const delayClass = delay > 0 ? `reveal-delay-${delay}` : '';
  return (
    <div ref={ref} className={clsx(scale ? 'reveal-scale' : 'reveal', delayClass, className)}>
      {children}
    </div>
  );
}

/* --- Constants --- */

const NAV_LINKS = [
  { label: '기능', href: '#features' },
  { label: '도입 프로세스', href: '#process' },
  { label: '비교', href: '#comparison' },
  { label: '활용 사례', href: '#use-cases' },
  { label: '요금제', href: '#pricing' },
  { label: 'FAQ', href: '#faq' },
];

const FEATURES = [
  {
    title: 'AI 성과 스코어링',
    desc: 'On-Device AI가 몰입도, 효율성, 목표 정렬도를 자동 스코어링합니다.',
    detail: '자세히보기',
    color: 'brand',
  },
  {
    title: '실시간 활동 추적',
    desc: '앱, 웹사이트, 딥포커스 시간을 자동으로 기록하고 분류합니다.',
    detail: '자세히보기',
    color: 'green',
  },
  {
    title: '이미지 기반 분석',
    desc: 'ONNX 비전 엔진이 화면을 분류하고, 컨텍스트 분석기가 업무 패턴을 파악합니다.',
    detail: '자세히보기',
    color: 'purple',
  },
  {
    title: '팀 대시보드 & 리포트',
    desc: '매니저를 위한 팀 성과 대시보드와 자동 리포트 생성을 제공합니다.',
    detail: '자세히보기',
    color: 'amber',
  },
];

const STEPS = [
  {
    step: 'STEP 01',
    title: '설치 및 분석',
    desc: 'On-Device Agent를 설치하면 AI가 자동으로 화면 활동을 분석합니다. ONNX 기반 경량 모델로 시스템 부하 최소화.',
    tags: ['AI 자동 분석', 'On-Device 처리'],
  },
  {
    step: 'STEP 02',
    title: '리뷰 및 승인',
    desc: '하루 끝에 AI가 산출한 성과 데이터를 직접 리뷰하고 승인합니다. PII 자동 제거로 프라이버시를 보장합니다.',
    tags: ['데이터 리뷰', '프라이버시 보호'],
  },
  {
    step: 'STEP 03',
    title: '인사이트 & 성장',
    desc: '승인된 데이터가 클라우드에 동기화됩니다. AI 리포트, 효율성 차트, 팀 분석으로 지속적인 성과 향상을 달성하세요.',
    tags: ['AI 리포트', '팀 분석'],
  },
];

const BENEFITS = [
  {
    title: '관리 비용 절감',
    desc: '수작업 리포트 작성과 성과 추적에\n소요되는 시간을 대폭 줄입니다.',
  },
  {
    title: '성과 데이터 신뢰도',
    desc: 'AI 기반 정량적 분석으로\n추정치가 아닌 실제 데이터를 확보합니다.',
  },
  {
    title: '팀 생산성 극대화',
    desc: '실시간 인사이트와 AI 제안으로\n팀의 몰입도와 효율을 끌어올립니다.',
  },
];

const USE_CASES = [
  {
    title: 'IT / 개발팀',
    desc: '코딩 시간, 코드리뷰, 딥포커스를 자동 분석하여 개발 생산성을 측정합니다.',
  },
  {
    title: '디자인 / 크리에이티브팀',
    desc: 'Figma, Photoshop 등 크리에이티브 도구 사용 패턴과 몰입 시간을 추적합니다.',
  },
  {
    title: 'HR / 매니저',
    desc: '팀 대시보드에서 구성원별 성과를 확인하고 자동 리포트로 평가를 간소화합니다.',
  },
];

const PRICING_PLANS = [
  {
    name: 'Free',
    subtitle: '개인 사용자',
    price: '₩0',
    period: '영구 무료',
    cta: '무료로 시작',
    highlight: false,
    features: ['개인 대시보드', '일일 활동 추적', '기본 AI 요약', 'On-Device 분석', '데이터 리뷰 & 승인'],
  },
  {
    name: 'Pro',
    subtitle: '성과 & 생산성',
    price: '₩9,900',
    period: '월 / 사용자',
    cta: '14일 무료 체험',
    highlight: true,
    features: ['Free의 모든 기능', '상세 시간 리포트', '효율성 & 몰입도 차트', '목표 정렬도 분석', 'Gemini AI 상세 리포트', '앱 & 웹사이트 카테고리 분석', '타임시트 내보내기'],
  },
  {
    name: 'Team',
    subtitle: '팀 관리 & 분석',
    price: '₩19,900',
    period: '월 / 사용자',
    cta: '14일 무료 체험',
    highlight: false,
    features: ['Pro의 모든 기능', '팀 대시보드', '매니저 성과 리뷰', '타임시트 승인 워크플로우', 'Notion / Jira 연동', 'Slack 알림', '팀 효율성 비교 분석'],
  },
  {
    name: 'Enterprise',
    subtitle: '보안 & 맞춤',
    price: '문의',
    period: '맞춤 견적',
    cta: '영업팀 문의',
    highlight: false,
    features: ['Team의 모든 기능', '전용 지원 & SLA', 'SSO 로그인', '온프레미스 설치', '커스텀 연동 개발', '감사 로그', '전담 계정 매니저'],
  },
];

const FAQ_ITEMS = [
  { q: 'ProofWork는 어떻게 업무를 추적하나요?', a: 'On-Device AI Agent가 사용 중인 앱, 웹사이트, 윈도우 타이틀을 실시간으로 분석합니다. ONNX 기반 비전 엔진이 화면을 분류하고, 컨텍스트 분석기가 업무 패턴을 파악합니다. 모든 처리는 로컬 기기에서 이루어지며, 원본 스크린샷은 절대 외부로 전송되지 않습니다.' },
  { q: '프라이버시는 어떻게 보호되나요?', a: '모든 스크린 분석이 로컬 기기에서 수행되며, PII(개인식별정보) 자동 제거 엔진이 민감한 데이터를 필터링합니다. 직원이 직접 데이터를 리뷰하고 승인한 메트릭만 클라우드에 전송됩니다.' },
  { q: 'PC 성능에 영향을 주지 않나요?', a: 'ONNX Runtime 기반의 경량화된 모델을 사용하여 CPU/GPU 부하를 최소화합니다. 필요시 분석 주기를 조절할 수 있습니다.' },
  { q: '어떤 성과 지표를 제공하나요?', a: '몰입도 점수, 효율성 점수, 목표 정렬도, 산출물 점수 등 핵심 4대 지표를 제공합니다. 또한 딥포커스 시간, 컨텍스트 전환율, 소프트웨어 카테고리별 사용 시간 등 세부 분석과 AI 기반 일일 업무 요약을 자동 생성합니다.' },
  { q: '팀 관리 기능은 어떻게 작동하나요?', a: '매니저는 팀 대시보드에서 구성원별 성과를 실시간으로 확인할 수 있습니다. 타임시트 승인 워크플로우, 팀 효율성 비교 분석, 자동 리포트 생성 기능을 제공합니다.' },
  { q: '무료 플랜에서도 AI 분석을 사용할 수 있나요?', a: '네, 무료 플랜에서도 On-Device AI 분석과 기본 AI 요약 기능을 이용할 수 있습니다. 상세 Gemini 리포트, 팀 분석, 고급 차트 등은 유료 플랜에서 제공됩니다.' },
];

const MARQUEE_TEXT = '모 든  업 무  성 과  관 리 는  P r o o f W o r k 에 서  쉽 고  간 편 하 게';

/* --- Sub-components --- */

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-gray-200 last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-6 text-left group"
      >
        <span className="font-semibold text-gray-900 text-lg pr-4 group-hover:text-brand-600 transition-colors">{q}</span>
        {open ? (
          <ChevronUp className="w-5 h-5 text-brand-600 shrink-0" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-400 shrink-0 group-hover:text-brand-600 transition-colors" />
        )}
      </button>
      <div className={clsx('overflow-hidden transition-all duration-300', open ? 'max-h-96 pb-6' : 'max-h-0')}>
        <p className="text-gray-500 leading-relaxed">{a}</p>
      </div>
    </div>
  );
}

/* --- Main Component --- */

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const openLogin = useCallback(() => setLoginModalOpen(true), []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white text-gray-900 overflow-x-hidden">

      {/* Navbar */}
      <nav className={clsx(
        'fixed top-0 inset-x-0 z-50 transition-all duration-300',
        scrolled ? 'bg-white/90 backdrop-blur-xl shadow-sm' : 'bg-transparent',
      )}>
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <a href="#" className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-lg bg-brand-600 text-white font-bold flex items-center justify-center text-sm">P</span>
            <span className="text-xl font-bold text-gray-900">Proof<span className="text-brand-600">Work</span></span>
          </a>

          <div className="hidden lg:flex items-center gap-8">
            {NAV_LINKS.map((l) => (
              <a key={l.href} href={l.href} className="text-sm font-medium text-gray-600 hover:text-brand-600 transition-colors">{l.label}</a>
            ))}
          </div>

          <div className="hidden lg:flex items-center gap-3">
            <button onClick={openLogin} className="text-sm font-semibold text-gray-600 hover:text-brand-600 transition-colors">로그인</button>
            <button onClick={openLogin} className="px-5 py-2.5 bg-brand-600 text-white text-sm font-semibold rounded-full hover:bg-brand-700 transition-colors">무료로 시작</button>
          </div>

          <button className="lg:hidden p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-t border-gray-100 px-6 pb-6 pt-4 space-y-4 animate-fade-in">
            {NAV_LINKS.map((l) => (
              <a key={l.href} href={l.href} className="block text-sm font-medium text-gray-700 hover:text-brand-600" onClick={() => setMobileMenuOpen(false)}>{l.label}</a>
            ))}
            <div className="pt-4 border-t border-gray-100 flex flex-col gap-3">
              <button onClick={() => { setMobileMenuOpen(false); openLogin(); }} className="text-sm font-semibold text-brand-600 text-left">로그인</button>
              <button onClick={() => { setMobileMenuOpen(false); openLogin(); }} className="px-5 py-2.5 bg-brand-600 text-white text-sm font-semibold rounded-full text-center hover:bg-brand-700">무료로 시작</button>
            </div>
          </div>
        )}
      </nav>

      {/* Marquee Ticker */}
      <div className="fixed top-16 inset-x-0 z-40 bg-brand-600 text-white overflow-hidden h-10 flex items-center">
        <div className="marquee-track">
          {[0, 1].map(i => (
            <span key={i} className="inline-block whitespace-nowrap text-sm font-medium tracking-[0.3em] px-12">
              {MARQUEE_TEXT} &nbsp;&nbsp;&nbsp; {MARQUEE_TEXT} &nbsp;&nbsp;&nbsp; {MARQUEE_TEXT} &nbsp;&nbsp;&nbsp;
            </span>
          ))}
        </div>
      </div>

      {/* Hero */}
      <section className="relative pt-40 pb-24 lg:pt-52 lg:pb-36 hero-gradient">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <Reveal>
              <div className="inline-flex items-center gap-2 px-5 py-2 bg-brand-50 text-brand-700 text-sm font-semibold rounded-full mb-8 border border-brand-100">
                On-Device AI 기반 · 프라이버시 최우선
              </div>
            </Reveal>

            <Reveal>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] mb-8">
                업무 성과를
                <br />
                <span className="text-brand-600">AI로 자동 증명</span>합니다
              </h1>
            </Reveal>

            <Reveal>
              <p className="text-lg sm:text-xl text-gray-500 max-w-2xl mx-auto mb-12 leading-relaxed">
                On-Device AI가 업무 활동을 실시간으로 분석하고,
                <br className="hidden sm:block" />
                몰입도 · 효율성 · 목표 정렬도를 자동 스코어링합니다.
              </p>
            </Reveal>

            <Reveal>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button onClick={openLogin} className="w-full sm:w-auto px-10 py-4 bg-brand-600 text-white font-semibold rounded-full hover:bg-brand-700 transition-all text-base shadow-xl shadow-brand-600/20">
                  무료 체험하기
                </button>
                <a href="#features" className="w-full sm:w-auto px-10 py-4 bg-white text-gray-700 font-semibold rounded-full border border-gray-200 hover:border-brand-300 hover:text-brand-700 transition-all text-base">
                  기능 살펴보기
                </a>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Problem Statement */}
      <section className="py-24 lg:py-32 bg-gray-50">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <Reveal>
            <h2 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-extrabold tracking-tight leading-[1.25] mb-8">
              팀의 업무 성과,
              <br />
              아직도 수작업으로 관리하고 있나요?
            </h2>
          </Reveal>
          <Reveal>
            <p className="text-gray-500 text-lg leading-relaxed max-w-2xl mx-auto mb-6">
              스프레드시트와 추정치로는 정확한 성과 평가가 어렵습니다.
              <br className="hidden sm:block" />
              AI가 자동으로 분석한 실제 데이터로 성과를 증명하세요.
            </p>
          </Reveal>
          <Reveal>
            <p className="text-gray-400 text-base leading-relaxed max-w-xl mx-auto">
              이제 기록을 넘어, 업무 성과의 가치를 높이는 관리 방식이 필요합니다.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Solution Statement (full-width dark) */}
      <section className="py-20 lg:py-24 bg-gray-900 text-white">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <Reveal>
            <h2 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-extrabold tracking-tight leading-[1.25]">
              활동 추적부터 AI 리포트까지,
              <br />
              <span className="text-brand-300">프라이버시 시대의 새로운 성과 관리 표준</span>을 세웁니다.
            </h2>
          </Reveal>
        </div>
      </section>

      {/* Features (4 cards) */}
      <section id="features" className="py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-6">
          <Reveal>
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">
                성과 관리를 위한 4가지 핵심 기능
              </h2>
            </div>
          </Reveal>

          <div className="grid sm:grid-cols-2 gap-5">
            {FEATURES.map((f, i) => {
              const colorMap: Record<string, { bg: string; border: string; tag: string }> = {
                brand: { bg: 'hover:bg-brand-50/50', border: 'hover:border-brand-200', tag: 'bg-brand-50 text-brand-600' },
                green: { bg: 'hover:bg-green-50/50', border: 'hover:border-green-200', tag: 'bg-green-50 text-green-600' },
                purple: { bg: 'hover:bg-purple-50/50', border: 'hover:border-purple-200', tag: 'bg-purple-50 text-purple-600' },
                amber: { bg: 'hover:bg-amber-50/50', border: 'hover:border-amber-200', tag: 'bg-amber-50 text-amber-600' },
              };
              const c = colorMap[f.color];
              return (
                <Reveal key={i} delay={Math.min(i + 1, 4) as 1 | 2 | 3 | 4}>
                  <div className={clsx(
                    'group rounded-2xl border border-gray-200 p-8 lg:p-10 transition-all duration-300 cursor-default',
                    c.bg, c.border, 'hover:shadow-xl',
                  )}>
                    <h3 className="text-xl font-bold mb-3 group-hover:text-brand-700 transition-colors">{f.title}</h3>
                    <p className="text-gray-500 leading-relaxed mb-5">{f.desc}</p>
                    <span className={clsx('inline-block text-xs font-semibold px-3 py-1 rounded-full', c.tag)}>{f.detail}</span>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* Process Steps (STEP 01 / 02 / 03) */}
      <section id="process" className="py-24 lg:py-32 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <Reveal>
            <div className="text-center max-w-2xl mx-auto mb-20">
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">
                업무 성과 관리, 한 번에 시작하세요
              </h2>
            </div>
          </Reveal>

          <div className="space-y-24 lg:space-y-32">
            {STEPS.map((s, i) => (
              <div key={i} className={clsx('grid lg:grid-cols-2 gap-12 lg:gap-16 items-center', i % 2 === 1 && 'lg:[direction:rtl]')}>
                {/* Text side */}
                <Reveal className={i % 2 === 1 ? 'lg:[direction:ltr]' : ''}>
                  <div>
                    <span className="inline-block text-xs font-bold text-brand-600 tracking-wider mb-4">{s.step}</span>
                    <h3 className="text-2xl sm:text-3xl font-extrabold mb-4">{s.title}</h3>
                    <p className="text-gray-500 text-lg leading-relaxed mb-6">{s.desc}</p>
                    <div className="flex flex-wrap gap-2">
                      {s.tags.map(tag => (
                        <span key={tag} className="px-3.5 py-1.5 bg-brand-50 text-brand-700 text-xs font-semibold rounded-full border border-brand-100">{tag}</span>
                      ))}
                    </div>
                  </div>
                </Reveal>

                {/* Mockup side */}
                <Reveal scale className={i % 2 === 1 ? 'lg:[direction:ltr]' : ''}>
                  {i === 0 && <StepMockup1 />}
                  {i === 1 && <StepMockup2 />}
                  {i === 2 && <StepMockup3 />}
                </Reveal>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison */}
      <section id="comparison" className="py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-6">
          <Reveal>
            <div className="text-center max-w-3xl mx-auto mb-16">
              <p className="text-sm font-semibold text-brand-600 mb-4">ProofWork는 자율 성과 관리에 집중합니다</p>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-[1.2]">
                진짜 효율을 끌어올리는
                <br />
                성과 관리 할 수 있으니까
              </h2>
            </div>
          </Reveal>

          {/* Labels */}
          <Reveal>
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] items-center gap-6 lg:gap-0 mb-8">
              <div className="flex items-center justify-center lg:justify-start gap-3">
                <span className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center text-gray-400 text-lg shrink-0">✓</span>
                <span className="text-lg font-bold text-gray-500">수작업으로 성과를 관리하면?</span>
              </div>
              <span className="hidden lg:block text-2xl font-extrabold text-gray-300 mx-8">vs</span>
              <span className="lg:hidden text-xl font-extrabold text-gray-300 text-center">vs</span>
              <div className="flex items-center justify-center lg:justify-start gap-3">
                <span className="w-9 h-9 rounded-full bg-brand-600 flex items-center justify-center text-white text-lg shrink-0">✓</span>
                <span className="text-lg font-bold text-gray-900">ProofWork AI를 더하면?</span>
              </div>
            </div>
          </Reveal>

          {/* Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] items-start gap-6 lg:gap-0">
            <Reveal><ComparisonCardLeft /></Reveal>
            <div className="hidden lg:flex items-center justify-center w-16" />
            <Reveal delay={2}><ComparisonCardRight /></Reveal>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-24 lg:py-32 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <Reveal>
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">
                리스크는 줄이고, 성과 가치는 높입니다
              </h2>
            </div>
          </Reveal>

          <div className="grid md:grid-cols-3 gap-6">
            {BENEFITS.map((b, i) => (
              <Reveal key={i} delay={Math.min(i + 1, 3) as 1 | 2 | 3}>
                <div className="bg-white rounded-2xl border border-gray-200 p-8 lg:p-10 hover:shadow-xl hover:border-brand-200 transition-all duration-300 h-full">
                  <h3 className="text-xl font-bold mb-4">{b.title}</h3>
                  <p className="text-gray-500 leading-relaxed whitespace-pre-line">{b.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section id="use-cases" className="py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-6">
          <Reveal>
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">
                우리 팀 환경에 맞게, 쉽게 도입하세요
              </h2>
            </div>
          </Reveal>

          <div className="grid md:grid-cols-3 gap-6">
            {USE_CASES.map((uc, i) => (
              <Reveal key={i} delay={Math.min(i + 1, 3) as 1 | 2 | 3}>
                <div className="group bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-xl hover:border-brand-200 transition-all duration-300">
                  <div className="h-48 bg-gradient-to-br from-brand-50 to-gray-50 flex items-center justify-center">
                    <div className="w-16 h-16 bg-white rounded-2xl shadow-lg flex items-center justify-center text-3xl">
                      {i === 0 ? '💻' : i === 1 ? '🎨' : '📊'}
                    </div>
                  </div>
                  <div className="p-8">
                    <h3 className="text-xl font-bold mb-3">{uc.title}</h3>
                    <p className="text-gray-500 leading-relaxed">{uc.desc}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Band */}
      <section className="py-16 bg-brand-600">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { value: '98.5%', label: '프라이버시 보호율' },
              { value: '40%', label: '생산성 향상' },
              { value: '24/7', label: '실시간 분석' },
              { value: '5분', label: '설치 시간' },
            ].map((s) => (
              <Reveal key={s.label}>
                <div className="text-center">
                  <p className="text-3xl sm:text-4xl font-extrabold text-white mb-1">{s.value}</p>
                  <p className="text-brand-100 font-medium">{s.label}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 lg:py-32 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <Reveal>
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">팀 규모에 맞는 플랜을 선택하세요</h2>
              <p className="text-gray-500 text-lg">모든 유료 플랜은 14일 무료 체험이 가능합니다.</p>
            </div>
          </Reveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {PRICING_PLANS.map((p, i) => (
              <Reveal key={i} delay={Math.min(i + 1, 4) as 1 | 2 | 3 | 4}>
                <div className={clsx(
                  'relative rounded-2xl border p-7 flex flex-col transition-all h-full',
                  p.highlight ? 'border-brand-600 bg-white shadow-xl shadow-brand-600/10 ring-1 ring-brand-600' : 'border-gray-200 bg-white hover:shadow-lg',
                )}>
                  {p.highlight && <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-brand-600 text-white text-xs font-semibold rounded-full">가장 인기</div>}
                  <div className="mb-6">
                    <p className="text-sm font-semibold text-brand-600">{p.name}</p>
                    <p className="text-xs text-gray-500 mb-3">{p.subtitle}</p>
                    <span className="text-3xl font-extrabold text-gray-900">{p.price}</span>
                    <p className="text-sm text-gray-500">{p.period}</p>
                  </div>
                  <button onClick={openLogin} className={clsx(
                    'w-full py-2.5 rounded-full text-sm font-semibold transition-colors mb-6',
                    p.highlight ? 'bg-brand-600 text-white hover:bg-brand-700' : 'bg-white text-brand-700 border border-brand-200 hover:bg-brand-50',
                  )}>{p.cta}</button>
                  <ul className="space-y-2.5 flex-1">
                    {p.features.map((f, j) => (
                      <li key={j} className="flex items-start gap-2 text-sm text-gray-600">
                        <span className="text-brand-500 shrink-0 mt-0.5">✓</span>{f}
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-24 lg:py-32">
        <div className="max-w-3xl mx-auto px-6">
          <Reveal>
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">FAQ</h2>
            </div>
          </Reveal>
          <Reveal>
            <div>
              {FAQ_ITEMS.map((item, i) => <FAQItem key={i} q={item.q} a={item.a} />)}
            </div>
          </Reveal>
        </div>
      </section>

      {/* Final CTA Banner */}
      <section className="py-24 lg:py-32 bg-gray-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 -z-0 opacity-30">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-600 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-brand-800 rounded-full blur-[100px]" />
        </div>
        <div className="relative max-w-3xl mx-auto px-6 text-center">
          <Reveal>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight mb-6 leading-[1.2]">
              AI 무단 추정은 그만,
              <br />
              실제 데이터로 성과를 증명하세요
            </h2>
          </Reveal>
          <Reveal>
            <p className="text-gray-400 text-lg mb-10 leading-relaxed max-w-xl mx-auto">
              복잡한 설정 없이 5분 안에 On-Device AI 기반 성과 관리를 시작할 수 있습니다.
            </p>
          </Reveal>
          <Reveal>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button onClick={openLogin} className="w-full sm:w-auto px-10 py-4 bg-brand-600 text-white font-semibold rounded-full hover:bg-brand-500 transition-all text-base shadow-xl shadow-brand-600/30">
                무료 체험하기
              </button>
              <button onClick={openLogin} className="w-full sm:w-auto px-10 py-4 bg-white/10 text-white font-semibold rounded-full border border-white/20 hover:bg-white/20 transition-all text-base backdrop-blur">
                상담하기
              </button>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-24 lg:py-32">
        <div className="max-w-2xl mx-auto px-6">
          <Reveal>
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">솔루션 문의</h2>
              <p className="text-gray-500 text-lg leading-relaxed">
                도입을 고려 중이신가요?<br />궁금하신 점이 있다면 언제든 편하게 연락해 주세요.
              </p>
            </div>
          </Reveal>
          <Reveal>
            <form onSubmit={e => e.preventDefault()} className="space-y-5">
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">회사명</label>
                  <input type="text" className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-300 focus:border-brand-400 transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">담당자명</label>
                  <input type="text" className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-300 focus:border-brand-400 transition-all" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">이메일</label>
                <input type="email" className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-300 focus:border-brand-400 transition-all" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">문의내용</label>
                <textarea rows={4} className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-300 focus:border-brand-400 transition-all resize-none" />
              </div>
              <button type="submit" className="w-full py-3.5 bg-brand-600 text-white font-semibold rounded-xl hover:bg-brand-700 transition-colors">
                제출하기
              </button>
            </form>
          </Reveal>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 bg-gray-900 text-gray-400">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <span className="w-8 h-8 rounded-lg bg-brand-600 text-white font-bold flex items-center justify-center text-sm">P</span>
                <span className="text-lg font-bold text-white">Proof<span className="text-brand-400">Work</span></span>
              </div>
              <p className="text-sm leading-relaxed">On-Device AI 기반 자율 성과 증명 솔루션. 프라이버시를 지키면서 팀의 생산성을 극대화합니다.</p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white mb-4">제품</h4>
              <ul className="space-y-2.5 text-sm">
                <li><a href="#features" className="hover:text-white transition-colors">기능</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">요금제</a></li>
                <li><a href="#process" className="hover:text-white transition-colors">도입 프로세스</a></li>
                <li><a href="#faq" className="hover:text-white transition-colors">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white mb-4">지원</h4>
              <ul className="space-y-2.5 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">도움말 센터</a></li>
                <li><a href="#" className="hover:text-white transition-colors">문의하기</a></li>
                <li><a href="#" className="hover:text-white transition-colors">시스템 상태</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white mb-4">법적 고지</h4>
              <ul className="space-y-2.5 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">이용약관</a></li>
                <li><a href="#" className="hover:text-white transition-colors">개인정보처리방침</a></li>
                <li><a href="#" className="hover:text-white transition-colors">보안</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm">&copy; 2026 ProofWork. All rights reserved.</p>
            <div className="flex items-center gap-3 text-xs">
              <span>GDPR Compliant</span>
              <span className="text-gray-700">·</span>
              <span>End-to-End Encrypted</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Login Modal */}
      <LoginModal isOpen={loginModalOpen} onClose={() => setLoginModalOpen(false)} />
    </div>
  );
}

/* --- Comparison Cards --- */
function ComparisonCardLeft() {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-lg overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 bg-gray-50/80">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-gray-300" />
          <div className="w-2.5 h-2.5 rounded-full bg-gray-300" />
          <div className="w-2.5 h-2.5 rounded-full bg-gray-300" />
        </div>
        <div className="flex-1 flex justify-center">
          <div className="px-3 py-0.5 bg-white rounded text-[10px] text-gray-400 border border-gray-200">spreadsheet.example.com</div>
        </div>
      </div>
      <div className="p-5 sm:p-6">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-5 h-5 bg-gray-200 rounded" />
          <span className="text-sm font-bold text-gray-600">업무 현황 보고서</span>
        </div>
        <p className="text-[11px] text-gray-400 mb-4">수작업으로 기록하는 업무 일지</p>
        <div className="border border-gray-200 rounded-lg overflow-hidden text-[11px]">
          <div className="grid grid-cols-4 bg-gray-50 border-b border-gray-200">
            {['날짜', '업무 내용', '시간', '비고'].map(h => <div key={h} className="px-3 py-2 font-semibold text-gray-500 border-r border-gray-200 last:border-0">{h}</div>)}
          </div>
          {[['03/07', '프론트엔드 개발', '8h', ''], ['03/06', '미팅 + 문서 작성', '6h', '추정치'], ['03/05', 'API 연동 작업', '7h', ''], ['03/04', '디버깅', '5h', '추정치'], ['03/03', '기획 회의', '3h', '기억 안남']].map(([d, t, h, n], i) => (
            <div key={i} className={clsx('grid grid-cols-4', i < 4 && 'border-b border-gray-100')}>
              <div className="px-3 py-2.5 text-gray-500 border-r border-gray-100">{d}</div>
              <div className="px-3 py-2.5 text-gray-700 border-r border-gray-100">{t}</div>
              <div className="px-3 py-2.5 text-gray-500 border-r border-gray-100">{h}</div>
              <div className="px-3 py-2.5 text-red-400 italic">{n}</div>
            </div>
          ))}
        </div>
        <div className="mt-5 space-y-2">
          {['매일 수동으로 기록해야 함', '추정치 기반 — 정확도 낮음', '성과 분석 불가능'].map((t, i) => (
            <div key={i} className="flex items-center gap-2 text-xs text-gray-400"><span className="text-red-300">✕</span><span>{t}</span></div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ComparisonCardRight() {
  return (
    <div className="rounded-2xl border border-brand-200 bg-white shadow-lg shadow-brand-600/10 ring-1 ring-brand-100 overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-brand-50 bg-brand-50/50">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
        </div>
        <div className="flex-1 flex justify-center">
          <div className="px-3 py-0.5 bg-white rounded text-[10px] text-brand-500 border border-brand-100">proofwork.app/dashboard</div>
        </div>
      </div>
      <div className="p-5 sm:p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded bg-brand-600 text-white text-[10px] font-bold flex items-center justify-center">P</span>
            <span className="text-sm font-bold text-gray-800">오늘의 성과 리포트</span>
          </div>
          <span className="text-[10px] text-brand-500 bg-brand-50 px-2 py-0.5 rounded-full font-medium">AI 자동 분석</span>
        </div>
        <div className="grid grid-cols-3 gap-2.5 mb-4">
          {[{ l: '몰입도', v: '87', c: 'text-brand-600', b: 'bg-brand-50' }, { l: '효율성', v: '92', c: 'text-green-600', b: 'bg-green-50' }, { l: '목표정렬', v: '78', c: 'text-amber-600', b: 'bg-amber-50' }].map(k => (
            <div key={k.l} className={clsx('rounded-xl p-3 text-center', k.b)}>
              <p className="text-[10px] text-gray-500">{k.l}</p>
              <p className={clsx('text-xl font-extrabold', k.c)}>{k.v}</p>
            </div>
          ))}
        </div>
        <div className="bg-gray-50 rounded-xl p-3.5 mb-4">
          <p className="text-[10px] font-semibold text-brand-600 mb-1.5">AI 업무 요약</p>
          <p className="text-[11px] text-gray-600 leading-relaxed">VS Code에서 프론트엔드 컴포넌트 개발에 3.2시간 집중, Figma 디자인 리뷰 45분. 전일 대비 몰입도 12% 향상.</p>
        </div>
        <div className="space-y-2">
          {[{ a: 'VS Code', w: '55%', c: 'bg-brand-500' }, { a: 'Figma', w: '20%', c: 'bg-purple-500' }, { a: 'Slack', w: '12%', c: 'bg-amber-500' }].map(b => (
            <div key={b.a} className="flex items-center gap-2.5">
              <span className="text-[10px] text-gray-500 w-12 shrink-0">{b.a}</span>
              <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden"><div className={clsx('h-full rounded-full', b.c)} style={{ width: b.w }} /></div>
              <span className="text-[10px] text-gray-400 w-8 text-right">{b.w}</span>
            </div>
          ))}
        </div>
        <div className="mt-5 space-y-2">
          {['AI가 자동으로 활동 분석 & 리포트', '정확한 수치 기반 성과 증명', '실시간 몰입도·효율성 대시보드'].map((t, i) => (
            <div key={i} className="flex items-center gap-2 text-xs text-gray-600"><span className="text-brand-500 font-bold">✓</span><span>{t}</span></div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* --- Step Mockups --- */
function StepMockup1() {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-xl overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 bg-gray-50/80">
        <div className="flex gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-red-400" /><div className="w-2.5 h-2.5 rounded-full bg-yellow-400" /><div className="w-2.5 h-2.5 rounded-full bg-green-400" /></div>
        <div className="flex-1 flex justify-center"><div className="px-3 py-0.5 bg-white rounded text-[10px] text-gray-400 border border-gray-200">ProofWork Agent</div></div>
      </div>
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse" /><span className="text-xs font-medium text-green-600">분석 중</span></div>
          <span className="text-[10px] text-gray-400">CPU 2.1% · RAM 48MB</span>
        </div>
        <div className="space-y-3">
          {[{ app: 'VS Code', cat: '개발', min: '142분', pct: 68 }, { app: 'Chrome', cat: '브라우저', min: '45분', pct: 22 }, { app: 'Slack', cat: '커뮤니케이션', min: '23분', pct: 10 }].map(a => (
            <div key={a.app} className="flex items-center gap-3">
              <span className="text-xs text-gray-600 w-16 shrink-0">{a.app}</span>
              <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-brand-400 rounded-full" style={{ width: `${a.pct}%` }} /></div>
              <span className="text-[10px] text-gray-400 w-10 text-right">{a.min}</span>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          {['AI 분석', 'On-Device', 'PII 제거'].map(t => <span key={t} className="text-[10px] bg-brand-50 text-brand-600 px-2 py-0.5 rounded-full font-medium">{t}</span>)}
        </div>
      </div>
    </div>
  );
}

function StepMockup2() {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-xl overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 bg-gray-50/80">
        <div className="flex gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-red-400" /><div className="w-2.5 h-2.5 rounded-full bg-yellow-400" /><div className="w-2.5 h-2.5 rounded-full bg-green-400" /></div>
        <div className="flex-1 flex justify-center"><div className="px-3 py-0.5 bg-white rounded text-[10px] text-gray-400 border border-gray-200">데이터 리뷰</div></div>
      </div>
      <div className="p-6 space-y-4">
        <p className="text-xs font-semibold text-gray-500">2026년 3월 7일 업무 데이터</p>
        <div className="grid grid-cols-3 gap-2.5">
          {[{ l: '몰입도', v: '87', c: 'text-brand-600 bg-brand-50' }, { l: '효율성', v: '92', c: 'text-green-600 bg-green-50' }, { l: '정렬도', v: '78', c: 'text-amber-600 bg-amber-50' }].map(k => (
            <div key={k.l} className={clsx('rounded-xl p-3 text-center', k.c.split(' ')[1])}>
              <p className="text-[10px] text-gray-500">{k.l}</p>
              <p className={clsx('text-lg font-bold', k.c.split(' ')[0])}>{k.v}</p>
            </div>
          ))}
        </div>
        <div className="bg-green-50 rounded-xl p-3 border border-green-100">
          <p className="text-[10px] text-green-700 font-semibold mb-1">PII 자동 제거 완료</p>
          <p className="text-[10px] text-green-600">3건의 개인정보가 자동 필터링되었습니다.</p>
        </div>
        <div className="flex gap-3">
          <button className="flex-1 py-2 bg-brand-600 text-white text-xs font-semibold rounded-lg">승인</button>
          <button className="flex-1 py-2 bg-white text-gray-600 text-xs font-semibold rounded-lg border border-gray-200">수정</button>
        </div>
      </div>
    </div>
  );
}

function StepMockup3() {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-xl overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 bg-gray-50/80">
        <div className="flex gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-red-400" /><div className="w-2.5 h-2.5 rounded-full bg-yellow-400" /><div className="w-2.5 h-2.5 rounded-full bg-green-400" /></div>
        <div className="flex-1 flex justify-center"><div className="px-3 py-0.5 bg-white rounded text-[10px] text-gray-400 border border-gray-200">proofwork.app/dashboard</div></div>
      </div>
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-bold text-gray-800">주간 리포트</p>
          <span className="text-[10px] text-brand-500 bg-brand-50 px-2 py-0.5 rounded-full font-medium">Gemini AI</span>
        </div>
        <div className="bg-brand-50 rounded-xl p-3.5">
          <p className="text-[10px] font-semibold text-brand-600 mb-1">AI 인사이트</p>
          <p className="text-[11px] text-gray-600 leading-relaxed">이번 주 평균 몰입도 85점으로 전주 대비 8% 상승했습니다. 오전 10시~12시 딥포커스 구간이 가장 효율적입니다.</p>
        </div>
        <div className="space-y-2">
          <p className="text-[10px] font-semibold text-gray-500">효율성 추이</p>
          <div className="flex items-end gap-1 h-16">
            {[60, 72, 65, 88, 92, 85, 90].map((v, i) => (
              <div key={i} className="flex-1 bg-brand-100 rounded-t" style={{ height: `${v}%` }}>
                <div className="w-full bg-brand-400 rounded-t" style={{ height: `${v}%` }} />
              </div>
            ))}
          </div>
          <div className="flex justify-between text-[9px] text-gray-400">
            <span>월</span><span>화</span><span>수</span><span>목</span><span>금</span><span>토</span><span>일</span>
          </div>
        </div>
      </div>
    </div>
  );
}
