import { format } from 'date-fns';
import { FiCheck, FiTrash2 } from 'react-icons/fi';
import '../index.css';

function TaskList({ tasks = [], onUpdate, onDelete }) {
  const handleStatusChange = (task) => {
    onUpdate(task._id, { 
      status: task.status === 'completed' ? 'incomplete' : 'completed' 
    });
  };

  const getPriorityClass = (priority) => {
    if (!priority) return 'priority-default';
    const priorityLower = priority.toLowerCase();
    switch (priorityLower) {
      case 'high': return 'priority-high';
      case 'medium': return 'priority-medium';
      case 'low': return 'priority-low';
      default: return 'priority-default';
    }
  };

  if (tasks.length === 0) {
    return (
      <div className="empty-state">
        No tasks found. Add a new task to get started!
      </div>
    );
  }

  return (
    <div className="task-list">
      {tasks.map((task) => (
        <div key={task._id} className={`task-item ${task.status === 'completed' ? 'completed' : ''}`}>
          <div className="task-header">
            <h3 className="task-title">{task.title}</h3>
            <div className="task-actions">
              <button
                className="action-btn complete-btn"
                onClick={() => handleStatusChange(task)}
                title={task.status === 'completed' ? 'Mark incomplete' : 'Mark complete'}
              >
                <FiCheck />
              </button>
              <button
                className="action-btn delete-btn"
                onClick={() => onDelete(task._id)}
                title="Delete task"
              >
                <FiTrash2 />
              </button>
            </div>
          </div>
          {task.description && (
            <p className="task-description">{task.description}</p>
          )}
          <div className="task-meta">
            <span className={`priority-badge ${getPriorityClass(task.priority)}`}>
              {task.priority || 'Not Set'}
            </span>
            <span className="task-date">
              {task.createdAt ? format(new Date(task.createdAt), 'MMM d, yyyy') : ''}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

export default TaskList;