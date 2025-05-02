import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import useTasks from '../hooks/useTasks';
import TaskList from '../components/TaskList';
import TaskForm from '../components/TaskForm';
import FilterBar from '../components/FilterBar';
import { FiPlus } from 'react-icons/fi';
import '../index.css';

function Dashboard() {
  const { user, logout, checkAuth } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState('all');
  const { 
    tasks, 
    addTask, 
    updateTask, 
    deleteTask, 
    toggleTaskStatus,
    loading, 
    isOffline,
    error 
  } = useTasks(filter);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const handleAddTask = async (taskData) => {
    const { isOffline } = await addTask(taskData);
    setShowForm(false);
    
    if (isOffline) {
      // You can add a toast notification here
      console.log('Saved locally - will sync when online');
    }
  };

  if (!user) {
    return <div className="loading-message">Loading...</div>;
  }

  return (
    <div className="dashboard">
      {isOffline && (
        <div className="offline-banner">
          ⚠️ You're offline - changes will be saved locally
        </div>
      )}
      
      {error && <div className="error-banner">{error}</div>}

      <div className="dashboard-header">
        <h1>Welcome, {user.name}</h1>
        <button onClick={logout} className="logout-button">
          Logout
        </button>
      </div>

      <div className="dashboard-controls">
        <FilterBar currentFilter={filter} onFilterChange={setFilter} />
        
        {!showForm ? (
          <button
            onClick={() => setShowForm(true)}
            className="add-task-button"
          >
            <FiPlus className="icon" />
            Add New Task
          </button>
        ) : (
          <TaskForm
            onSubmit={handleAddTask}
            onCancel={() => setShowForm(false)}
          />
        )}
      </div>

      <div className="task-container">
        {loading ? (
          <div className="loading-message">Loading tasks...</div>
        ) : (
          <TaskList
            tasks={tasks}
            onUpdate={updateTask}
            onDelete={deleteTask}
            onToggleStatus={toggleTaskStatus}
          />
        )}
      </div>
    </div>
  );
}

export default Dashboard;