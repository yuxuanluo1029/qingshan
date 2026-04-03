import { useEffect, useMemo, useState } from 'react';
import { BadgeCheck, FileCheck2, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import apiClient, { getErrorMessage } from '@/lib/api-client';
import { toast } from 'sonner';

type TaskStatus = '全部' | '待核验' | '处理中' | '已归档';

interface GovernanceTask {
  id: string;
  title: string;
  city: string;
  location: string;
  severity: string;
  description: string;
  imageUrl?: string;
  status: Exclude<TaskStatus, '全部'>;
  reporterName: string;
  createdAt: string;
  updates: Array<{ id: string; operator: string; message: string; createdAt: string }>;
}

interface BlockchainRecord {
  index: number;
  timestamp: string;
  hash: string;
  payload: {
    type: string;
    city?: string;
    note?: string;
    artifact?: string;
  };
}

function toDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('图片读取失败'));
    reader.readAsDataURL(file);
  });
}

export default function CulturalGovernance() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<GovernanceTask[]>([]);
  const [statusFilter, setStatusFilter] = useState<TaskStatus>('全部');
  const [chainRecords, setChainRecords] = useState<BlockchainRecord[]>([]);

  const [title, setTitle] = useState('');
  const [city, setCity] = useState('杭州');
  const [location, setLocation] = useState('');
  const [severity, setSeverity] = useState('中');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const [chainCity, setChainCity] = useState('杭州');
  const [chainArtifact, setChainArtifact] = useState('');
  const [chainNote, setChainNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    void loadData();
  }, [statusFilter, user?.id]);

  const loadData = async () => {
    try {
      const [taskRes, chainRes] = await Promise.all([
        apiClient.get('/governance/tasks', {
          params: { status: statusFilter },
        }),
        apiClient.get('/blockchain/records', { params: { limit: 20 } }),
      ]);
      setTasks((taskRes.data?.data?.tasks || []) as GovernanceTask[]);
      setChainRecords((chainRes.data?.data?.records || []) as BlockchainRecord[]);
    } catch (error) {
      toast.error(getErrorMessage(error) || '治理数据加载失败');
    }
  };

  const socialValueStats = useMemo(() => {
    const total = tasks.length;
    const closed = tasks.filter((item) => item.status === '已归档').length;
    const processing = tasks.filter((item) => item.status === '处理中').length;
    const pending = tasks.filter((item) => item.status === '待核验').length;
    return { total, closed, processing, pending };
  }, [tasks]);

  const submitTask = async () => {
    if (!user?.id) return;
    if (!title.trim() || !description.trim()) {
      toast.error('请填写工单标题和问题描述');
      return;
    }

    setSubmitting(true);
    try {
      await apiClient.post('/governance/tasks', {
        reporterId: user.id,
        reporterName: user.username,
        title,
        city,
        location,
        severity,
        description,
        imageUrl,
      });
      toast.success('文保工单已提交');
      setTitle('');
      setLocation('');
      setDescription('');
      setImageUrl('');
      await loadData();
    } catch (error) {
      toast.error(getErrorMessage(error) || '提交失败');
    } finally {
      setSubmitting(false);
    }
  };

  const submitChainRecord = async () => {
    if (!user?.id) return;
    if (!chainNote.trim()) {
      toast.error('请填写链上说明');
      return;
    }
    setSubmitting(true);
    try {
      await apiClient.post('/blockchain/record', {
        userId: user.id,
        username: user.username,
        actionType: 'heritage_trace',
        city: chainCity,
        artifact: chainArtifact,
        note: chainNote,
      });
      toast.success('已完成链上存证');
      setChainArtifact('');
      setChainNote('');
      await loadData();
    } catch (error) {
      toast.error(getErrorMessage(error) || '链上存证失败');
    } finally {
      setSubmitting(false);
    }
  };

  const updateTaskStatus = async (task: GovernanceTask, status: Exclude<TaskStatus, '全部'>) => {
    if (!user?.id) return;
    try {
      await apiClient.patch(`/governance/tasks/${task.id}/status`, {
        operatorId: user.id,
        operatorName: user.username,
        status,
      });
      toast.success(`已更新为${status}`);
      await loadData();
    } catch (error) {
      toast.error(getErrorMessage(error) || '状态更新失败');
    }
  };

  return (
    <div className="space-y-6">
      <section
        className="rounded-3xl p-6 md:p-8"
        style={{
          background:
            'radial-gradient(circle at 86% 14%, rgba(216,170,116,0.24), transparent 34%), linear-gradient(140deg, #1c1814 0%, #2d2620 48%, #4a4036 100%)',
        }}
      >
        <p className="text-xs tracking-[0.35em]" style={{ color: 'rgba(244,226,202,0.86)' }}>
          CULTURE GOVERNANCE + BLOCKCHAIN
        </p>
        <h2 className="mt-3 text-3xl font-black md:text-5xl" style={{ color: '#f5e8d8', fontFamily: "'ZCOOL XiaoWei', 'Noto Serif SC', serif" }}>
          文旅治理中台
        </h2>
        <p className="mt-3 max-w-4xl text-sm leading-7 md:text-base" style={{ color: 'rgba(244,231,214,0.84)' }}>
          将“文物问题上报-处理闭环-链上存证”打通，形成可追踪的社会价值流程，让平台从展示型网站升级为可治理、可协作、可验证的文旅服务系统。
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        <article className="rounded-2xl p-4" style={{ background: '#fff8ef', border: '1px solid rgba(127,83,49,0.2)' }}>
          <p className="text-xs" style={{ color: '#8e613f' }}>
            工单总量
          </p>
          <p className="mt-1 text-2xl font-black" style={{ color: '#5f3920' }}>
            {socialValueStats.total}
          </p>
        </article>
        <article className="rounded-2xl p-4" style={{ background: '#fff8ef', border: '1px solid rgba(127,83,49,0.2)' }}>
          <p className="text-xs" style={{ color: '#8e613f' }}>
            待核验
          </p>
          <p className="mt-1 text-2xl font-black" style={{ color: '#5f3920' }}>
            {socialValueStats.pending}
          </p>
        </article>
        <article className="rounded-2xl p-4" style={{ background: '#fff8ef', border: '1px solid rgba(127,83,49,0.2)' }}>
          <p className="text-xs" style={{ color: '#8e613f' }}>
            处理中
          </p>
          <p className="mt-1 text-2xl font-black" style={{ color: '#5f3920' }}>
            {socialValueStats.processing}
          </p>
        </article>
        <article className="rounded-2xl p-4" style={{ background: '#fff8ef', border: '1px solid rgba(127,83,49,0.2)' }}>
          <p className="text-xs" style={{ color: '#8e613f' }}>
            已归档
          </p>
          <p className="mt-1 text-2xl font-black" style={{ color: '#5f3920' }}>
            {socialValueStats.closed}
          </p>
        </article>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.2fr_1fr]">
        <article className="rounded-2xl p-5" style={{ background: '#fff8ef', border: '1px solid rgba(127,83,49,0.2)' }}>
          <div className="flex items-center gap-2">
            <FileCheck2 className="h-4 w-4" style={{ color: '#8f5a35' }} />
            <h3 className="text-lg font-black" style={{ color: '#5f3920', fontFamily: "'Noto Serif SC', serif" }}>
              文保工单提交
            </h3>
          </div>

          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="工单标题"
              className="rounded-xl px-3 py-2"
              style={{ background: '#fffef9', border: '1px solid rgba(127,83,49,0.25)' }}
            />
            <select
              value={city}
              onChange={(event) => setCity(event.target.value)}
              className="rounded-xl px-3 py-2"
              style={{ background: '#fffef9', border: '1px solid rgba(127,83,49,0.25)' }}
            >
              {['杭州', '成都', '长沙', '西安', '武汉'].map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
            <input
              value={location}
              onChange={(event) => setLocation(event.target.value)}
              placeholder="地点说明（可选）"
              className="rounded-xl px-3 py-2"
              style={{ background: '#fffef9', border: '1px solid rgba(127,83,49,0.25)' }}
            />
            <select
              value={severity}
              onChange={(event) => setSeverity(event.target.value)}
              className="rounded-xl px-3 py-2"
              style={{ background: '#fffef9', border: '1px solid rgba(127,83,49,0.25)' }}
            >
              {['低', '中', '高'].map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="请描述你发现的问题，例如：文保标识损坏、导览信息缺失、现场不文明行为等。"
            className="mt-3 min-h-[110px] w-full rounded-xl px-3 py-2"
            style={{ background: '#fffef9', border: '1px solid rgba(127,83,49,0.25)' }}
          />

          <div className="mt-3 flex flex-wrap items-center gap-3">
            <label
              className="inline-flex cursor-pointer items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold"
              style={{ background: '#fff2e1', border: '1px solid rgba(127,83,49,0.25)', color: '#6f3f1f' }}
            >
              上传现场图
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={async (event) => {
                  const file = event.target.files?.[0];
                  if (!file) return;
                  const data = await toDataUrl(file);
                  setImageUrl(data);
                }}
              />
            </label>
            <button
              onClick={() => void submitTask()}
              disabled={submitting}
              className="rounded-xl px-4 py-2 text-sm font-semibold disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg, #8f5a35, #bd8054)', color: '#fff8ef' }}
            >
              提交工单
            </button>
          </div>
        </article>

        <article className="rounded-2xl p-5" style={{ background: '#fff8ef', border: '1px solid rgba(127,83,49,0.2)' }}>
          <div className="flex items-center gap-2">
            <BadgeCheck className="h-4 w-4" style={{ color: '#8f5a35' }} />
            <h3 className="text-lg font-black" style={{ color: '#5f3920', fontFamily: "'Noto Serif SC', serif" }}>
              区块链存证
            </h3>
          </div>
          <p className="mt-2 text-sm" style={{ color: '#7a5b46' }}>
            可把你的志愿讲解、文保巡检、公众教育活动记录上链，形成可信时间戳。
          </p>
          <div className="mt-3 grid gap-3">
            <select
              value={chainCity}
              onChange={(event) => setChainCity(event.target.value)}
              className="rounded-xl px-3 py-2"
              style={{ background: '#fffef9', border: '1px solid rgba(127,83,49,0.25)' }}
            >
              {['杭州', '成都', '长沙', '西安', '武汉'].map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
            <input
              value={chainArtifact}
              onChange={(event) => setChainArtifact(event.target.value)}
              placeholder="关联文物/地点（可选）"
              className="rounded-xl px-3 py-2"
              style={{ background: '#fffef9', border: '1px solid rgba(127,83,49,0.25)' }}
            />
            <textarea
              value={chainNote}
              onChange={(event) => setChainNote(event.target.value)}
              placeholder="上链说明，例如：完成岳麓书院志愿讲解2小时。"
              className="min-h-[100px] rounded-xl px-3 py-2"
              style={{ background: '#fffef9', border: '1px solid rgba(127,83,49,0.25)' }}
            />
            <button
              onClick={() => void submitChainRecord()}
              disabled={submitting}
              className="rounded-xl px-4 py-2 text-sm font-semibold disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg, #8f5a35, #bd8054)', color: '#fff8ef' }}
            >
              上链存证
            </button>
          </div>
        </article>
      </section>

      <section className="rounded-2xl p-5" style={{ background: '#fff8ef', border: '1px solid rgba(127,83,49,0.2)' }}>
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4" style={{ color: '#8f5a35' }} />
            <h3 className="text-lg font-black" style={{ color: '#5f3920', fontFamily: "'Noto Serif SC', serif" }}>
              工单列表
            </h3>
          </div>
          <div className="flex gap-2">
            {(['全部', '待核验', '处理中', '已归档'] as TaskStatus[]).map((item) => (
              <button
                key={item}
                onClick={() => setStatusFilter(item)}
                className="rounded-full px-3 py-1 text-xs font-semibold"
                style={{
                  background: statusFilter === item ? 'rgba(143,90,53,0.2)' : 'rgba(143,90,53,0.08)',
                  color: statusFilter === item ? '#6f3f1f' : '#8f5a35',
                }}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-3">
          {tasks.map((task) => (
            <article key={task.id} className="rounded-xl p-3" style={{ background: '#fffef9', border: '1px solid rgba(127,83,49,0.2)' }}>
              <p className="text-xs" style={{ color: '#8e613f' }}>
                {task.city} · {task.location || '未指定地点'} · {new Date(task.createdAt).toLocaleString('zh-CN')}
              </p>
              <h4 className="mt-1 text-base font-bold" style={{ color: '#5f3920' }}>
                {task.title}
              </h4>
              <p className="mt-1 text-sm" style={{ color: '#7a5b46' }}>
                {task.description}
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                <span className="rounded-full px-2 py-0.5 text-xs" style={{ background: 'rgba(143,90,53,0.1)', color: '#8f5a35' }}>
                  严重等级：{task.severity}
                </span>
                <span className="rounded-full px-2 py-0.5 text-xs" style={{ background: 'rgba(143,90,53,0.1)', color: '#8f5a35' }}>
                  状态：{task.status}
                </span>
              </div>
              {user?.id && (
                <div className="mt-2 flex gap-2">
                  {(['待核验', '处理中', '已归档'] as const).map((status) => (
                    <button
                      key={status}
                      onClick={() => void updateTaskStatus(task, status)}
                      className="rounded-full px-2 py-1 text-xs font-semibold"
                      style={{ background: 'rgba(143,90,53,0.1)', color: '#8f5a35' }}
                    >
                      设为{status}
                    </button>
                  ))}
                </div>
              )}
            </article>
          ))}
          {tasks.length === 0 && (
            <p className="text-sm" style={{ color: '#7a5b46' }}>
              当前暂无工单记录。
            </p>
          )}
        </div>
      </section>

      <section className="rounded-2xl p-5" style={{ background: '#fff8ef', border: '1px solid rgba(127,83,49,0.2)' }}>
        <h3 className="text-lg font-black" style={{ color: '#5f3920', fontFamily: "'Noto Serif SC', serif" }}>
          最新链上区块
        </h3>
        <div className="mt-3 space-y-2">
          {chainRecords.map((record) => (
            <div key={record.hash} className="rounded-xl p-3" style={{ background: '#fffef9', border: '1px solid rgba(127,83,49,0.2)' }}>
              <p className="text-xs" style={{ color: '#8e613f' }}>
                区块 #{record.index} · {new Date(record.timestamp).toLocaleString('zh-CN')}
              </p>
              <p className="text-sm font-semibold" style={{ color: '#5f3920' }}>
                {record.payload.type} · {record.payload.city || '跨城'}
              </p>
              <p className="text-xs" style={{ color: '#7a5b46' }}>
                {record.payload.note || '链上记录已生成'}
              </p>
            </div>
          ))}
          {chainRecords.length === 0 && (
            <p className="text-sm" style={{ color: '#7a5b46' }}>
              暂无链上记录。
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
