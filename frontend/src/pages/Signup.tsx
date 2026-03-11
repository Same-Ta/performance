import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Eye,
  EyeOff,
  ArrowLeft,
} from 'lucide-react';

export default function Signup() {
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const [displayName, setDisplayName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

  const [agreeAll, setAgreeAll] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [agreeMarketing, setAgreeMarketing] = useState(false);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  /* ── 전체 동의 핸들러 ── */
  const handleAgreeAll = (checked: boolean) => {
    setAgreeAll(checked);
    setAgreeTerms(checked);
    setAgreePrivacy(checked);
    setAgreeMarketing(checked);
  };

  const handleIndividualAgree = (
    setter: React.Dispatch<React.SetStateAction<boolean>>,
    checked: boolean,
    terms: boolean,
    privacy: boolean,
    marketing: boolean,
    which: 'terms' | 'privacy' | 'marketing'
  ) => {
    setter(checked);
    const next = {
      terms: which === 'terms' ? checked : terms,
      privacy: which === 'privacy' ? checked : privacy,
      marketing: which === 'marketing' ? checked : marketing,
    };
    setAgreeAll(next.terms && next.privacy && next.marketing);
  };

  /* ── 비밀번호 강도 ── */
  const getPasswordStrength = () => {
    if (!password) return { level: 0, label: '', color: '' };
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[!@#$%^&*()_+\-=[\]{};':",./<>?]/.test(password)) score++;
    if (score <= 1) return { level: 1, label: '취약', color: 'bg-danger-500' };
    if (score <= 2) return { level: 2, label: '보통', color: 'bg-warning-500' };
    if (score <= 3) return { level: 3, label: '양호', color: 'bg-brand-400' };
    return { level: 4, label: '강력', color: 'bg-success-500' };
  };
  const pwStrength = getPasswordStrength();

  /* ── 유효성 검증 ── */
  const validate = (): string | null => {
    if (!displayName.trim()) return '이름을 입력해주세요.';
    if (displayName.trim().length < 2) return '이름은 2자 이상 입력해주세요.';
    if (!email.trim()) return '이메일을 입력해주세요.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return '올바른 이메일 형식을 입력해주세요.';
    if (!department.trim()) return '소속 부서를 입력해주세요.';
    if (password.length < 8) return '비밀번호는 8자 이상이어야 합니다.';
    if (!/(?=.*[a-zA-Z])(?=.*\d)/.test(password)) return '비밀번호에 영문과 숫자를 모두 포함해주세요.';
    if (password !== confirmPw) return '비밀번호가 일치하지 않습니다.';
    if (!agreeTerms) return '이용약관에 동의해주세요.';
    if (!agreePrivacy) return '개인정보 처리방침에 동의해주세요.';
    return null;
  };

  /* ── 제출 ── */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const err = validate();
    if (err) { setError(err); return; }

    setLoading(true);
    try {
      await signUp(email, password, displayName.trim(), department.trim());
      setSuccess(true);
      setTimeout(() => navigate('/activities/dashboard', { replace: true }), 2000);
    } catch (err: unknown) {
      const fbErr = err as { code?: string };
      if (fbErr.code === 'auth/email-already-in-use') setError('이미 가입된 이메일입니다.');
      else if (fbErr.code === 'auth/weak-password') setError('비밀번호가 너무 약합니다.');
      else if (fbErr.code === 'auth/invalid-email') setError('올바른 이메일 형식을 입력해주세요.');
      else setError('회원가입에 실패했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  /* ── 성공 화면 ── */
  if (success) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center p-4">
        <div className="w-full max-w-sm text-center">
          <h2 className="text-xl font-bold text-white mb-2">가입이 완료되었습니다!</h2>
          <p className="text-sm text-dark-300 mb-6">
            <span className="font-semibold text-brand-400">{displayName}</span>님, 환영합니다.
          </p>
          <p className="text-xs text-dark-400">잠시 후 대시보드로 이동합니다...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-950 flex flex-col">
      {/* ── Header ── */}
      <header className="sticky top-0 z-10 bg-dark-900 border-b border-dark-700">
        <div className="max-w-lg mx-auto px-6 h-14 flex items-center">
          <button
            onClick={() => navigate('/landing')}
            className="p-1.5 -ml-1.5 rounded-lg text-dark-400 hover:text-dark-200 hover:bg-dark-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* ── Body ── */}
      <main className="flex-1 flex flex-col items-center px-6 py-8">
        <div className="w-full max-w-sm">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2">
              <span className="w-9 h-9 rounded-xl bg-brand-600 text-white font-bold flex items-center justify-center text-sm">P</span>
              <span className="text-xl font-bold text-white">
                Proof<span className="text-brand-400">Work</span>
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* ── 이름 ── */}
            <div>
              <label className="block text-sm font-semibold text-dark-200 mb-2">이름</label>
              <input
                type="text"
                className="w-full px-4 py-3 border border-dark-600 rounded-xl text-sm bg-dark-800 text-white focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500 placeholder-dark-400 transition-all"
                placeholder="이름"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                maxLength={20}
                autoComplete="name"
              />
            </div>

            {/* ── 전화번호 (선택) ── */}
            <div>
              <label className="block text-sm font-semibold text-dark-200 mb-2">전화번호</label>
              <input
                type="tel"
                className="w-full px-4 py-3 border border-dark-600 rounded-xl text-sm bg-dark-800 text-white focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500 placeholder-dark-400 transition-all"
                placeholder="전화번호"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                autoComplete="tel"
              />
            </div>

            {/* ── 소속 부서 ── */}
            <div>
              <label className="block text-sm font-semibold text-dark-200 mb-2">소속 부서</label>
              <input
                type="text"
                className="w-full px-4 py-3 border border-dark-600 rounded-xl text-sm bg-dark-800 text-white focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500 placeholder-dark-400 transition-all"
                placeholder="소속 부서"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                maxLength={30}
              />
            </div>

            {/* ── 이메일 ── */}
            <div>
              <label className="block text-sm font-semibold text-dark-200 mb-2">이메일</label>
              <input
                type="email"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-400 placeholder-gray-400 transition-all"
                placeholder="이메일을 입력해주세요"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>

            {/* ── 비밀번호 ── */}
            <div>
              <label className="block text-sm font-semibold text-dark-200 mb-2">비밀번호</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  className="w-full px-4 py-3 pr-10 border border-dark-600 rounded-xl text-sm bg-dark-800 text-white focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500 placeholder-dark-400 transition-all"
                  placeholder="비밀번호를 입력해주세요"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-dark-400 hover:text-dark-200"
                  onClick={() => setShowPw(!showPw)}
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {password && (
                <div className="mt-2">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-colors ${
                          i <= pwStrength.level ? pwStrength.color : 'bg-dark-600'
                        }`}
                      />
                    ))}
                  </div>
                  <p className={`text-xs mt-1 ${
                    pwStrength.level <= 1 ? 'text-danger-500' :
                    pwStrength.level <= 2 ? 'text-warning-500' : 'text-success-500'
                  }`}>
                    비밀번호 강도: {pwStrength.label}
                  </p>
                </div>
              )}
            </div>

            {/* ── 비밀번호 확인 ── */}
            <div>
              <label className="block text-sm font-semibold text-dark-200 mb-2">비밀번호 확인</label>
              <div className="relative">
                <input
                  type={showConfirmPw ? 'text' : 'password'}
                  className={`w-full px-4 py-3 pr-10 border rounded-xl text-sm bg-dark-800 text-white focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500 placeholder-dark-400 transition-all ${
                    confirmPw && confirmPw !== password ? 'border-danger-300' : 'border-dark-600'
                  }`}
                  placeholder="다시 한번 입력해주세요"
                  value={confirmPw}
                  onChange={(e) => setConfirmPw(e.target.value)}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-dark-400 hover:text-dark-200"
                  onClick={() => setShowConfirmPw(!showConfirmPw)}
                >
                  {showConfirmPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {confirmPw && confirmPw !== password && (
                <p className="text-xs text-danger-500 mt-1">비밀번호가 일치하지 않습니다.</p>
              )}
              {confirmPw && confirmPw === password && password.length > 0 && (
                <p className="text-xs text-success-500 mt-1">
                  비밀번호가 일치합니다.
                </p>
              )}
            </div>

            {/* ── 약관 동의 ── */}
            <div className="pt-2 border-t border-dark-700">
              {/* 전체 동의 */}
              <label className="flex items-center gap-3 cursor-pointer py-3">
                <input
                  type="checkbox"
                  checked={agreeAll}
                  onChange={(e) => handleAgreeAll(e.target.checked)}
                  className="h-5 w-5 rounded border-dark-500 text-brand-600 focus:ring-brand-500 bg-dark-700"
                />
                <span className="text-sm font-bold text-white">전체 약관에 동의합니다.</span>
              </label>

              <div className="space-y-2 ml-1 mb-2">
                <label className="flex items-center gap-3 cursor-pointer py-1.5">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) =>
                      handleIndividualAgree(setAgreeTerms, e.target.checked, agreeTerms, agreePrivacy, agreeMarketing, 'terms')
                    }
                    className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                  />
                  <span className="text-sm text-dark-300">
                    ProofWork <button type="button" className="text-brand-400 font-medium hover:underline">이용 약관</button>에 동의합니다. <span className="text-danger-500 text-xs font-medium ml-1">필수</span>
                  </span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer py-1.5">
                  <input
                    type="checkbox"
                    checked={agreePrivacy}
                    onChange={(e) =>
                      handleIndividualAgree(setAgreePrivacy, e.target.checked, agreeTerms, agreePrivacy, agreeMarketing, 'privacy')
                    }
                    className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                  />
                  <span className="text-sm text-dark-300">
                    <button type="button" className="text-brand-400 font-medium hover:underline">개인정보 수집 및 이용</button>에 동의합니다. <span className="text-danger-500 text-xs font-medium ml-1">필수</span>
                  </span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer py-1.5">
                  <input
                    type="checkbox"
                    checked={agreeMarketing}
                    onChange={(e) =>
                      handleIndividualAgree(setAgreeMarketing, e.target.checked, agreeTerms, agreePrivacy, agreeMarketing, 'marketing')
                    }
                    className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                  />
                  <span className="text-sm text-dark-300">
                    마케팅 정보 수신 및 선택적 개인정보 제공에 동의합니다. <span className="text-dark-500 text-xs">(선택)</span>
                  </span>
                </label>
              </div>
            </div>

            {/* ── 에러 ── */}
            {error && (
              <div className="text-sm text-danger-600 bg-danger-50 p-3 rounded-xl">
                {error}
              </div>
            )}

            {/* ── 제출 ── */}
            <button
              type="submit"
              className="w-full py-3.5 bg-brand-600 text-white font-semibold rounded-xl hover:bg-brand-700 active:bg-brand-800 transition-all disabled:opacity-60 text-base"
              disabled={loading}
            >
              {loading ? '가입 처리 중...' : '가입하기'}
            </button>
          </form>

          {/* ── 로그인 링크 ── */}
          <p className="text-center text-sm text-dark-400 mt-6">
            이미 계정이 있으신가요?{' '}
            <button
              onClick={() => navigate('/landing')}
              className="text-brand-400 font-semibold hover:underline"
            >
              로그인
            </button>
          </p>

          {/* Security badge */}
          <div className="text-center mt-8 pb-4">
            <p className="text-xs text-dark-400">
              모든 데이터는 암호화되어 안전하게 보호됩니다.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
