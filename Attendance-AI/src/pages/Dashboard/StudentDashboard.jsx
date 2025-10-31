// src/pages/Dashboard/StudentDashboard.jsx
import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar, CheckCircle, XCircle, TrendingUp, BarChart3, Activity, Target, Award, Zap, Clock, BookOpen, GraduationCap, Search, Filter, Download, RefreshCw, ArrowUpDown, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import PowerBIEmbed from '@/components/PowerBIEmbed';
import PowerBISecureEmbed from '@/components/PowerBISecureEmbed';
import AttendanceCharts from '@/components/AttendanceCharts';
import { StudentEnhancedCharts } from '@/components/EnhancedCharts';
import DashboardHeader from '@/components/DashboardHeader';
import Footer from '@/components/Footer';

const StudentDashboard = () => {
  const [attendanceData, setAttendanceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [courseFilter, setCourseFilter] = useState('all');
  const [timeFilter, setTimeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date-desc');
  const [attendanceGoal, setAttendanceGoal] = useState(() => {
    const saved = localStorage.getItem('attendanceGoal');
    return saved ? parseFloat(saved) : 85;
  });
  const { toast } = useToast();
  const powerBiUrl = import.meta.env.VITE_POWERBI_EMBED_URL;
  const powerBiSecure = import.meta.env.VITE_POWERBI_SECURE_EMBED === 'true';

  useEffect(() => {
    fetchAttendanceData();
  }, []);

  const fetchAttendanceData = async (showToast = false) => {
    try {
      setRefreshing(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/student/attendance-summary', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch attendance data');
      }

      const data = await response.json();
      setAttendanceData(data);
      
      // Store student name in localStorage for header
      if (data.student_name) {
        localStorage.setItem('studentName', data.student_name);
      }
      if (data.email) {
        localStorage.setItem('email', data.email);
      }

      if (showToast) {
        toast({
          title: 'Success',
          description: 'Attendance data refreshed successfully',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Filter and sort attendance records
  const filteredRecords = useMemo(() => {
    if (!attendanceData?.attendance_records) return [];

    let filtered = [...attendanceData.attendance_records];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(record =>
        record.course_name?.toLowerCase().includes(query) ||
        record.status?.toLowerCase().includes(query) ||
        new Date(record.date).toLocaleDateString().toLowerCase().includes(query)
      );
    }

    // Course filter
    if (courseFilter !== 'all') {
      filtered = filtered.filter(record => record.course_name === courseFilter);
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(record => record.status?.toLowerCase() === statusFilter.toLowerCase());
    }

    // Time filter
    if (timeFilter !== 'all') {
      const now = new Date();
      filtered = filtered.filter(record => {
        const recordDate = new Date(record.date);
        if (timeFilter === 'week') {
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          return recordDate >= weekAgo;
        } else if (timeFilter === 'month') {
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          return recordDate >= monthAgo;
        } else if (timeFilter === 'semester') {
          const semesterAgo = new Date(now.getTime() - 120 * 24 * 60 * 60 * 1000);
          return recordDate >= semesterAgo;
        }
        return true;
      });
    }

    // Sort
    filtered.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      
      if (sortBy === 'date-desc') return dateB - dateA;
      if (sortBy === 'date-asc') return dateA - dateB;
      if (sortBy === 'course-asc') return (a.course_name || '').localeCompare(b.course_name || '');
      if (sortBy === 'course-desc') return (b.course_name || '').localeCompare(a.course_name || '');
      if (sortBy === 'status-asc') return (a.status || '').localeCompare(b.status || '');
      if (sortBy === 'status-desc') return (b.status || '').localeCompare(a.status || '');
      
      return 0;
    });

    return filtered;
  }, [attendanceData?.attendance_records, searchQuery, courseFilter, statusFilter, timeFilter, sortBy]);

  // Get unique courses for filter
  const uniqueCourses = useMemo(() => {
    if (!attendanceData?.attendance_records) return [];
    return [...new Set(attendanceData.attendance_records.map(r => r.course_name).filter(Boolean))];
  }, [attendanceData?.attendance_records]);

  // Calculate stats from filtered records
  const filteredStats = useMemo(() => {
    const total = filteredRecords.length;
    const present = filteredRecords.filter(r => r.status?.toLowerCase() === 'present').length;
    const absent = filteredRecords.filter(r => r.status?.toLowerCase() === 'absent').length;
    const rate = total > 0 ? (present / total) * 100 : 0;
    return { total, present, absent, rate };
  }, [filteredRecords]);

  // Export to CSV
  const exportToCSV = () => {
    if (!filteredRecords.length) {
      toast({
        title: 'No Data',
        description: 'No records to export',
        variant: 'destructive',
      });
      return;
    }

    const headers = ['Date', 'Course', 'Time', 'Status'];
    const rows = filteredRecords.map(record => [
      new Date(record.date).toLocaleDateString(),
      record.course_name || '',
      record.time || 'N/A',
      record.status || ''
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `attendance_report_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: 'Success',
      description: 'Attendance report exported successfully',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-lg font-semibold text-slate-700">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Calculate attendance statistics (overall)
  const stats = attendanceData?.stats;
  const totalClasses = stats?.total_classes || attendanceData?.attendance_records?.length || 0;
  const presentCount = stats?.present_count || attendanceData?.attendance_records?.filter(record => 
    record.status?.toLowerCase() === 'present'
  ).length || 0;
  const absentCount = stats?.absent_count || attendanceData?.attendance_records?.filter(record => 
    record.status?.toLowerCase() === 'absent'
  ).length || 0;
  const attendanceRate = parseFloat(stats?.attendance_rate || (totalClasses > 0 ? ((presentCount / totalClasses) * 100).toFixed(1) : 0));

  // Performance calculation
  const getPerformanceBadge = (rate) => {
    if (rate >= 90) return { text: 'Excellent', color: 'from-emerald-500 to-teal-600', icon: Award, bg: 'bg-emerald-50', textColor: 'text-emerald-700' };
    if (rate >= 75) return { text: 'Good', color: 'from-blue-500 to-indigo-600', icon: Target, bg: 'bg-blue-50', textColor: 'text-blue-700' };
    if (rate >= 60) return { text: 'Fair', color: 'from-amber-500 to-orange-600', icon: TrendingUp, bg: 'bg-amber-50', textColor: 'text-amber-700' };
    return { text: 'Needs Work', color: 'from-rose-500 to-red-600', icon: Zap, bg: 'bg-rose-50', textColor: 'text-rose-700' };
  };

  const performance = getPerformanceBadge(attendanceRate);
  const PerformanceIcon = performance.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
      <DashboardHeader />
      
      {/* Header Section */}
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-slate-900 mb-2">
                Welcome back, {attendanceData?.student_name || 'Student'}
              </h1>
              <p className="text-slate-600">Track your attendance and academic progress</p>
            </div>
            <div className="hidden md:flex items-center gap-4 px-8 py-5 rounded-2xl border-4 shadow-xl" style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)', borderColor: '#2563eb', color: '#ffffff' }}>
              <div className="p-3 rounded-xl border-2" style={{ backgroundColor: 'rgba(255, 255, 255, 0.3)', borderColor: 'rgba(255, 255, 255, 0.5)' }}>
                <PerformanceIcon className="h-7 w-7" style={{ color: '#ffffff' }} />
              </div>
              <div>
                <div className="text-xs font-black uppercase tracking-wider mb-1" style={{ color: '#ffffff' }}>Performance Status</div>
                <div className="text-2xl font-black" style={{ color: '#ffffff', textShadow: '1px 1px 3px rgba(0,0,0,0.3)' }}>{performance.text}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Classes */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-xl">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="text-3xl font-bold text-slate-900 mb-1">{totalClasses}</div>
            <div className="text-sm font-medium text-slate-500">Total Classes</div>
          </div>

          {/* Present */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-emerald-100 rounded-xl">
                <CheckCircle className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
            <div className="text-3xl font-bold text-emerald-600 mb-1">{presentCount}</div>
            <div className="text-sm font-medium text-slate-500">Present</div>
          </div>

          {/* Absent */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-rose-100 rounded-xl">
                <XCircle className="h-6 w-6 text-rose-600" />
              </div>
            </div>
            <div className="text-3xl font-bold text-rose-600 mb-1">{absentCount}</div>
            <div className="text-sm font-medium text-slate-500">Absent</div>
          </div>

          {/* Attendance Rate */}
          <div className="rounded-2xl p-6 shadow-xl border-4 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1" style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)', borderColor: '#2563eb', color: '#ffffff' }}>
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl" style={{ backgroundColor: 'rgba(255, 255, 255, 0.3)' }}>
                <TrendingUp className="h-7 w-7" style={{ color: '#ffffff' }} />
              </div>
            </div>
            <div className="text-5xl font-black mb-2" style={{ color: '#ffffff', textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}>{attendanceRate.toFixed(1)}%</div>
            <div className="text-base font-black uppercase tracking-wider" style={{ color: '#ffffff' }}>Attendance Rate</div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Attendance History */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
              <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-6 py-4 border-b border-slate-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-100 rounded-lg">
                      <Activity className="h-5 w-5 text-indigo-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-slate-900">Attendance History</h2>
                      <p className="text-sm text-slate-600">Your complete attendance timeline</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fetchAttendanceData(true)}
                      disabled={refreshing}
                    >
                      <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                      Refresh
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={exportToCSV}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </div>
                </div>

                {/* Filters and Search */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mt-4">
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      placeholder="Search..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  {/* Course Filter */}
                  <Select value={courseFilter} onValueChange={setCourseFilter}>
                    <SelectTrigger>
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Course" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Courses</SelectItem>
                      {uniqueCourses.map(course => (
                        <SelectItem key={course} value={course}>{course}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Status Filter */}
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="present">Present</SelectItem>
                      <SelectItem value="absent">Absent</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Time Filter */}
                  <Select value={timeFilter} onValueChange={setTimeFilter}>
                    <SelectTrigger>
                      <Calendar className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Time Period" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Time</SelectItem>
                      <SelectItem value="week">This Week</SelectItem>
                      <SelectItem value="month">This Month</SelectItem>
                      <SelectItem value="semester">This Semester</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Sort */}
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-slate-600">
                    Showing <span className="font-semibold text-slate-900">{filteredRecords.length}</span> of{' '}
                    <span className="font-semibold text-slate-900">{attendanceData?.attendance_records?.length || 0}</span> records
                  </div>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-48">
                      <ArrowUpDown className="h-4 w-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="date-desc">Newest First</SelectItem>
                      <SelectItem value="date-asc">Oldest First</SelectItem>
                      <SelectItem value="course-asc">Course A-Z</SelectItem>
                      <SelectItem value="course-desc">Course Z-A</SelectItem>
                      <SelectItem value="status-asc">Status A-Z</SelectItem>
                      <SelectItem value="status-desc">Status Z-A</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Course</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Time</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {filteredRecords.length > 0 ? (
                      filteredRecords.map((record, index) => (
                        <tr key={index} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="font-semibold text-slate-900">
                              {new Date(record.date).toLocaleDateString('en-US', { 
                                month: 'short', 
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="font-medium text-slate-900">{record.course_name}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-slate-600">
                              {record.time || <span className="text-slate-400 italic">N/A</span>}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                                record.status?.toLowerCase() === 'present'
                                  ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                                  : 'bg-rose-100 text-rose-700 border border-rose-200'
                              }`}
                            >
                              {record.status || 'Unknown'}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="px-6 py-16 text-center">
                          <Calendar className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                          <p className="text-slate-500 font-medium">No attendance records found</p>
                          {(searchQuery || courseFilter !== 'all' || statusFilter !== 'all' || timeFilter !== 'all') && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="mt-4"
                              onClick={() => {
                                setSearchQuery('');
                                setCourseFilter('all');
                                setStatusFilter('all');
                                setTimeFilter('all');
                              }}
                            >
                              Clear Filters
                            </Button>
                          )}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Quick Stats Sidebar */}
          <div className="space-y-6">
            {/* Performance Card */}
            <div className="rounded-2xl p-6 shadow-xl border-4" style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)', borderColor: '#2563eb', color: '#ffffff' }}>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-xl" style={{ backgroundColor: 'rgba(255, 255, 255, 0.3)' }}>
                  <GraduationCap className="h-6 w-6" style={{ color: '#ffffff' }} />
                </div>
                <h3 className="text-xl font-black uppercase tracking-wide" style={{ color: '#ffffff' }}>Performance</h3>
              </div>
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-base font-black" style={{ color: '#ffffff' }}>Attendance Rate</span>
                  <span className="text-4xl font-black" style={{ color: '#ffffff', textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}>{attendanceRate.toFixed(1)}%</span>
                </div>
                <div className="w-full rounded-full h-6 overflow-hidden border-2 mb-4" style={{ backgroundColor: 'rgba(255, 255, 255, 0.3)', borderColor: 'rgba(255, 255, 255, 0.5)' }}>
                  <div 
                    className="rounded-full transition-all duration-1000 shadow-lg"
                    style={{ width: `${attendanceRate}%`, height: '100%', backgroundColor: '#ffffff' }}
                  ></div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl border-2" style={{ backgroundColor: 'rgba(255, 255, 255, 0.3)', borderColor: 'rgba(255, 255, 255, 0.5)' }}>
                  <PerformanceIcon className="h-6 w-6" style={{ color: '#ffffff' }} />
                  <span className="text-base font-black uppercase" style={{ color: '#ffffff' }}>{performance.text}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-4 border-t-2" style={{ borderColor: 'rgba(255, 255, 255, 0.4)' }}>
                <div className="text-center p-4 rounded-xl border-2" style={{ backgroundColor: 'rgba(255, 255, 255, 0.3)', borderColor: 'rgba(255, 255, 255, 0.5)' }}>
                  <div className="text-4xl font-black mb-1" style={{ color: '#ffffff', textShadow: '1px 1px 3px rgba(0,0,0,0.3)' }}>{presentCount}</div>
                  <div className="text-xs font-black uppercase tracking-wider" style={{ color: '#ffffff' }}>Present</div>
                </div>
                <div className="text-center p-4 rounded-xl border-2" style={{ backgroundColor: 'rgba(255, 255, 255, 0.3)', borderColor: 'rgba(255, 255, 255, 0.5)' }}>
                  <div className="text-4xl font-black mb-1" style={{ color: '#ffffff', textShadow: '1px 1px 3px rgba(0,0,0,0.3)' }}>{absentCount}</div>
                  <div className="text-xs font-black uppercase tracking-wider" style={{ color: '#ffffff' }}>Absent</div>
                </div>
              </div>
            </div>

            {/* Attendance Goal Card */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-lg">
                    <Target className="h-5 w-5 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">Attendance Goal</h3>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-600">Target</span>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={attendanceGoal}
                      onChange={(e) => {
                        const value = Math.max(0, Math.min(100, parseFloat(e.target.value) || 0));
                        setAttendanceGoal(value);
                        localStorage.setItem('attendanceGoal', value.toString());
                      }}
                      className="w-20 h-8 text-center"
                    />
                    <span className="text-sm font-medium text-slate-600">%</span>
                  </div>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-3 mb-2">
                  <div
                    className={`h-3 rounded-full transition-all duration-1000 ${
                      attendanceRate >= attendanceGoal
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-500'
                        : attendanceRate >= attendanceGoal * 0.9
                        ? 'bg-gradient-to-r from-amber-500 to-orange-500'
                        : 'bg-gradient-to-r from-rose-500 to-red-500'
                    }`}
                    style={{ width: `${Math.min(100, (attendanceRate / attendanceGoal) * 100)}%` }}
                  ></div>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600">Current: {attendanceRate.toFixed(1)}%</span>
                  <span className={`font-semibold ${
                    attendanceRate >= attendanceGoal
                      ? 'text-emerald-600'
                      : attendanceRate >= attendanceGoal * 0.9
                      ? 'text-amber-600'
                      : 'text-rose-600'
                  }`}>
                    {attendanceRate >= attendanceGoal
                      ? `✓ Goal Achieved!`
                      : `Need ${(attendanceGoal - attendanceRate).toFixed(1)}% more`
                    }
                  </span>
                </div>
                {attendanceRate < attendanceGoal && (
                  <div className="pt-3 border-t border-slate-200">
                    <div className="text-xs text-slate-600">
                      <div className="font-semibold mb-1">To reach your goal:</div>
                      <div>You need {Math.ceil((attendanceGoal - attendanceRate) * totalClasses / 100)} more present days</div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Summary Card */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <FileText className="h-5 w-5 text-amber-600" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Summary</h3>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <span className="text-sm font-medium text-slate-600">Total Sessions</span>
                  <span className="text-lg font-bold text-slate-900">{totalClasses}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <span className="text-sm font-medium text-slate-600">Success Rate</span>
                  <span className="text-lg font-bold text-emerald-600">{attendanceRate.toFixed(1)}%</span>
                </div>
                {(searchQuery || courseFilter !== 'all' || statusFilter !== 'all' || timeFilter !== 'all') && (
                  <div className="pt-4 border-t border-slate-200">
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <div className="text-xs font-semibold text-blue-900 mb-2">Filtered Results</div>
                      <div className="space-y-1 text-xs text-blue-700">
                        <div>Showing: {filteredStats.total} records</div>
                        <div>Present: {filteredStats.present} | Absent: {filteredStats.absent}</div>
                        <div>Rate: {filteredStats.rate.toFixed(1)}%</div>
                      </div>
                    </div>
                  </div>
                )}
                <div className="pt-4 border-t border-slate-200">
                  <div className="flex items-center gap-3">
                    <PerformanceIcon className={`h-5 w-5 ${performance.textColor}`} />
                    <div>
                      <div className="text-xs font-medium text-slate-500">Current Status</div>
                      <div className={`text-base font-bold ${performance.textColor}`}>{performance.text}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Analytics Section */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 mb-8">
          <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-6 py-4 border-b border-slate-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <BarChart3 className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">Visual Analytics</h2>
                <p className="text-sm text-slate-600">Interactive charts and insights from your data</p>
              </div>
            </div>
          </div>
          <div className="p-6">
            <StudentEnhancedCharts 
              attendanceRecords={filteredRecords} 
              stats={attendanceData?.stats}
              enrolledCourses={attendanceData?.enrolled_courses}
            />
          </div>
        </div>

        {/* Power BI Section */}
        {(powerBiUrl || powerBiSecure) && (
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 mb-8">
            <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-6 py-4 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Advanced Analytics</h2>
                  <p className="text-sm text-slate-600">Power BI insights and detailed reports</p>
                </div>
              </div>
            </div>
            <div className="p-6">
              {powerBiSecure ? (
                <PowerBISecureEmbed />
              ) : (
                <PowerBIEmbed embedUrl={powerBiUrl} />
              )}
            </div>
          </div>
        )}
      </div>
      
      <Footer />
    </div>
  );
};

export default StudentDashboard;
