import React, { useState } from 'react';
import { useProject } from '../../context/ProjectContext';
import { Calendar as CalendarIcon, Clock, Plus, Trash2, Check, AlertCircle } from 'lucide-react';
import { DEFAULT_CALENDAR } from '../../engine/calendarUtils';

export const CalendarView: React.FC = () => {
  const { project, updateProject } = useProject();

  const calendar = project.calendars?.[0] || DEFAULT_CALENDAR;

  const dayNames = [
    { id: 0, name: 'Sunday' },
    { id: 1, name: 'Monday' },
    { id: 2, name: 'Tuesday' },
    { id: 3, name: 'Wednesday' },
    { id: 4, name: 'Thursday' },
    { id: 5, name: 'Friday' },
    { id: 6, name: 'Saturday' },
  ];

  const [newHolidayName, setNewHolidayName] = useState('');
  const [newHolidayDate, setNewHolidayDate] = useState('2026-06-15');

  const toggleWorkingDay = (dayId: number) => {
    let updatedWorkingDays = [...calendar.workingDays];
    if (updatedWorkingDays.includes(dayId)) {
      updatedWorkingDays = updatedWorkingDays.filter((d) => d !== dayId);
    } else {
      updatedWorkingDays.push(dayId);
    }

    const updatedCalendar = {
      ...calendar,
      workingDays: updatedWorkingDays.sort(),
    };

    updateProject({
      calendars: [updatedCalendar],
    });
  };

  const handleAddHoliday = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHolidayName || !newHolidayDate) return;

    const newH = {
      id: `h-${Date.now()}`,
      name: newHolidayName,
      date: newHolidayDate,
    };

    const updatedCalendar = {
      ...calendar,
      holidays: [...calendar.holidays, newH],
    };

    updateProject({
      calendars: [updatedCalendar],
    });

    setNewHolidayName('');
  };

  const handleDeleteHoliday = (id: string) => {
    const updatedCalendar = {
      ...calendar,
      holidays: calendar.holidays.filter((h) => h.id !== id),
    };

    updateProject({
      calendars: [updatedCalendar],
    });
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 text-slate-100 overflow-y-auto p-6 select-none">
      <div className="max-w-5xl mx-auto w-full space-y-6">
        {/* Header Title */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-cyan-950 border border-cyan-800 flex items-center justify-center text-cyan-400">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-100 tracking-tight">
                Project Working Calendar & Schedule Constraints
              </h1>
              <p className="text-xs text-slate-400">
                Configure regional working days, shift hours, non-working weekends, and official holidays.
              </p>
            </div>
          </div>
        </div>

        {/* Working Days Configuration */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
          <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider flex items-center space-x-2">
            <Clock className="w-4 h-4 text-cyan-400" />
            <span>Weekly Working Days Configuration</span>
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3">
            {dayNames.map((d) => {
              const isWorking = calendar.workingDays.includes(d.id);
              return (
                <button
                  key={d.id}
                  onClick={() => toggleWorkingDay(d.id)}
                  className={`p-3 rounded-lg border text-center font-bold text-xs transition flex flex-col items-center justify-center space-y-1 ${
                    isWorking
                      ? 'bg-cyan-950/80 border-cyan-500/80 text-cyan-300'
                      : 'bg-slate-950 border-slate-800 text-slate-500 hover:text-slate-300'
                  }`}
                >
                  <span>{d.name}</span>
                  <span className="text-[10px] font-mono">
                    {isWorking ? '8 hrs/day' : 'Non-working'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Project Holidays */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
          <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider flex items-center space-x-2">
            <CalendarIcon className="w-4 h-4 text-amber-400" />
            <span>Official Non-Working Holidays</span>
          </h2>

          <form onSubmit={handleAddHoliday} className="flex items-center space-x-3 text-xs">
            <input
              type="text"
              placeholder="Holiday Name (e.g., National Day)"
              value={newHolidayName}
              onChange={(e) => setNewHolidayName(e.target.value)}
              className="flex-1 bg-slate-950 border border-slate-700 rounded px-3 py-1.5 focus:outline-none focus:border-cyan-500"
            />
            <input
              type="date"
              value={newHolidayDate}
              onChange={(e) => setNewHolidayDate(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded px-3 py-1.5 focus:outline-none"
            />
            <button
              type="submit"
              className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold px-4 py-1.5 rounded transition flex items-center space-x-1"
            >
              <Plus className="w-4 h-4" />
              <span>Add Holiday</span>
            </button>
          </form>

          <div className="divide-y divide-slate-800/60 font-mono text-xs">
            {calendar.holidays.map((h) => (
              <div key={h.id} className="py-2.5 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-amber-400 font-bold">{h.date}</span>
                  <span className="text-slate-200">{h.name}</span>
                </div>
                <button
                  onClick={() => handleDeleteHoliday(h.id)}
                  className="p-1 text-slate-500 hover:text-rose-400 rounded"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
