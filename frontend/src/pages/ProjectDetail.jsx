import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { format, isPast, parseISO } from 'date-fns';

const STATUSES = ['todo', 'in_progress', 'review', 'done'];
const STATUS_LABELS = { todo: 'To Do', in_progress: 'In Progress', review: 'Review', done: 'Done' };
const STATUS_COLORS = { todo: '#5a5a72', in_progress: '#3b82f6', review: '#f59e0b', done: '#22c55e' };
const PRIORITIES = ['low', 'medium', 'high', 'critical'];
const PRIORITY_COLORS = { critical: '#ef4444', high: '#f97316', medium: '#f59e0b', low: '#22c55e' };

const TaskModal = ({ task, onClose, onSave, onDelete, projectMembers, isAdmin }) => {
  const [form, setForm] = useState(task || { title: '', description: '', status: 'todo', priority: 'medium', assigneeId: '', dueDate: '' });
  const [loading, setLoading] = useState(false);
  const isNew = !task;

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true);
    await onSave(form);
    setLoading(false);
  };

  const inputStyle = { width: '100%', padding: '9px 12px', background: 'var(--bg3)', border: '1px solid var(--border2)', borderRadius: 8, color: 'var(--text)', fontSize: 13, outline: 'none' };
  const labelStyle = { display: 'block', fontSize: 12, color: 'var(--text2)', marginBottom: 5, fontWeight: 500 };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: 20 }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border2)', borderRadius: 'var(--radius-lg)', width: '100%', maxWidth: 500, padding: 28, maxHeight: '90vh', overflow: 'auto' }} className="animate-in">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ fontSize: 17 }}>{isNew ? 'New Task' : 'Edit Task'}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text3)', fontSize: 20, cursor: 'pointer' }}>×</button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={labelStyle}>Title *</label>
            <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Task title" required style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Description</label>
            <textarea value={form.description || ''} onChange={e => setForm({ ...form, description: e.target.value })}
              placeholder="Add details..." rows={3}
              style={{ ...inputStyle, resize: 'vertical' }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={labelStyle}>Status</label>
              <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} style={{ ...inputStyle, cursor: 'pointer' }}>
                {STATUSES.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Priority</label>
              <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })} style={{ ...inputStyle, cursor: 'pointer' }}>
                {PRIORITIES.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
              </select>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={labelStyle}>Assign to</label>
              <select value={form.assigneeId || ''} onChange={e => setForm({ ...form, assigneeId: e.target.value || null })} style={{ ...inputStyle, cursor: 'pointer' }}>
                <option value="">Unassigned</option>
                {projectMembers.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Due date</label>
              <input type="date" value={form.dueDate || ''} onChange={e => setForm({ ...form, dueDate: e.target.value })} style={inputStyle} />
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
            {!isNew && (isAdmin || form.creatorId) && (
              <button type="button" onClick={() => onDelete(task.id)} style={{ padding: '9px 16px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, color: 'var(--red)', fontSize: 13 }}>
                Delete
              </button>
            )}
            <button type="button" onClick={onClose} style={{ flex: 1, padding: 9, background: 'var(--bg3)', border: '1px solid var(--border2)', borderRadius: 8, color: 'var(--text2)', fontSize: 13 }}>Cancel</button>
            <button type="submit" disabled={loading} style={{ flex: 2, padding: 9, background: 'linear-gradient(135deg, var(--accent), #a594f9)', border: 'none', borderRadius: 8, color: '#fff', fontSize: 13, fontWeight: 600 }}>
              {loading ? 'Saving...' : isNew ? 'Create Task' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const TaskCard = ({ task, onClick }) => {
  const isOverdue = task.dueDate && isPast(parseISO(task.dueDate)) && task.status !== 'done';
  return (
    <div onClick={onClick} style={{
      background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8, padding: 14,
      cursor: 'pointer', transition: 'border-color 0.15s, transform 0.15s',
      borderLeft: `3px solid ${PRIORITY_COLORS[task.priority] || '#888'}`,
    }}
    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border2)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'none'; }}>
      <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 8, lineHeight: 1.4 }}>{task.title}</div>
      {task.description && <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 8, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{task.description}</div>}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {task.assignee ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 20, height: 20, borderRadius: '50%', background: `hsl(${task.assignee.name.charCodeAt(0) * 13 % 360}, 60%, 50%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, color: '#fff' }}>{task.assignee.name[0]}</div>
            <span style={{ fontSize: 11, color: 'var(--text2)' }}>{task.assignee.name.split(' ')[0]}</span>
          </div>
        ) : <span style={{ fontSize: 11, color: 'var(--text3)' }}>Unassigned</span>}
        {task.dueDate && <span style={{ fontSize: 11, color: isOverdue ? 'var(--red)' : 'var(--text3)' }}>
          {isOverdue ? '⚠ ' : ''}{format(parseISO(task.dueDate), 'MMM d')}
        </span>}
      </div>
    </div>
  );
};

export default function ProjectDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [taskModal, setTaskModal] = useState(null); // null | 'new' | task object

  const load = () => api.get(`/projects/${id}`).then(r => setProject(r.data.project)).catch(() => navigate('/projects')).finally(() => setLoading(false));
  useEffect(load, [id]);

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}><div className="spinner" style={{ width: 32, height: 32 }} /></div>;
  if (!project) return null;

  const tasksByStatus = STATUSES.reduce((acc, s) => ({ ...acc, [s]: project.tasks?.filter(t => t.status === s) || [] }), {});
  const members = project.members || [];

  const handleSaveTask = async (form) => {
    if (taskModal === 'new') {
      await api.post('/tasks', { ...form, projectId: id });
    } else {
      await api.put(`/tasks/${taskModal.id}`, form);
    }
    setTaskModal(null);
    load();
  };

  const handleDeleteTask = async (taskId) => {
    if (!confirm('Delete this task?')) return;
    await api.delete(`/tasks/${taskId}`);
    setTaskModal(null);
    load();
  };

  const handleDeleteProject = async () => {
    if (!confirm('Delete this entire project and all its tasks?')) return;
    await api.delete(`/projects/${id}`);
    navigate('/projects');
  };

  const handleStatusChange = async (newStatus) => {
    await api.put(`/projects/${id}`, { status: newStatus });
    load();
  };

  return (
    <div style={{ padding: '28px 32px' }} className="animate-in">
      {/* Header */}
      <div style={{ marginBottom: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
            <div style={{ width: 14, height: 14, borderRadius: '50%', background: project.color, flexShrink: 0 }} />
            <h1 style={{ fontSize: 26 }}>{project.name}</h1>
            <select value={project.status} onChange={e => handleStatusChange(e.target.value)}
              style={{ fontSize: 11, padding: '3px 10px', background: 'var(--bg3)', border: '1px solid var(--border2)', borderRadius: 20, color: 'var(--text2)', cursor: 'pointer' }}>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="archived">Archived</option>
            </select>
          </div>
          {project.description && <p style={{ color: 'var(--text2)', fontSize: 14 }}>{project.description}</p>}
          {project.dueDate && <p style={{ fontSize: 12, color: 'var(--text3)', marginTop: 4 }}>Due: {format(parseISO(project.dueDate), 'MMMM d, yyyy')}</p>}
        </div>
        <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
          <button onClick={() => setTaskModal('new')} style={{ padding: '9px 16px', background: 'linear-gradient(135deg, var(--accent), #a594f9)', border: 'none', borderRadius: 8, color: '#fff', fontSize: 13, fontWeight: 600 }}>
            + Add Task
          </button>
          {user.role === 'admin' && (
            <button onClick={handleDeleteProject} style={{ padding: '9px 16px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, color: 'var(--red)', fontSize: 13 }}>
              Delete
            </button>
          )}
        </div>
      </div>

      {/* Members strip */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 28, padding: '12px 16px', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10 }}>
        <span style={{ fontSize: 12, color: 'var(--text3)', marginRight: 4 }}>Team:</span>
        {members.map(m => (
          <div key={m.id} title={`${m.name} (${m.ProjectMember?.role || m.role})`} style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px',
            background: 'var(--bg3)', borderRadius: 20, fontSize: 12,
          }}>
            <div style={{ width: 18, height: 18, borderRadius: '50%', background: `hsl(${m.name.charCodeAt(0) * 13 % 360}, 60%, 50%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, color: '#fff' }}>{m.name[0]}</div>
            {m.name.split(' ')[0]}
          </div>
        ))}
        {members.length === 0 && <span style={{ fontSize: 12, color: 'var(--text3)' }}>No members</span>}
      </div>

      {/* Kanban Board */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, overflowX: 'auto' }}>
        {STATUSES.map(status => {
          const colTasks = tasksByStatus[status];
          return (
            <div key={status} style={{ minWidth: 220, background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
              {/* Column header */}
              <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: `${STATUS_COLORS[status]}10` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: STATUS_COLORS[status] }} />
                  <span style={{ fontSize: 13, fontWeight: 600 }}>{STATUS_LABELS[status]}</span>
                </div>
                <span style={{ fontSize: 11, color: 'var(--text3)', background: 'var(--bg3)', padding: '2px 7px', borderRadius: 10 }}>{colTasks.length}</span>
              </div>
              {/* Tasks */}
              <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 10, minHeight: 80 }}>
                {colTasks.map(task => (
                  <TaskCard key={task.id} task={task} onClick={() => setTaskModal(task)} />
                ))}
                {colTasks.length === 0 && (
                  <div style={{ padding: '16px 0', textAlign: 'center', color: 'var(--text3)', fontSize: 12 }}>No tasks</div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {taskModal !== null && (
        <TaskModal
          task={taskModal === 'new' ? null : taskModal}
          onClose={() => setTaskModal(null)}
          onSave={handleSaveTask}
          onDelete={handleDeleteTask}
          projectMembers={members}
          isAdmin={user.role === 'admin'}
        />
      )}
    </div>
  );
}
