import { useState, useEffect } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

// Helper function to generate unique IDs for local tasks
const generateId = () => Date.now().toString();

export default function useTasks(filter) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Add authorization header to requests
  const getAuthConfig = () => {
    const token = localStorage.getItem('token');
    return {
      headers: {
        Authorization: `Bearer ${token}`
      }
    };
  };

  // Handle unauthorized errors
  const handleUnauthorized = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  // Load tasks from server with local storage fallback
  useEffect(() => {
    const loadTasks = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // First try to get tasks from server
        let url = '/tasks';
        const params = {};
        
        if (filter === 'active') params.status = 'incomplete';
        if (filter === 'completed') params.status = 'completed';
        
        const response = await api.get(url, {
          ...getAuthConfig(),
          params
        });
        
        const serverTasks = response.data.data; // Access the nested data property
        
        // Save to state and local storage
        setTasks(serverTasks);
        localStorage.setItem('tasks', JSON.stringify(serverTasks));
        setIsOffline(false);
      } catch (err) {
        console.error('Error loading tasks:', err);
        
        if (err.response?.status === 401) {
          handleUnauthorized();
          return;
        }

        // Fallback to local storage if available
        const localTasks = JSON.parse(localStorage.getItem('tasks')) || [];
        setTasks(localTasks);
        setIsOffline(true);
        setError(err.response?.data?.error || 'Connection error - using locally saved tasks');
      } finally {
        setLoading(false);
      }
    };

    loadTasks();
  }, [filter, navigate]);

  // Sync when coming back online
  useEffect(() => {
    const handleOnline = () => {
      if (isOffline) {
        console.log('Connection restored - syncing tasks...');
        setIsOffline(false);
        // Trigger a reload when connection is restored
        setLoading(true);
        loadTasks();
      }
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [isOffline]);

  const loadTasks = async () => {
    try {
      const response = await api.get('/tasks', getAuthConfig());
      setTasks(response.data.data); // Access the nested data property
      localStorage.setItem('tasks', JSON.stringify(response.data.data));
    } catch (err) {
      console.error('Error reloading tasks:', err);
      if (err.response?.status === 401) {
        handleUnauthorized();
      }
    }
  };

  const addTask = async (taskData) => {
    const newTask = {
      ...taskData,
      _id: generateId(),
      createdAt: new Date().toISOString(),
      status: 'incomplete'
    };

    try {
      // Try to save to server first
      const response = await api.post('/tasks', newTask, getAuthConfig());
      const updatedTasks = [response.data.data, ...tasks]; // Access the nested data property
      
      setTasks(updatedTasks);
      localStorage.setItem('tasks', JSON.stringify(updatedTasks));
      setIsOffline(false);
      return { success: true, isOffline: false };
    } catch (err) {
      console.error('Failed to save to server:', err);
      
      if (err.response?.status === 401) {
        handleUnauthorized();
        return { success: false, isOffline: false };
      }

      // Save locally if server fails
      const updatedTasks = [newTask, ...tasks];
      setTasks(updatedTasks);
      localStorage.setItem('tasks', JSON.stringify(updatedTasks));
      setIsOffline(true);
      return { success: true, isOffline: true };
    }
  };

  const updateTask = async (taskId, updates) => {
    try {
      // Try server update first
      const response = await api.put(`/tasks/${taskId}`, updates, getAuthConfig());
      const updatedTasks = tasks.map(task => 
        task._id === taskId ? response.data.data : task // Access the nested data property
      );
      
      setTasks(updatedTasks);
      localStorage.setItem('tasks', JSON.stringify(updatedTasks));
      setIsOffline(false);
      return { success: true, isOffline: false };
    } catch (err) {
      console.error('Failed to update on server:', err);
      
      if (err.response?.status === 401) {
        handleUnauthorized();
        return { success: false, isOffline: false };
      }

      // Local update fallback
      const updatedTasks = tasks.map(task => 
        task._id === taskId ? { ...task, ...updates } : task
      );
      
      setTasks(updatedTasks);
      localStorage.setItem('tasks', JSON.stringify(updatedTasks));
      setIsOffline(true);
      return { success: true, isOffline: true };
    }
  };

  const deleteTask = async (taskId) => {
    try {
      // Try server delete first
      await api.delete(`/tasks/${taskId}`, getAuthConfig());
      const updatedTasks = tasks.filter(task => task._id !== taskId);
      
      setTasks(updatedTasks);
      localStorage.setItem('tasks', JSON.stringify(updatedTasks));
      setIsOffline(false);
      return { success: true, isOffline: false };
    } catch (err) {
      console.error('Failed to delete on server:', err);
      
      if (err.response?.status === 401) {
        handleUnauthorized();
        return { success: false, isOffline: false };
      }

      // Local delete fallback
      const updatedTasks = tasks.filter(task => task._id !== taskId);
      
      setTasks(updatedTasks);
      localStorage.setItem('tasks', JSON.stringify(updatedTasks));
      setIsOffline(true);
      return { success: true, isOffline: true };
    }
  };

  const toggleTaskStatus = async (taskId) => {
    const task = tasks.find(t => t._id === taskId);
    if (!task) return { success: false };
    
    const newStatus = task.status === 'complete' ? 'incomplete' : 'complete';
    return updateTask(taskId, { status: newStatus });
  };

  return { 
    tasks, 
    addTask, 
    updateTask, 
    deleteTask,
    toggleTaskStatus,
    loading, 
    isOffline,
    error,
    reloadTasks: loadTasks
  };
}