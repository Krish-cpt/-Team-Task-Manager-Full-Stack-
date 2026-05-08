import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { format, isPast, parseISO } from 'date-fns';

const STATUS_COLORS = { todo: '#5a5a72', in_progress: '#3b82f6', review: '#f59e0b', done: '#22c55e' };
const STATUS_LABELS = { todo: 'To Do', in_progress: 'In Progress', review: 'Review', done: 'Done' };
const PRIORITY_COLORS = { critical: '#ef4444', high: '#f97316', medium: '#f59e0b', low: '#22c55e' };

const Chip = ({ label, active, onClick, color }) => (
  <button onClick={onClick} style={{
    padding: '5px 14px', borderRadius: 20, fontSize: 12, fontWeight: active ? 600 : 400,
    background: active ? (color ? `${color}20` : 'var(--accent-glow)') : 'var(--bg3)',
    border: `1px solid ${active ? (color || 'var(--accent)') : 'var(--border)'}`,
    color: active ? (color || 'var(--accent2)') : 'var(--text2)', cursor: 'pointer',
  }}>{label}</button>
);

export default function Tasks() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: '', priority: '', overdue: false, mine: false });

  const load = () => {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.priority) params.append('priority', filters.priority);
    if (filters.overdue) params.append('overdue', 'true');
    if (filters.mine) params.append('assigneeId', user.id);
    setLoading(true);
    api.get(`/tasks?${params}`).then(r => setTasks(r.data.tasks)).finally(() => setLoading(false));
  };

  useEffect(load, [filters]);

  const toggleStatus = (s) => setFilters(f => ({ ...f, status: f.status === s ? '' : s }));
  const togglePriority = (p) => setFilters(f => ({ ...f, priority: f.priority === p ? '' : p }));

  return (
    <div style={{ padding: '32px 40px', maxWidth: 1000 }} className="animate-in">
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 28, marginBottom: 4 }}>All Tasks</h1>
        <p style={{ color: 'var(--text2)' }}>{tasks.length} task{tasks.length !== 1 ? 's' : ''} found</p>
      </div>

      {/* Filters */}
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '16px 20px', marginBottom: 24 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
          <span style={{ fontSize: 12, color: 'var(--text3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Status:</span>
          {['todo', 'in_progress', 'review', 'done'].map(s => (
            <Chip key={s} label={STATUS_LABELS[s]} active={filters.status === s} onClick={() => toggleStatus(s)} color={STATUS_COLORS[s]} />
          ))}
          <div style={{ width: 1, height: 20, background: 'var(--border)', margin: '0 4px' }} />
          <span style={{ fontSize: 12, color: 'var(--text3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Priority:</span>
          {['critical', 'high', 'medium', 'low'].map(p => (
            <Chip key={p} label={p.charAt(0).toUpperCase() + p.slice(1)} active={filters.priority === p} onClick={() => togglePriority(p)} color={PRIORITY_COLORS[p]} />
          ))}
          <div style={{ width: 1, height: 20, background: 'var(--border)', margin: '0 4px' }} />
          <Chip label="⚠ Overdue" active={filters.overdue} onClick={() => setFilters(f => ({ ...f, overdue: !f.overdue }))} color="var(--red)" />
          <Chip label="★ Mine" active={filters.mine} onClick={() => setFilters(f => ({ ...f, mine: !f.mine }))} />
          {(filters.status || filters.priority || filters.overdue || filters.mine) && (
            <button onClick={() => setFilters({ status: '', priority: '', overdue: false, mine: false })}
              style={{ padding: '5px 14px', borderRadius: 20, fontSize: 12, background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer' }}>
              Clear all ×
            </button>
          )}
        </div>
      </div>

      {/* Task list */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="spinner" style={{ width: 28, height: 28 }} /></div>
      ) : tasks.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 80, color: 'var(--text3)' }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>✓</div>
          No tasks match your filters
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {tasks.map(task => {
            const isOverdue = task.dueDate && isPast(parseISO(task.dueDate)) && task.status !== 'done';
            return (
              <div key={task.id} style={{
                display: 'flex', alignItems: 'center', gap: 16, padding: '14px 20px',
                background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10,
                transition: 'border-color 0.1s',
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border2)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>
                {/* Priority dot */}
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: PRIORITY_COLORS[task.priority], flexShrink: 0 }} title={task.priority} />

                {/* Title + project */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 500, fontSize: 14, marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{task.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--text3)', display: 'flex', gap: 8, alignItems: 'center' }}>
                    {task.Project && (
                      <Link to={`/projects/${task.Project.id}`} style={{ color: 'var(--accent2)', display: 'flex', alignItems: 'center', gap: 4 }}
                        onClick={e => e.stopPropagation()}>
                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: task.Project.color }} />
                        {task.Project.name}
                      </Link>
                    )}
                    {task.description && <span style={{ color: 'var(--text3)' }}>• {task.description.slice(0, 60)}{task.description.length > 60 ? '…' : ''}</span>}
                  </div>
                </div>

                {/* Assignee */}
                <div style={{ flexShrink: 0, minWidth: 100, textAlign: 'right' }}>
                  {task.assignee ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'flex-end' }}>
                      <div style={{ width: 22, height: 22, borderRadius: '50%', background: `hsl(${task.assignee.name.charCodeAt(0) * 13 % 360}, 60%, 50%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: '#fff' }}>{task.assignee.name[0]}</div>
                      <span style={{ fontSize: 12, color: 'var(--text2)' }}>{task.assignee.name.split(' ')[0]}</span>
                    </div>
                  ) : <span style={{ fontSize: 12, color: 'var(--text3)' }}>Unassigned</span>}
                </div>

                {/* Due date */}
                <div style={{ flexShrink: 0, width: 80, textAlign: 'center' }}>
                  {task.dueDate ? (
                    <span style={{ fontSize: 12, color: isOverdue ? 'var(--red)' : 'var(--text3)' }}>
                      {isOverdue ? '⚠ ' : ''}{format(parseISO(task.dueDate), 'MMM d')}
                    </span>
                  ) : <span style={{ fontSize: 12, color: 'var(--border2)' }}>—</span>}
                </div>

                {/* Status */}
                <span style={{
                  flexShrink: 0, fontSize: 11, padding: '4px 12px', borderRadius: 20, fontWeight: 500,
                  background: `${STATUS_COLORS[task.status]}18`,
                  color: STATUS_COLORS[task.status],
                  border: `1px solid ${STATUS_COLORS[task.status]}40`,
                }}>{STATUS_LABELS[task.status]}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
