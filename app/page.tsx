'use client';

import { useState, useEffect } from 'react';

type TaskStatus = 'Pending' | 'Running' | 'Completed';

interface SubTask {
  id: string;
  title: string;
  status: TaskStatus;
}

interface Task {
  id: string;
  title: string;
  status: TaskStatus;
  subTasks: SubTask[];
  isExpanded: boolean;
}

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [newSubTaskTitle, setNewSubTaskTitle] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    const savedTasks = localStorage.getItem('tasks');
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks));
    }
  }, []);

  useEffect(() => {
    if (tasks.length > 0) {
      localStorage.setItem('tasks', JSON.stringify(tasks));
    }
  }, [tasks]);

  const addTask = () => {
    if (newTaskTitle.trim()) {
      const newTask: Task = {
        id: Date.now().toString(),
        title: newTaskTitle,
        status: 'Pending',
        subTasks: [],
        isExpanded: false,
      };
      setTasks([...tasks, newTask]);
      setNewTaskTitle('');
    }
  };

  const deleteTask = (taskId: string) => {
    setTasks(tasks.filter(task => task.id !== taskId));
  };

  const updateTaskStatus = (taskId: string, status: TaskStatus) => {
    setTasks(tasks.map(task =>
      task.id === taskId ? { ...task, status } : task
    ));
  };

  const startEditingTask = (task: Task) => {
    setEditingTaskId(task.id);
    setEditingTitle(task.title);
  };

  const saveTaskEdit = (taskId: string) => {
    if (editingTitle.trim()) {
      setTasks(tasks.map(task =>
        task.id === taskId ? { ...task, title: editingTitle } : task
      ));
    }
    setEditingTaskId(null);
    setEditingTitle('');
  };

  const cancelTaskEdit = () => {
    setEditingTaskId(null);
    setEditingTitle('');
  };

  const toggleTaskExpanded = (taskId: string) => {
    setTasks(tasks.map(task =>
      task.id === taskId ? { ...task, isExpanded: !task.isExpanded } : task
    ));
  };

  const addSubTask = (taskId: string) => {
    const title = newSubTaskTitle[taskId];
    if (title && title.trim()) {
      const newSubTask: SubTask = {
        id: Date.now().toString(),
        title: title,
        status: 'Pending',
      };
      setTasks(tasks.map(task =>
        task.id === taskId
          ? { ...task, subTasks: [...task.subTasks, newSubTask] }
          : task
      ));
      setNewSubTaskTitle({ ...newSubTaskTitle, [taskId]: '' });
    }
  };

  const deleteSubTask = (taskId: string, subTaskId: string) => {
    setTasks(tasks.map(task =>
      task.id === taskId
        ? { ...task, subTasks: task.subTasks.filter(st => st.id !== subTaskId) }
        : task
    ));
  };

  const updateSubTaskStatus = (taskId: string, subTaskId: string, status: TaskStatus) => {
    setTasks(tasks.map(task =>
      task.id === taskId
        ? {
            ...task,
            subTasks: task.subTasks.map(st =>
              st.id === subTaskId ? { ...st, status } : st
            )
          }
        : task
    ));
  };

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case 'Pending': return 'bg-gray-200 text-gray-800';
      case 'Running': return 'bg-blue-200 text-blue-800';
      case 'Completed': return 'bg-green-200 text-green-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">TODO管理アプリ</h1>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex gap-2">
            <input
              type="text"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addTask()}
              placeholder="新しいタスクを入力..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={addTask}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
            >
              追加
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {tasks.map(task => (
            <div key={task.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-4">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => toggleTaskExpanded(task.id)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <svg
                      className={`w-5 h-5 transition-transform ${task.isExpanded ? 'rotate-90' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>

                  {editingTaskId === task.id ? (
                    <>
                      <input
                        type="text"
                        value={editingTitle}
                        onChange={(e) => setEditingTitle(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && saveTaskEdit(task.id)}
                        className="flex-1 px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        autoFocus
                      />
                      <button
                        onClick={() => saveTaskEdit(task.id)}
                        className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
                      >
                        保存
                      </button>
                      <button
                        onClick={cancelTaskEdit}
                        className="px-3 py-1 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 text-sm"
                      >
                        キャンセル
                      </button>
                    </>
                  ) : (
                    <>
                      <span className="flex-1 font-medium text-gray-800">{task.title}</span>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(task.status)}`}>
                        {task.status}
                      </span>
                      <select
                        value={task.status}
                        onChange={(e) => updateTaskStatus(task.id, e.target.value as TaskStatus)}
                        className="px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Running">Running</option>
                        <option value="Completed">Completed</option>
                      </select>
                      <button
                        onClick={() => startEditingTask(task)}
                        className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 text-sm"
                      >
                        編集
                      </button>
                      <button
                        onClick={() => deleteTask(task.id)}
                        className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                      >
                        削除
                      </button>
                    </>
                  )}
                </div>

                {task.isExpanded && (
                  <div className="mt-4 ml-8 space-y-3">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newSubTaskTitle[task.id] || ''}
                        onChange={(e) => setNewSubTaskTitle({ ...newSubTaskTitle, [task.id]: e.target.value })}
                        onKeyPress={(e) => e.key === 'Enter' && addSubTask(task.id)}
                        placeholder="新しいサブタスクを入力..."
                        className="flex-1 px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      />
                      <button
                        onClick={() => addSubTask(task.id)}
                        className="px-4 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                      >
                        追加
                      </button>
                    </div>

                    {task.subTasks.length === 0 ? (
                      <p className="text-gray-500 text-sm italic">サブタスクがありません</p>
                    ) : (
                      <div className="space-y-2">
                        {task.subTasks.map(subTask => (
                          <div key={subTask.id} className="flex items-center gap-2 bg-gray-50 p-2 rounded">
                            <span className="flex-1 text-sm text-gray-700">{subTask.title}</span>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(subTask.status)}`}>
                              {subTask.status}
                            </span>
                            <select
                              value={subTask.status}
                              onChange={(e) => updateSubTaskStatus(task.id, subTask.id, e.target.value as TaskStatus)}
                              className="px-2 py-0.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
                            >
                              <option value="Pending">Pending</option>
                              <option value="Running">Running</option>
                              <option value="Completed">Completed</option>
                            </select>
                            <button
                              onClick={() => deleteSubTask(task.id, subTask.id)}
                              className="px-2 py-0.5 bg-red-500 text-white rounded hover:bg-red-600 text-xs"
                            >
                              削除
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {tasks.length === 0 && (
          <div className="text-center text-gray-500 mt-12">
            <p className="text-lg">タスクがありません</p>
            <p className="text-sm mt-2">上の入力欄から新しいタスクを追加してください</p>
          </div>
        )}
      </div>
    </div>
  );
}
