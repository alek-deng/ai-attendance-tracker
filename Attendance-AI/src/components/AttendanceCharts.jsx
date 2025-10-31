// src/components/AttendanceCharts.jsx
import React, { useMemo } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip as ReTooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  LineChart,
  Line,
} from 'recharts';
import { Activity, BarChart3, TrendingUp } from 'lucide-react';

// Colors matching the design system - converted to hex for recharts
const COLORS = {
  present: '#6b8e5a', // accent (moss green)
  absent: '#d8534e',   // destructive (terracotta red)
  primary: '#d45a2e',  // primary (terracotta)
  chart: '#7ba068',   // chart color (slightly lighter moss)
};

function buildDatasets(attendanceRecords) {
  const byStatus = { present: 0, absent: 0 };
  const byCourse = new Map();
  const byDate = new Map();

  for (const r of attendanceRecords || []) {
    const statusKey = (r.status || '').toLowerCase();
    if (statusKey === 'present' || statusKey === 'absent') {
      byStatus[statusKey] += 1;
    }

    const course = r.course_name || 'Unknown';
    byCourse.set(course, (byCourse.get(course) || 0) + 1);

    const dateKey = r.date ? String(r.date).slice(0, 10) : 'Unknown';
    byDate.set(dateKey, (byDate.get(dateKey) || 0) + 1);
  }

  const pieData = [
    { name: 'Present', value: byStatus.present },
    { name: 'Absent', value: byStatus.absent },
  ];

  const barData = Array.from(byCourse.entries()).map(([course, count]) => ({ course, classes: count }));
  const lineData = Array.from(byDate.entries())
    .map(([date, count]) => ({ date, classes: count }))
    .sort((a, b) => (a.date > b.date ? 1 : -1));

  return { pieData, barData, lineData };
}

const AttendanceCharts = ({ attendanceRecords }) => {
  const { pieData, barData, lineData } = useMemo(
    () => buildDatasets(attendanceRecords),
    [attendanceRecords]
  );

  // Check if we have data
  const hasData = pieData.some(d => d.value > 0) || barData.length > 0 || lineData.length > 0;

  if (!hasData) {
    return (
      <div className="text-center py-12">
        <Activity className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
        <p className="text-muted-foreground">No data available for visualization</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Pie: Present vs Absent */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-indigo-100 rounded-lg">
            <Activity className="h-5 w-5 text-indigo-600" />
          </div>
          <h3 className="font-bold text-slate-900 text-lg">Distribution</h3>
        </div>
        <div style={{ width: '100%', height: '300px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie 
                data={pieData.filter(d => d.value > 0)} 
                dataKey="value" 
                nameKey="name" 
                cx="50%" 
                cy="50%" 
                outerRadius={80} 
                innerRadius={40}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {pieData.filter(d => d.value > 0).map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.name === 'Present' ? COLORS.present : COLORS.absent}
                    stroke="#ffffff"
                    strokeWidth={2}
                  />
                ))}
              </Pie>
              <ReTooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bar: Classes by Course */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-purple-100 rounded-lg">
            <BarChart3 className="h-5 w-5 text-purple-600" />
          </div>
          <h3 className="font-bold text-slate-900 text-lg">By Course</h3>
        </div>
        <div style={{ width: '100%', height: '300px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} margin={{ top: 10, right: 10, left: 0, bottom: 70 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="course" 
                angle={-25} 
                textAnchor="end" 
                height={80}
                tick={{ fill: '#374151', fontSize: 11 }}
              />
              <YAxis 
                allowDecimals={false}
                tick={{ fill: '#6b7280', fontSize: 12 }}
              />
              <ReTooltip />
              <Bar 
                dataKey="classes" 
                name="Classes" 
                fill={COLORS.primary}
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Line: Classes over Time */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-emerald-100 rounded-lg">
            <TrendingUp className="h-5 w-5 text-emerald-600" />
          </div>
          <h3 className="font-bold text-slate-900 text-lg">Timeline</h3>
        </div>
        <div style={{ width: '100%', height: '300px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={lineData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="date"
                tick={{ fill: '#374151', fontSize: 11 }}
              />
              <YAxis 
                allowDecimals={false}
                tick={{ fill: '#6b7280', fontSize: 12 }}
              />
              <ReTooltip />
              <Line 
                type="monotone" 
                dataKey="classes" 
                name="Classes" 
                stroke={COLORS.chart}
                strokeWidth={3}
                dot={{ fill: COLORS.chart, r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default AttendanceCharts;


