const Task = require('../models/Task');

// @desc    Get all tasks
const getTasks = async (req, res, next) => {
  try {
    // Filter by status if provided
    let query = { user: req.user.id };
    if (req.query.status) {
      query.status = req.query.status;
    }

    const tasks = await Task.find(query).sort({ createdAt: -1 });
    res.status(200).json({ 
      success: true, 
      count: tasks.length, 
      data: tasks 
    });
  } catch (err) {
    res.status(400).json({ 
      success: false, 
      error: 'Failed to fetch tasks: ' + err.message 
    });
  }
};

// @desc    Create new task
const createTask = async (req, res, next) => {
  try {
    req.body.user = req.user.id;
    const task = await Task.create(req.body);
    res.status(201).json({ 
      success: true, 
      data: task 
    });
  } catch (err) {
    res.status(400).json({ 
      success: false, 
      error: err.message 
    });
  }
};

// @desc    Update task
const updateTask = async (req, res, next) => {
  try {
    let task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ 
        success: false, 
        error: 'Task not found' 
      });
    }

    // Make sure user owns the task
    if (task.user.toString() !== req.user.id) {
      return res.status(401).json({ 
        success: false, 
        error: 'Not authorized' 
      });
    }

    task = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({ 
      success: true, 
      data: task 
    });
  } catch (err) {
    res.status(400).json({ 
      success: false, 
      error: err.message 
    });
  }
};

// @desc    Delete task
const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ 
        success: false, 
        error: 'Task not found' 
      });
    }

    // Make sure user owns the task
    if (task.user.toString() !== req.user.id) {
      return res.status(401).json({ 
        success: false, 
        error: 'Not authorized' 
      });
    }

    await task.deleteOne();

    res.status(200).json({ 
      success: true, 
      data: {} 
    });
  } catch (err) {
    res.status(400).json({ 
      success: false, 
      error: err.message 
    });
  }
};

module.exports = {
  getTasks,
  createTask,
  updateTask,
  deleteTask
};