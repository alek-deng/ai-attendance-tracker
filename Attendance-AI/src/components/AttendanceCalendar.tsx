// src/components/AttendanceCalendar.tsx
import { useMemo } from 'react';
import { Calendar as CalendarIcon, CheckCircle, XCircle } from 'lucide-react';

const AttendanceCalendar = ({ attendanceRecords }) => {
  // Create a map of dates to attendance status
  const dateStatusMap = useMemo(() => {
    const map = new Map();
    (attendanceRecords || []).forEach(record => {
      if (record.date) {
        const dateKey = new Date(record.date).toISOString().split('T')[0];
        // If multiple records for same date, prioritize status (Present > Absent)
        if (!map.has(dateKey) || record.status?.toLowerCase() === 'present') {
          map.set(dateKey, record.status?.toLowerCase() || 'unknown');
        }
      }
    });
    return map;
  }, [attendanceRecords]);

  // Get current month
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const firstDay = new Date(currentYear, currentMonth, 1);
  const lastDay = new Date(currentYear, currentMonth + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();

  // Get days of the month
  const days = [];
  // Empty cells for days before month starts
  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push(null);
  }
  // Days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(day);
  }

  const getDateKey = (day) => {
    if (!day) return null;
    const date = new Date(currentYear, currentMonth, day);
    return date.toISOString().split('T')[0];
  };

  const getStatusColor = (status) => {
    if (!status) return '';
    const statusLower = status.toLowerCase();
    if (statusLower === 'present') return 'bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-200';
    if (statusLower === 'absent') return 'bg-rose-100 text-rose-700 border-rose-200 hover:bg-rose-200';
    return 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200';
  };

  const getStatusIcon = (status) => {
    if (!status) return null;
    const statusLower = status.toLowerCase();
    if (statusLower === 'present') return <CheckCircle className="h-2.5 w-2.5" />;
    if (statusLower === 'absent') return <XCircle className="h-2.5 w-2.5" />;
    return null;
  };

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-4 max-w-2xl mx-auto">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-1.5 bg-indigo-100 rounded-lg">
          <CalendarIcon className="h-4 w-4 text-indigo-600" />
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-900">Attendance Calendar</h3>
          <p className="text-xs text-slate-600">{monthNames[currentMonth]} {currentYear}</p>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-3 mb-3 pb-3 border-b border-slate-200">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-emerald-100 border border-emerald-200"></div>
          <span className="text-xs text-slate-600">Present</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-rose-100 border border-rose-200"></div>
          <span className="text-xs text-slate-600">Absent</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-slate-100 border border-slate-200"></div>
          <span className="text-xs text-slate-600">No Record</span>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Day Headers */}
        {dayNames.map((day) => (
          <div key={day} className="text-center text-xs font-semibold text-slate-500 py-1">
            {day}
          </div>
        ))}

        {/* Calendar Days */}
        {days.map((day, index) => {
          if (day === null) {
            return <div key={`empty-${index}`} className="aspect-square"></div>;
          }

          const dateKey = getDateKey(day);
          const status = dateStatusMap.get(dateKey);
          const isToday = day === now.getDate() && currentMonth === now.getMonth() && currentYear === now.getFullYear();

          return (
            <div
              key={day}
              className={`aspect-square rounded border p-0.5 flex flex-col items-center justify-center text-xs font-medium cursor-pointer transition-all ${
                status ? getStatusColor(status) : 'bg-slate-50 border-slate-200 text-slate-400'
              } ${
                isToday ? 'ring-1 ring-blue-500' : ''
              }`}
              title={status ? `${dateKey}: ${status}` : `No record for ${dateKey}`}
            >
              <span className={`text-[10px] font-semibold leading-tight ${isToday ? 'text-blue-700' : ''}`}>{day}</span>
              {status && (
                <div className="mt-0.5">
                  {getStatusIcon(status)}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Stats Summary */}
      <div className="mt-4 pt-3 border-t border-slate-200">
        <div className="grid grid-cols-3 gap-3 text-center">
          <div>
            <div className="text-lg font-bold text-emerald-600">
              {Array.from(dateStatusMap.values()).filter(s => s === 'present').length}
            </div>
            <div className="text-[10px] text-slate-600">Present</div>
          </div>
          <div>
            <div className="text-lg font-bold text-rose-600">
              {Array.from(dateStatusMap.values()).filter(s => s === 'absent').length}
            </div>
            <div className="text-[10px] text-slate-600">Absent</div>
          </div>
          <div>
            <div className="text-lg font-bold text-slate-600">
              {Array.from(dateStatusMap.values()).length}
            </div>
            <div className="text-[10px] text-slate-600">Total</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendanceCalendar;

