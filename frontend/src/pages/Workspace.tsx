import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import clsx from 'clsx';
import {
  Users,
  Mail,
  Copy,
  Check,
  Shield,
  Crown,
  Eye,
  UserPlus,
  Trash2,
  Building2,
  MoreHorizontal,
  Sparkles,
  Activity,
} from 'lucide-react';

// ─── 타입 ─────────────────────────────────────────────────

type MemberRole = 'owner' | 'admin' | 'member' | 'guest';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: MemberRole;
  roleTag: string;
  avatar: string;
  status: 'online' | 'offline' | 'away';
}

// ─── 데모 데이터 ──────────────────────────────────────────

const DEMO_MEMBERS: TeamMember[] = [
  { id: '1', name: '김민수', email: 'minsu@proofwork.io', role: 'owner', roleTag: 'Full-stack', avatar: 'KM', status: 'online' },
  { id: '2', name: '이지현', email: 'jihyun@proofwork.io', role: 'admin', roleTag: 'Front-end', avatar: 'LJ', status: 'online' },
  { id: '3', name: '박준혁', email: 'junhyuk@proofwork.io', role: 'member', roleTag: 'Back-end', avatar: 'PJ', status: 'away' },
  { id: '4', name: '최서연', email: 'seoyeon@proofwork.io', role: 'member', roleTag: 'PM', avatar: 'CS', status: 'online' },
  { id: '5', name: '정우진', email: 'woojin@proofwork.io', role: 'member', roleTag: 'Designer', avatar: 'JW', status: 'offline' },
  { id: '6', name: '한소희', email: 'sohee@ext.com', role: 'guest', roleTag: 'Client', avatar: 'HS', status: 'offline' },
];

const PENDING_INVITES = [
  { email: 'newdev@gmail.com', sentAt: '2026-03-10', status: 'pending' },
  { email: 'designer@outlook.com', sentAt: '2026-03-08', status: 'pending' },
];

const ROLE_CONFIG: Record<MemberRole, { label: string; icon: typeof Crown; color: string; description: string }> = {
  owner: { label: 'Owner', icon: Crown, color: 'text-warning-400', description: '워크스페이스 설정, 멤버 삭제, 결제 관리' },
  admin: { label: 'Admin', icon: Shield, color: 'text-brand-400', description: '워크스페이스 설정, 멤버 관리' },
  member: { label: 'Member', icon: Users, color: 'text-gray-500', description: '데이터 기록/전송, 타임라인 열람, 댓글' },
  guest: { label: 'Guest', icon: Eye, color: 'text-gray-400', description: '읽기 전용 (View-only)' },
};

// ─── 메인 컴포넌트 ───────────────────────────────────────

