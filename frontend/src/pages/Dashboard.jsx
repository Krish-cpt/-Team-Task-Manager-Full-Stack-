import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { format, isPast, parseISO } from 'date-fns';

const StatCard = ({ label, value, color, icon }) => (
  <div style={{
    background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)',
    padding: 24, display: 'flex', flexDirection: 'column', gap: 12,
    borderLeft: `3px solid ${color}`,
  }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ fontSize: 13, color: 'var(--text2)', fontWeight: 500 }}>{label}</span>
      <span style={{ fontSize: 20 }}>{icon}</span>
    </div>
    <div style={{ fontFamily: 'Syne', fontSize: 36, fontWeight: 800, color }}>{value ?? '—'}</div>
  </div>
);

const priorityColor = { critical: '#ef4444', high: '#f97316', medium: '#f59e0b', low: '#22c55e' };
const statusLabel = { todo: 'To Do', in_progress: 'In Progress', review: 'Review', done: 'Done' };
const statusColor = { todo: '#5a5a72', in_progress: '#3b82f6', review: '#f59e0b', done: '#22c55e' };

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/tasks/stats/dashboard'),
      api.get('/tasks?assigneeId=' + user.id),
    ]).then(([statsRes, tasksRes]) => {
      setStats(statsRes.data.stats);
      setTasks(tasksRes.data.tasks.slice(0, 8));
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}>
      <div className="spinner" style={{ width: 32, height: 32 }} />
    </div>
  );

  return (
    <div style={{ padding: '32px 40px', maxWidth: 1200 }} className="animate-in">
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, marginBottom: 6 }}>
          Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'},{' '}
          <span style={{ color: 'var(--accent2)' }}>{user.name.split(' ')[0]}</span>
        </h1>
        <p style={{ color: 'var(--text2)' }}>{format(new Date(), 'EEEE, MMMM d, yyyy')}</p>
      </div>

      {/* Stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 40 }}>
        <StatCard label="Total Tasks" value={stats?.total} color="var(--accent2)" icon="◻" />
        <StatCard label="In Progress" value={stats?.inProgress} color="var(--blue)" icon="↻" />
        <StatCard label="In Review" value={stats?.review} color="var(--yellow)" icon="◎" />
        <StatCard label="Completed" value={stats?.done} color="var(--green)" icon="✓" />
        <StatCard label="Overdue" value={stats?.overdue} color="var(--red)" icon="⚠" />
        <StatCard label="My Tasks" value={stats?.myTasks} color="var(--orange)" icon="★" />
      </div>

      {/* My tasks */}
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: 16 }}>My Assigned Tasks</h2>
          <Link to="/tasks" style={{ fontSize: 13, color: 'var(--accent2)' }}>View all →</Link>
        </div>

        {tasks.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text3)' }}>
            <div style={{ fontSize: 36, marginBottom: 8 }}>○</div>
            No tasks assigned to you
          </div>
        ) : (
          <div>
            {tasks.map((task, i) => {
              const isOverdue = task.dueDate && isPast(parseISO(task.dueDate)) && task.status !== 'done';
              return (
                <div key={task.id} style={{
                  padding: '14px 24px', borderBottom: i < tasks.length - 1 ? '1px solid var(--border)' : 'none',
                  display: 'flex', alignItems: 'center', gap: 16,
                }}>
                  <span style={{
                    width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                    background: priorityColor[task.priority] || '#888',
                  }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 500, marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {task.title}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text3)' }}>
                      {task.Project?.name} • {isOverdue && <span style={{ color: 'var(--red)' }}>Overdue</span>}
                      {!isOverdue && task.dueDate && <span>Due {format(parseISO(task.dueDate), 'MMM d')}</span>}
                    </div>
                  </div>
                  <span style={{
                    fontSize: 11, padding: '3px 10px', borderRadius: 20, fontWeight: 500,
                    background: `${statusColor[task.status]}20`,
                    color: statusColor[task.status],
                    border: `1px solid ${statusColor[task.status]}40`,
                  }}>{statusLabel[task.status]}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
