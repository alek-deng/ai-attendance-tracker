// Enhanced Charts Component with more visualizations
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
  AreaChart,
  Area,
  RadialBarChart,
  RadialBar,
} from 'recharts';
import { Activity, BarChart3, TrendingUp, Users, Calendar, BookOpen } from 'lucide-react';

const COLORS = {
  present: '#6b8e5a',
  absent: '#d8534e',
  primary: '#8b5cf6',
  secondary: '#ec4899',
  chart: '#7ba068',
  blue: '#3b82f6',
  purple: '#8b5cf6',
  pink: '#ec4899',
  emerald: '#10b981',
  amber: '#f59e0b',
};

// Enhanced Student Charts
export const StudentEnhancedCharts = ({ attendanceRecords, stats, enrolledCourses }) => {
  // Attendance by Day of Week
  const dayOfWeekData = useMemo(() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const dayMap = new Map(days.map(d => [d, { present: 0, absent: 0 }]));
    
    attendanceRecords?.forEach(record => {
      if (!record.date) return;
      const date = new Date(record.date);
      const dayName = days[date.getDay() === 0 ? 6 : date.getDay() - 1];
      const status = record.status?.toLowerCase();
      if (dayMap.has(dayName)) {
        if (status === 'present') dayMap.get(dayName).present++;
        else if (status === 'absent') dayMap.get(dayName).absent++;
      }
    });
    
    return days.map(day => ({
      day,
      present: dayMap.get(day)?.present || 0,
      absent: dayMap.get(day)?.absent || 0,
    }));
  }, [attendanceRecords]);

  // Attendance Trend (Last 30 days)
  const trendData = useMemo(() => {
    const trend = new Map();
    const today = new Date();
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateKey = date.toISOString().split('T')[0];
      trend.set(dateKey, { date: dateKey, present: 0, absent: 0 });
    }
    
    attendanceRecords?.forEach(record => {
      if (!record.date) return;
      const dateKey = record.date.split('T')[0];
      if (trend.has(dateKey)) {
        const status = record.status?.toLowerCase();
        if (status === 'present') trend.get(dateKey).present++;
        else if (status === 'absent') trend.get(dateKey).absent++;
      }
    });
    
    return Array.from(trend.values());
  }, [attendanceRecords]);

  // Course Performance
  const coursePerformance = useMemo(() => {
    const courseMap = new Map();
    
    enrolledCourses?.forEach(course => {
      courseMap.set(course.course_name || course.course_code, {
        course: course.course_name || course.course_code,
        present: 0,
        absent: 0,
        total: 0,
      });
    });
    
    attendanceRecords?.forEach(record => {
      const courseName = record.course_name || 'Unknown';
      if (courseMap.has(courseName)) {
        const course = courseMap.get(courseName);
        course.total++;
        const status = record.status?.toLowerCase();
        if (status === 'present') course.present++;
        else if (status === 'absent') course.absent++;
      }
    });
    
    return Array.from(courseMap.values())
      .map(c => ({
        ...c,
        rate: c.total > 0 ? (c.present / c.total * 100) : 0,
      }))
      .sort((a, b) => b.rate - a.rate);
  }, [attendanceRecords, enrolledCourses]);

  const hasData = attendanceRecords?.length > 0;

  if (!hasData) {
    return (
      <div className="text-center py-12">
        <Activity className="h-12 w-12 text-slate-300 mx-auto mb-4" />
        <p className="text-slate-500">No attendance data available</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Attendance Trend */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-100 rounded-lg">
            <TrendingUp className="h-5 w-5 text-blue-600" />
          </div>
          <h3 className="font-bold text-slate-900 text-lg">30-Day Trend</h3>
        </div>
        <div style={{ width: '100%', height: '300px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="date" 
                tick={{ fill: '#374151', fontSize: 10 }}
                tickFormatter={(value) => new Date(value).getDate().toString()}
              />
              <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} />
              <ReTooltip 
                labelFormatter={(value) => new Date(value).toLocaleDateString()}
              />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="present" 
                stackId="1" 
                stroke={COLORS.present} 
                fill={COLORS.present}
                fillOpacity={0.6}
                name="Present"
              />
              <Area 
                type="monotone" 
                dataKey="absent" 
                stackId="1" 
                stroke={COLORS.absent} 
                fill={COLORS.absent}
                fillOpacity={0.6}
                name="Absent"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Day of Week Performance */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Calendar className="h-5 w-5 text-purple-600" />
          </div>
          <h3 className="font-bold text-slate-900 text-lg">Day of Week</h3>
        </div>
        <div style={{ width: '100%', height: '300px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dayOfWeekData} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="day" tick={{ fill: '#374151', fontSize: 11 }} />
              <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} />
              <ReTooltip />
              <Legend />
              <Bar dataKey="present" fill={COLORS.present} name="Present" radius={[8, 8, 0, 0]} />
              <Bar dataKey="absent" fill={COLORS.absent} name="Absent" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Course Performance */}
      {coursePerformance.length > 0 && (
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm lg:col-span-2">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <BarChart3 className="h-5 w-5 text-emerald-600" />
            </div>
            <h3 className="font-bold text-slate-900 text-lg">Course Performance</h3>
          </div>
          <div style={{ width: '100%', height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={coursePerformance} margin={{ top: 10, right: 10, left: 0, bottom: 70 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="course" 
                  angle={-25} 
                  textAnchor="end" 
                  height={80}
                  tick={{ fill: '#374151', fontSize: 11 }}
                />
                <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} />
                <ReTooltip />
                <Legend />
                <Bar dataKey="present" fill={COLORS.present} name="Present" radius={[8, 8, 0, 0]} />
                <Bar dataKey="absent" fill={COLORS.absent} name="Absent" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};

// Enhanced Admin Charts
export const AdminEnhancedCharts = ({ dashboardData }) => {
  // Faculty Distribution
  const facultyData = useMemo(() => {
    return dashboardData?.faculty_stats?.map(fac => ({
      name: fac.faculty_name,
      students: fac.students_count,
      lecturers: fac.lecturers_count,
      courses: fac.courses_count,
    })) || [];
  }, [dashboardData]);

  // Attendance Over Time (Weekly)
  const weeklyData = useMemo(() => {
    const records = dashboardData?.recent_records || [];
    const weeklyMap = new Map();
    
    records.forEach(record => {
      if (!record.date) return;
      const date = new Date(record.date);
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      const weekKey = weekStart.toISOString().split('T')[0];
      
      if (!weeklyMap.has(weekKey)) {
        weeklyMap.set(weekKey, { week: weekKey, present: 0, absent: 0 });
      }
      
      const status = record.status?.toLowerCase();
      if (status === 'present') weeklyMap.get(weekKey).present++;
      else if (status === 'absent') weeklyMap.get(weekKey).absent++;
    });
    
    return Array.from(weeklyMap.values())
      .sort((a, b) => a.week.localeCompare(b.week))
      .slice(-8)
      .map(w => ({
        ...w,
        week: new Date(w.week).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      }));
  }, [dashboardData]);

  // Top Courses Performance
  const topCoursesData = useMemo(() => {
    return dashboardData?.top_courses?.map(course => ({
      name: course.course_code,
      rate: course.attendance_rate,
      records: course.total_records,
    })) || [];
  }, [dashboardData]);

  const hasData = dashboardData && (
    facultyData.length > 0 || 
    weeklyData.length > 0 || 
    topCoursesData.length > 0
  );

  if (!hasData) {
    return (
      <div className="text-center py-12">
        <BarChart3 className="h-12 w-12 text-slate-300 mx-auto mb-4" />
        <p className="text-slate-500">No system data available</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Faculty Distribution */}
      {facultyData.length > 0 && (
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Users className="h-5 w-5 text-purple-600" />
            </div>
            <h3 className="font-bold text-slate-900 text-lg">Faculty Distribution</h3>
          </div>
          <div style={{ width: '100%', height: '350px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={facultyData} margin={{ top: 10, right: 10, left: 0, bottom: 80 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="name" 
                  angle={-25} 
                  textAnchor="end" 
                  height={100}
                  tick={{ fill: '#374151', fontSize: 10 }}
                />
                <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} />
                <ReTooltip />
                <Legend />
                <Bar dataKey="students" fill={COLORS.blue} name="Students" radius={[8, 8, 0, 0]} />
                <Bar dataKey="lecturers" fill={COLORS.purple} name="Lecturers" radius={[8, 8, 0, 0]} />
                <Bar dataKey="courses" fill={COLORS.emerald} name="Courses" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Weekly Attendance Trend */}
      {weeklyData.length > 0 && (
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <TrendingUp className="h-5 w-5 text-blue-600" />
            </div>
            <h3 className="font-bold text-slate-900 text-lg">Weekly Trend</h3>
          </div>
          <div style={{ width: '100%', height: '350px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="week" 
                  tick={{ fill: '#374151', fontSize: 10 }}
                />
                <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} />
                <ReTooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="present" 
                  stroke={COLORS.present} 
                  strokeWidth={3}
                  dot={{ fill: COLORS.present, r: 4 }}
                  name="Present"
                />
                <Line 
                  type="monotone" 
                  dataKey="absent" 
                  stroke={COLORS.absent} 
                  strokeWidth={3}
                  dot={{ fill: COLORS.absent, r: 4 }}
                  name="Absent"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Top Courses Performance */}
      {topCoursesData.length > 0 && (
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm lg:col-span-2">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <BarChart3 className="h-5 w-5 text-indigo-600" />
            </div>
            <h3 className="font-bold text-slate-900 text-lg">Top Courses Performance</h3>
          </div>
          <div style={{ width: '100%', height: '350px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topCoursesData} margin={{ top: 10, right: 10, left: 0, bottom: 30 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fill: '#374151', fontSize: 11 }}
                />
                <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} />
                <ReTooltip />
                <Legend />
                <Bar dataKey="rate" fill={COLORS.primary} name="Attendance Rate %" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};