export default function Workspace() {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState<'members' | 'invite' | 'permissions'>('members');
  const [inviteEmail, setInviteEmail] = useState('');
  const [linkCopied, setLinkCopied] = useState(false);
  const [members] = useState(DEMO_MEMBERS);
  const [selectedMetric, setSelectedMetric] = useState(0);

  const handleCopyLink = () => {
    navigator.clipboard.writeText('https://proofwork.io/invite/abc123');
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const handleInvite = () => {
    if (!inviteEmail.includes('@')) return;
    setInviteEmail('');
  };

  const onlineCount = members.filter(m => m.status === 'online').length;
  const awayCount = members.filter(m => m.status === 'away').length;

  const metricTabs = [
    { label: '총 멤버', value: `${members.length}명`, key: 0 },
    { label: '온라인', value: `${onlineCount}명`, key: 1 },
    { label: '자리 비움', value: `${awayCount}명`, key: 2 },
    { label: '대기 초대', value: `${PENDING_INVITES.length}건`, key: 3 },
    { label: '역할 수', value: `${Object.keys(ROLE_CONFIG).length}개`, key: 4 },
  ];

  return (
    <div className="space-y-5 animate-fade-in">
      {/* ── 서브 탭 ── */}
      <div className="flex items-center justify-between border-b border-gray-200">
        <div className="flex items-center gap-6">
          {([
            { key: 'members' as const, label: '팀 구성', icon: Users },
            { key: 'invite' as const, label: '초대 관리', icon: UserPlus },
            { key: 'permissions' as const, label: '권한 설정', icon: Shield },
          ]).map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={clsx(
                'pb-3 text-sm font-medium transition-colors relative flex items-center gap-2',
                activeTab === tab.key
                  ? 'text-gray-900 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-gray-900'
                  : 'text-gray-400 hover:text-gray-700',
              )}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 pb-3">
          <Building2 className="w-4 h-4 text-brand-500" />
          <span className="text-xs text-gray-500 font-medium">{profile?.displayName ?? 'ProofWork'}의 워크스페이스</span>
        </div>
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

      {/* ── 팀 구성 ── */}
      {activeTab === 'members' && (
        <div className="grid lg:grid-cols-5 gap-5">
          {/* 좌측: 멤버 테이블 (3/5) */}
          <div className="lg:col-span-3">
            <div className="rounded-2xl bg-white border border-gray-200 overflow-hidden shadow-sm">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <h3 className="text-base font-bold text-gray-900">팀 멤버 ({members.length}명)</h3>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setActiveTab('invite')}
                    className="flex items-center gap-1.5 text-xs text-brand-500 hover:text-brand-600 font-medium transition-colors"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    멤버 초대
                  </button>
                  <button className="p-1 rounded-lg hover:bg-gray-100 text-gray-400"><MoreHorizontal className="w-4 h-4" /></button>
                </div>
              </div>

              <table className="w-full">
                <thead>
                  <tr className="text-left text-xs text-gray-400 border-b border-gray-100">
                    <th className="px-6 py-3 font-medium">#</th>
                    <th className="px-6 py-3 font-medium">멤버</th>
                    <th className="px-6 py-3 font-medium">이메일</th>
                    <th className="px-6 py-3 font-medium">역할</th>
                    <th className="px-6 py-3 font-medium">직군</th>
                    <th className="px-6 py-3 font-medium">상태</th>
                  </tr>
                </thead>
                <tbody>
                  {members.map((member, idx) => {
                    const roleConf = ROLE_CONFIG[member.role];
                    const RoleIcon = roleConf.icon;
                    return (
                      <tr key={member.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-3.5 text-sm text-brand-500 font-medium">{idx + 1}</td>
                        <td className="px-6 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <div className="relative">
                              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                                <span className="text-[10px] font-bold text-gray-600">{member.avatar}</span>
                              </div>
                              <span
                                className={clsx(
                                  'absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white',
                                  member.status === 'online' ? 'bg-green-400' :
                                  member.status === 'away' ? 'bg-amber-400' : 'bg-gray-300',
                                )}
                              />
                            </div>
                            <span className="text-sm text-gray-800 font-medium">{member.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-3.5 text-sm text-gray-500">{member.email}</td>
                        <td className="px-6 py-3.5">
                          <span className={clsx('flex items-center gap-1 text-xs font-medium', roleConf.color)}>
                            <RoleIcon className="w-3 h-3" />
                            {roleConf.label}
                          </span>
                        </td>
                        <td className="px-6 py-3.5">
                          <span className="text-xs text-gray-500 px-2.5 py-1 rounded-lg bg-gray-100">{member.roleTag}</span>
                        </td>
                        <td className="px-6 py-3.5">
                          <span
                            className={clsx(
                              'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold',
                              member.status === 'online' && 'bg-green-50 text-green-600',
                              member.status === 'away' && 'bg-amber-50 text-amber-600',
                              member.status === 'offline' && 'bg-gray-100 text-gray-400',
                            )}
                          >
                            {member.status === 'online' ? '온라인' : member.status === 'away' ? '자리 비움' : '오프라인'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* 우측 (2/5) */}
          <div className="lg:col-span-2 space-y-5">
            {/* 워크스페이스 요약 */}
            <div className="rounded-2xl bg-white border border-gray-200 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-gray-900">워크스페이스 현황</h3>
                <button className="p-1 rounded-lg hover:bg-gray-100 text-gray-400"><MoreHorizontal className="w-4 h-4" /></button>
              </div>
              <div className="flex items-baseline gap-2 mb-5">
                <span className="text-4xl font-extrabold text-gray-900">{members.length}</span>
                <span className="text-sm text-gray-400">멤버</span>
                <span className="ml-auto text-xs font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">▲ 2명</span>
              </div>
              <div className="space-y-3 pt-4 border-t border-gray-100">
                {[
                  { label: '온라인', value: `${onlineCount}명` },
                  { label: '자리 비움', value: `${awayCount}명` },
                  { label: '오프라인', value: `${members.length - onlineCount - awayCount}명` },
                  { label: '대기 초대', value: `${PENDING_INVITES.length}건` },
                ].map(item => (
                  <div key={item.label} className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">{item.label}</span>
                    <span className="text-sm font-bold text-gray-900">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 팀 활동 리포트 */}
            <div className="rounded-2xl bg-white border border-gray-200 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-brand-500" />
                  <h3 className="text-sm font-bold text-gray-900">팀 활동</h3>
                </div>
                <button className="p-1 rounded-lg hover:bg-gray-100 text-gray-400"><MoreHorizontal className="w-4 h-4" /></button>
              </div>
              <div className="space-y-3">
                {members.filter(m => m.status === 'online').map(m => (
                  <div key={m.id} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                      <span className="text-[10px] font-bold text-gray-600">{m.avatar}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-800 font-medium">{m.name}</p>
                      <p className="text-[11px] text-gray-400">{m.roleTag} · 활동 중</p>
                    </div>
                    <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full font-medium">Active</span>
                  </div>
                ))}
              </div>
            </div>

            {/* AI 인사이트 (그라디언트 카드) */}
            <div className="rounded-2xl p-5 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 40%, #8b5cf6 100%)' }}>
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-5">
                  <Sparkles className="w-4 h-4 text-white/80" />
                  <span className="text-xs font-semibold text-white/80 tracking-wide">Team Insights</span>
                </div>
                <p className="text-5xl font-extrabold text-white mb-3">{((onlineCount / members.length) * 100).toFixed(0)}%</p>
                <p className="text-sm font-semibold text-white/90 leading-relaxed mb-2">
                  현재 팀 접속률
                </p>
                <p className="text-xs text-white/60 leading-relaxed">
                  {onlineCount}명의 팀원이 실시간으로 협업 중입니다. 오전 10시~12시가 팀 집중도가 가장 높은 시간대입니다.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── 초대 관리 ── */}
      {activeTab === 'invite' && (
        <div className="grid lg:grid-cols-5 gap-5">
          {/* 좌측: 초대 입력 (3/5) */}
          <div className="lg:col-span-3 space-y-5">
            {/* 이메일 초대 */}
            <div className="rounded-2xl bg-white border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-gray-900">이메일로 초대</h3>
                <button className="p-1 rounded-lg hover:bg-gray-100 text-gray-400"><MoreHorizontal className="w-4 h-4" /></button>
              </div>
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    placeholder="이메일 주소 입력"
                    value={inviteEmail}
                    onChange={e => setInviteEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-gray-300 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:border-brand-500/50 transition-colors"
                    onKeyDown={e => e.key === 'Enter' && handleInvite()}
                  />
                </div>
                <button
                  onClick={handleInvite}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold transition-colors"
                >
                  <UserPlus className="w-4 h-4" />
                  초대
                </button>
              </div>
            </div>

            {/* 초대 링크 */}
            <div className="rounded-2xl bg-white border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-gray-900">초대 링크</h3>
                <button className="p-1 rounded-lg hover:bg-gray-100 text-gray-400"><MoreHorizontal className="w-4 h-4" /></button>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1 px-4 py-2.5 bg-gray-50 rounded-xl border border-gray-200 text-sm text-gray-500 truncate font-mono">
                  https://proofwork.io/invite/abc123
                </div>
                <button
                  onClick={handleCopyLink}
                  className={clsx(
                    'flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors',
                    linkCopied
                      ? 'border-green-300 text-green-600 bg-green-50'
                      : 'border-gray-200 text-gray-700 hover:bg-gray-50',
                  )}
                >
                  {linkCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {linkCopied ? '복사됨' : '복사'}
                </button>
              </div>
            </div>
          </div>

          {/* 우측: 대기 초대 (2/5) */}
          <div className="lg:col-span-2">
            <div className="rounded-2xl bg-white border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-gray-900">대기 중인 초대</h3>
                <button className="p-1 rounded-lg hover:bg-gray-100 text-gray-400"><MoreHorizontal className="w-4 h-4" /></button>
              </div>
              {PENDING_INVITES.length === 0 ? (
                <p className="text-sm text-gray-400">대기 중인 초대가 없습니다.</p>
              ) : (
                <div className="space-y-3">
                  {PENDING_INVITES.map(invite => (
                    <div key={invite.email} className="flex items-center justify-between px-4 py-3 rounded-xl bg-gray-50 border border-gray-200">
                      <div>
                        <p className="text-sm text-gray-700">{invite.email}</p>
                        <p className="text-[11px] text-gray-400 mt-0.5">전송: {invite.sentAt}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-600">
                          대기 중
                        </span>
                        <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-red-500 transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── 권한 설정 ── */}
      {activeTab === 'permissions' && (
        <div className="grid sm:grid-cols-2 gap-5">
          {(Object.entries(ROLE_CONFIG) as [MemberRole, typeof ROLE_CONFIG[MemberRole]][]).map(([key, conf]) => {
            const Icon = conf.icon;
            const memberCount = members.filter(m => m.role === key).length;
            return (
              <div key={key} className="rounded-2xl bg-white border border-gray-200 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={clsx(
                        'w-12 h-12 rounded-2xl flex items-center justify-center',
                        key === 'owner' ? 'bg-warning-500/15' :
                        key === 'admin' ? 'bg-brand-500/15' :
                        key === 'member' ? 'bg-gray-100' : 'bg-gray-50',
                      )}
                    >
                      <Icon className={clsx('w-6 h-6', conf.color)} />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-gray-900">{conf.label}</h3>
                      <span className="text-xs text-gray-400">({memberCount}명)</span>
                    </div>
                  </div>
                  <button className="p-1 rounded-lg hover:bg-gray-100 text-gray-400"><MoreHorizontal className="w-4 h-4" /></button>
                </div>
                <p className="text-sm text-gray-500 leading-relaxed">{conf.description}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
