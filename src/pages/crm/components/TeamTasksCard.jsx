import React, { useState } from 'react';
import { Scissors, MessageCircle, Package, CheckCircle2, Circle, Plus, Check } from 'lucide-react';

export default function TeamTasksCard({ tasks = [], onToggleTask, onAddTask }) {
  const [showAddInput, setShowAddInput] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newAssignee, setNewAssignee] = useState('Meera');

  const getTaskIcon = (task) => {
    if (task.department === 'Grooming' || task.title.toLowerCase().includes('grooming')) {
      return Scissors;
    }
    if (task.department === 'Reception' || task.title.toLowerCase().includes('reminder') || task.title.toLowerCase().includes('parent')) {
      return MessageCircle;
    }
    return Package;
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    onAddTask({
      id: `task-${Date.now()}`,
      title: newTitle.trim(),
      assignee: newAssignee,
      department: newAssignee === 'Meera' ? 'Grooming' : newAssignee === 'Kavya' ? 'Reception' : 'Operations',
      dueTime: 'Today',
      completed: false,
      priority: 'Medium'
    });
    setNewTitle('');
    setShowAddInput(false);
  };

  return (
    <div className="bg-[#101C1A]/90 backdrop-blur-md rounded-2xl border border-emerald-900/30 p-5 shadow-xl flex flex-col h-full">
      {/* Card Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-white tracking-wide">
          Team tasks
        </h3>
        <button 
          onClick={() => setShowAddInput(!showAddInput)}
          className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
        >
          {showAddInput ? 'Cancel' : 'Manage tasks'}
        </button>
      </div>

      {/* Quick Add Input */}
      {showAddInput && (
        <form onSubmit={handleAddSubmit} className="mb-3 p-2.5 rounded-xl bg-[#0C1514] border border-emerald-800/40 space-y-2">
          <input
            type="text"
            placeholder="What needs to be done?"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="w-full bg-[#142320] border border-emerald-900/50 rounded-lg px-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            autoFocus
          />
          <div className="flex items-center justify-between gap-2">
            <select
              value={newAssignee}
              onChange={(e) => setNewAssignee(e.target.value)}
              className="bg-[#142320] border border-emerald-900/50 rounded-lg px-2 py-1 text-[11px] text-slate-300"
            >
              <option value="Meera">Meera (Grooming)</option>
              <option value="Kavya">Kavya (Reception)</option>
              <option value="Rahul">Rahul (Boarding)</option>
              <option value="Dr. Ananya">Dr. Ananya (Vet)</option>
              <option value="Store">Store (Inventory)</option>
            </select>
            <button
              type="submit"
              className="px-3 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-[11px] flex items-center gap-1"
            >
              <Plus className="w-3 h-3" /> Add
            </button>
          </div>
        </form>
      )}

      {/* Tasks List */}
      <div className="space-y-3 flex-1 overflow-y-auto custom-scrollbar pr-1">
        {tasks.map((task) => {
          const Icon = getTaskIcon(task);
          return (
            <div
              key={task.id}
              onClick={() => onToggleTask(task.id)}
              className="p-3 rounded-xl bg-[#0C1514] hover:bg-[#132220] border border-emerald-900/20 hover:border-emerald-700/30 transition-all flex items-center justify-between gap-3 cursor-pointer group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className={`p-2 rounded-lg ${
                  task.completed 
                    ? 'bg-emerald-500/10 text-emerald-400' 
                    : 'bg-white/[0.04] text-slate-400 group-hover:text-emerald-300'
                }`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className={`text-xs font-medium truncate ${
                    task.completed ? 'line-through text-slate-500' : 'text-slate-200'
                  }`}>
                    {task.title}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Due: {task.dueTime}
                  </div>
                </div>
              </div>

              {/* Assignee Badge matching sample image */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="px-2.5 py-1 rounded-lg bg-[#142320] border border-emerald-800/30 text-[11px] font-medium text-slate-300">
                  {task.assignee}
                </span>
                {task.completed ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Circle className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 transition-colors" />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
