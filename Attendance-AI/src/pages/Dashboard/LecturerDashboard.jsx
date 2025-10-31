// src/pages/Dashboard/LecturerDashboard.jsx
import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
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
import { Calendar, CheckCircle, XCircle, TrendingUp, BarChart3, Activity, BookOpen, Users, GraduationCap, Search, Filter, Download, RefreshCw, ArrowUpDown, FileText, Award, AlertTriangle, UserCheck, UserX, Edit, Trash2, Clock, ArrowLeft, Camera } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import DashboardHeader from '@/components/DashboardHeader';
import Footer from '@/components/Footer';
import AttendanceCharts from '@/components/AttendanceCharts';

const LecturerDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  console.log('[LecturerDashboard] Component initialized, loading:', loading);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [courseFilter, setCourseFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date-desc');
  const [lowAttendanceStudents, setLowAttendanceStudents] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [courseStudents, setCourseStudents] = useState(null);
  const [showTodayAttendance, setShowTodayAttendance] = useState(false);
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [markingAttendance, setMarkingAttendance] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchDashboardData();
    fetchLowAttendanceStudents();
  }, []);

  // Close modals on ESC key press
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        if (showTodayAttendance) {
          setShowTodayAttendance(false);
          setTodayAttendance(null);
        }
        if (courseStudents) {
          setCourseStudents(null);
          setSelectedCourse(null);
        }
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [showTodayAttendance, courseStudents]);

  // Fetch low attendance students
  const fetchLowAttendanceStudents = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/lecturer/low-attendance?threshold=70', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setLowAttendanceStudents(data.students || []);
      }
    } catch (error) {
      console.error('Failed to fetch low attendance students:', error);
    }
  };

  // Fetch students for a course
  const fetchCourseStudents = async (courseId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/lecturer/course/${courseId}/students`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setCourseStudents(data);
        setSelectedCourse(courseId);
      } else {
        throw new Error('Failed to fetch course students');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  // Fetch today's attendance for a course
  const fetchTodayAttendance = async (courseId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/lecturer/course/${courseId}/today-attendance`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setTodayAttendance(data);
        setShowTodayAttendance(true);
      } else {
        throw new Error('Failed to fetch today\'s attendance');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  // Mark attendance manually
  const markAttendance = async (studentId, courseId, status) => {
    try {
      setMarkingAttendance(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/lecturer/mark-attendance', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          student_id: studentId,
          course_id: courseId,
          status: status,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to mark attendance');
      }

      toast({
        title: 'Success',
        description: 'Attendance marked successfully',
      });

      // Refresh data
      fetchDashboardData();
      if (todayAttendance && todayAttendance.course_id === courseId) {
        fetchTodayAttendance(courseId);
      }
      if (courseStudents && courseStudents.course_id === courseId) {
        fetchCourseStudents(courseId);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setMarkingAttendance(false);
    }
  };

  const fetchDashboardData = async (showToast = false) => {
    try {
      setRefreshing(true);
      setLoading(true); // Ensure loading is set
      const token = localStorage.getItem('token');
      console.log('[LecturerDashboard] Fetching dashboard data...');
      console.log('[LecturerDashboard] Token exists:', !!token);
      
      const response = await fetch('http://localhost:8000/lecturer/dashboard-summary', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      console.log('[LecturerDashboard] Response status:', response.status);
      console.log('[LecturerDashboard] Response ok:', response.ok);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
        console.error('[LecturerDashboard] API Error:', errorData);
        
        if (response.status === 401) {
          localStorage.clear();
          window.location.href = '/login';
          return;
        }
        
        throw new Error(errorData.detail || `Failed to fetch dashboard data (${response.status})`);
      }

      const data = await response.json();
      console.log('[LecturerDashboard] Data received:', JSON.stringify(data, null, 2));
      console.log('[LecturerDashboard] Data keys:', Object.keys(data || {}));
      console.log('[LecturerDashboard] Total courses:', data?.total_courses);
      console.log('[LecturerDashboard] Course stats length:', data?.course_stats?.length);
      console.log('[LecturerDashboard] Recent records length:', data?.recent_records?.length);
      console.log('[LecturerDashboard] Overall stats:', data?.overall_stats);
      
      console.log('[LecturerDashboard] Setting dashboard data...');
      setDashboardData(data);
      console.log('[LecturerDashboard] Dashboard data set, setting loading to false');
      
      // Store lecturer name in localStorage for header
      if (data.lecturer_name) {
        localStorage.setItem('lecturerName', data.lecturer_name);
      }
      if (data.email) {
        localStorage.setItem('email', data.email);
      }

      if (showToast) {
        toast({
          title: 'Success',
          description: 'Dashboard data refreshed successfully',
        });
      }
    } catch (error) {
      console.error('[LecturerDashboard] Fetch error:', error);
      console.error('[LecturerDashboard] Error stack:', error.stack);
      toast({
        title: 'Error',
        description: error.message || 'Failed to load dashboard data',
        variant: 'destructive',
      });
      setDashboardData(null); // Set to null on error so empty state shows
    } finally {
      console.log('[LecturerDashboard] Finally block - setting loading and refreshing to false');
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Filter and sort recent records
  const filteredRecords = useMemo(() => {
    if (!dashboardData?.recent_records) return [];

    let filtered = [...dashboardData.recent_records];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(record =>
        record.course_name?.toLowerCase().includes(query) ||
        record.student_name?.toLowerCase().includes(query) ||
        record.reg_number?.toLowerCase().includes(query) ||
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

    // Sort
    filtered.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      
      if (sortBy === 'date-desc') return dateB - dateA;
      if (sortBy === 'date-asc') return dateA - dateB;
      if (sortBy === 'course-asc') return (a.course_name || '').localeCompare(b.course_name || '');
      if (sortBy === 'course-desc') return (b.course_name || '').localeCompare(a.course_name || '');
      if (sortBy === 'student-asc') return (a.student_name || '').localeCompare(b.student_name || '');
      if (sortBy === 'student-desc') return (b.student_name || '').localeCompare(a.student_name || '');
      
      return 0;
    });

    return filtered;
  }, [dashboardData?.recent_records, searchQuery, courseFilter, statusFilter, sortBy]);

  // Get unique courses for filter
  const uniqueCourses = useMemo(() => {
    if (!dashboardData?.recent_records) return [];
    return [...new Set(dashboardData.recent_records.map(r => r.course_name).filter(Boolean))];
  }, [dashboardData?.recent_records]);

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

    const headers = ['Date', 'Time', 'Course', 'Student', 'Registration Number', 'Status'];
    const rows = filteredRecords.map(record => [
      new Date(record.date).toLocaleDateString(),
      record.time || 'N/A',
      record.course_name || '',
      record.student_name || '',
      record.reg_number || '',
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

  console.log('[LecturerDashboard] Component render state:', {
    loading,
    hasDashboardData: !!dashboardData,
    dashboardDataKeys: dashboardData ? Object.keys(dashboardData) : []
  });

  if (loading) {
    console.log('[LecturerDashboard] Still loading...');
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

  if (!dashboardData) {
    console.log('[LecturerDashboard] No dashboard data - showing empty state');
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
        <DashboardHeader />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <p className="text-lg font-semibold text-slate-700 mb-2">No Dashboard Data</p>
            <p className="text-slate-500 mb-4">Unable to load dashboard data. Please try refreshing.</p>
            <Button onClick={() => fetchDashboardData(true)}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const overallStats = dashboardData?.overall_stats || {};
  const totalRecords = overallStats.total_records || 0;
  const presentCount = overallStats.present_count || 0;
  const absentCount = overallStats.absent_count || 0;
  const attendanceRate = overallStats.attendance_rate || 0;
  const totalCourses = dashboardData?.total_courses || 0;
  const totalStudents = dashboardData?.total_students || 0;

  // Performance calculation
  const getPerformanceBadge = (rate) => {
    if (rate >= 90) return { text: 'Excellent', icon: Award, bg: 'bg-emerald-50', textColor: 'text-emerald-700' };
    if (rate >= 75) return { text: 'Good', icon: TrendingUp, bg: 'bg-blue-50', textColor: 'text-blue-700' };
    if (rate >= 60) return { text: 'Fair', icon: Activity, bg: 'bg-amber-50', textColor: 'text-amber-700' };
    return { text: 'Needs Work', icon: XCircle, bg: 'bg-rose-50', textColor: 'text-rose-700' };
  };

  const performance = getPerformanceBadge(attendanceRate);
  const PerformanceIcon = performance.icon;

  console.log('[LecturerDashboard] Rendering with data:', {
    hasData: !!dashboardData,
    totalCourses,
    totalRecords,
    totalStudents,
    courseStatsLength: dashboardData?.course_stats?.length || 0,
    recentRecordsLength: dashboardData?.recent_records?.length || 0
  });

  // FORCE RENDER TEST - Remove this debug code after fixing
  console.log('[LecturerDashboard] RENDER TRIGGERED - about to return JSX');
  console.log('[LecturerDashboard] Current state:', {
    loading,
    hasData: !!dashboardData,
    lecturerName: dashboardData?.lecturer_name,
    totalCourses: dashboardData?.total_courses
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
      <DashboardHeader />
      
      {/* Header Section */}
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-slate-900 mb-2">
                Welcome, {dashboardData?.lecturer_name || 'Lecturer'}
              </h1>
              <p className="text-slate-600">Manage your courses and track student attendance</p>
              {dashboardData?.department && (
                <p className="text-sm text-slate-500 mt-1">Department: {dashboardData.department}</p>
              )}
            </div>
            <div className="flex items-center gap-4">
              <Link to="/attendance-capture" className="flex items-center">
                <Button 
                  size="lg" 
                  className="rounded-full w-14 h-14 p-0 hover:scale-110 transition-all shadow-lg hover:shadow-xl flex items-center justify-center" 
                  style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}
                  title="Mark Attendance using AI Facial Recognition"
                >
                  <Camera className="h-6 w-6 text-white" />
                </Button>
              </Link>
              <div className="px-8 py-5 rounded-2xl border-4 shadow-xl" style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)', borderColor: '#2563eb', color: '#ffffff' }}>
                <div className="p-3 rounded-xl border-2" style={{ backgroundColor: 'rgba(255, 255, 255, 0.3)', borderColor: 'rgba(255, 255, 255, 0.5)' }}>
                  <PerformanceIcon className="h-7 w-7" style={{ color: '#ffffff' }} />
                </div>
                <div>
                  <div className="text-xs font-black uppercase tracking-wider mb-1" style={{ color: '#ffffff' }}>Overall Performance</div>
                  <div className="text-2xl font-black" style={{ color: '#ffffff', textShadow: '1px 1px 3px rgba(0,0,0,0.3)' }}>{performance.text}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          {/* Total Records */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-xl">
                <Activity className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="text-3xl font-bold text-slate-900 mb-1">{totalRecords}</div>
            <div className="text-sm font-medium text-slate-500">Total Records</div>
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

          {/* Courses */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-100 rounded-xl">
                <BookOpen className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <div className="text-3xl font-bold text-slate-900 mb-1">{totalCourses}</div>
            <div className="text-sm font-medium text-slate-500">Courses</div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Recent Records Table */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
              <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-6 py-4 border-b border-slate-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-100 rounded-lg">
                      <Activity className="h-5 w-5 text-indigo-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-slate-900">Recent Attendance Records</h2>
                      <p className="text-sm text-slate-600">Latest attendance across all your courses</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fetchDashboardData(true)}
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      placeholder="Search students, courses..."
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
                </div>

                {/* Sort */}
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-slate-600">
                    Showing <span className="font-semibold text-slate-900">{filteredRecords.length}</span> of{' '}
                    <span className="font-semibold text-slate-900">{dashboardData?.recent_records?.length || 0}</span> records
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
                      <SelectItem value="student-asc">Student A-Z</SelectItem>
                      <SelectItem value="student-desc">Student Z-A</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Time</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Course</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Student</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {filteredRecords.length > 0 ? (
                      filteredRecords.map((record, index) => (
                        <tr key={index} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="font-semibold text-slate-900">
                              {record.date ? new Date(record.date).toLocaleDateString('en-US', { 
                                month: 'short', 
                                day: 'numeric',
                                year: 'numeric'
                              }) : 'N/A'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-slate-600">{record.time || <span className="text-slate-400 italic">N/A</span>}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="font-medium text-slate-900">{record.course_name || 'N/A'}</div>
                            <div className="text-xs text-slate-500">{record.course_code || ''}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="font-medium text-slate-900">{record.student_name || 'N/A'}</div>
                            <div className="text-xs text-slate-500">{record.reg_number || ''}</div>
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
                        <td colSpan="5" className="px-6 py-16 text-center">
                          <Calendar className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                          <p className="text-slate-500 font-medium">No attendance records found</p>
                          {(searchQuery || courseFilter !== 'all' || statusFilter !== 'all') && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="mt-4"
                              onClick={() => {
                                setSearchQuery('');
                                setCourseFilter('all');
                                setStatusFilter('all');
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

          {/* Sidebar */}
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
                  <span className="text-sm font-medium text-slate-600">Total Courses</span>
                  <span className="text-lg font-bold text-slate-900">{totalCourses}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <span className="text-sm font-medium text-slate-600">Total Students</span>
                  <span className="text-lg font-bold text-slate-900">{totalStudents}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <span className="text-sm font-medium text-slate-600">Attendance Rate</span>
                  <span className="text-lg font-bold text-emerald-600">{attendanceRate.toFixed(1)}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Courses Stats Section */}
        {dashboardData?.course_stats && dashboardData.course_stats.length > 0 ? (
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 mb-8">
            <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-6 py-4 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <BookOpen className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Course Statistics</h2>
                  <p className="text-sm text-slate-600">Attendance breakdown by course</p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {dashboardData.course_stats.map((course) => (
                  <Card key={course.course_id} className="border border-slate-200 hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg">{course.course_name}</CardTitle>
                          <CardDescription>{course.course_code}</CardDescription>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => fetchTodayAttendance(course.course_id)}
                            className="text-xs"
                            title="Mark today's attendance"
                          >
                            <Clock className="h-3 w-3 mr-1" />
                            Today
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => fetchCourseStudents(course.course_id)}
                            className="text-xs"
                            title="View all students"
                          >
                            <Users className="h-3 w-3 mr-1" />
                            Students
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-600">Attendance Rate</span>
                          <span className="text-xl font-bold text-slate-900">{course.attendance_rate}%</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all ${
                              course.attendance_rate >= 90
                                ? 'bg-emerald-500'
                                : course.attendance_rate >= 75
                                ? 'bg-blue-500'
                                : course.attendance_rate >= 60
                                ? 'bg-amber-500'
                                : 'bg-rose-500'
                            }`}
                            style={{ width: `${course.attendance_rate}%` }}
                          ></div>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-center pt-2 border-t border-slate-200">
                          <div>
                            <div className="text-lg font-bold text-slate-900">{course.total_records}</div>
                            <div className="text-xs text-slate-600">Records</div>
                          </div>
                          <div>
                            <div className="text-lg font-bold text-emerald-600">{course.present_count}</div>
                            <div className="text-xs text-slate-600">Present</div>
                          </div>
                          <div>
                            <div className="text-lg font-bold text-rose-600">{course.absent_count}</div>
                            <div className="text-xs text-slate-600">Absent</div>
                          </div>
                        </div>
                        <div className="pt-2 border-t border-slate-200">
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <Users className="h-4 w-4" />
                            <span>{course.enrolled_students} students enrolled</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        ) : dashboardData?.total_courses === 0 ? (
          <Card className="mb-8">
            <CardContent className="py-12 text-center">
              <BookOpen className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">No Courses Assigned</h3>
              <p className="text-slate-500 mb-4">You don't have any courses assigned yet. Contact your administrator to get courses assigned.</p>
            </CardContent>
          </Card>
        ) : null}

        {/* Low Attendance Alerts Section */}
        {lowAttendanceStudents.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg border border-amber-200 mb-8">
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 px-6 py-4 border-b border-amber-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-100 rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">Low Attendance Alert</h2>
                    <p className="text-sm text-slate-600">{lowAttendanceStudents.length} students below 70% attendance</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchLowAttendanceStudents}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </div>
            <div className="p-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Student</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Course</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Attendance Rate</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Records</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {lowAttendanceStudents.slice(0, 10).map((student, index) => (
                      <tr key={index} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="font-medium text-slate-900">{student.student_name}</div>
                          <div className="text-xs text-slate-500">{student.reg_number}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-medium text-slate-900">{student.course_name}</div>
                          <div className="text-xs text-slate-500">{student.course_code}</div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`font-bold ${
                            student.attendance_rate < 60 ? 'text-rose-600' :
                            student.attendance_rate < 70 ? 'text-amber-600' :
                            'text-blue-600'
                          }`}>
                            {student.attendance_rate}%
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-600">
                          {student.present_count}/{student.total_records}
                        </td>
                        <td className="px-4 py-3">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => fetchCourseStudents(student.course_id)}
                          >
                            <Users className="h-3 w-3 mr-1" />
                            View Details
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

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
            <AttendanceCharts attendanceRecords={dashboardData?.recent_records || []} />
          </div>
        </div>

        {/* Course Students Modal */}
        {courseStudents && (
          <div 
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setCourseStudents(null);
                setSelectedCourse(null);
              }
            }}
          >
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
              <div className="bg-gradient-to-r from-indigo-50 to-blue-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setCourseStudents(null);
                      setSelectedCourse(null);
                    }}
                    className="flex items-center gap-2"
                    title="Back to dashboard"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">{courseStudents.course_name}</h2>
                    <p className="text-sm text-slate-600">{courseStudents.course_code} • {courseStudents.total_students} students</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setCourseStudents(null);
                      setSelectedCourse(null);
                    }}
                    className="flex items-center gap-2"
                  >
                    <XCircle className="h-4 w-4" />
                    Close
                  </Button>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-6">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50 sticky top-0">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Student</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Records</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Present</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Absent</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Rate</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Recent Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {courseStudents.students.map((student) => (
                        <tr key={student.student_id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-4 py-3">
                            <div className="font-medium text-slate-900">{student.student_name}</div>
                            <div className="text-xs text-slate-500">{student.reg_number}</div>
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-600">{student.total_records}</td>
                          <td className="px-4 py-3 text-sm font-semibold text-emerald-600">{student.present_count}</td>
                          <td className="px-4 py-3 text-sm font-semibold text-rose-600">{student.absent_count}</td>
                          <td className="px-4 py-3">
                            <span className={`font-bold ${
                              student.attendance_rate < 60 ? 'text-rose-600' :
                              student.attendance_rate < 75 ? 'text-amber-600' :
                              'text-emerald-600'
                            }`}>
                              {student.attendance_rate}%
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-1">
                              {student.recent_status?.slice(0, 3).map((status, idx) => (
                                <span
                                  key={idx}
                                  className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                    status?.toLowerCase() === 'present'
                                      ? 'bg-emerald-100 text-emerald-700'
                                      : 'bg-rose-100 text-rose-700'
                                  }`}
                                >
                                  {status?.[0] || 'N'}
                                </span>
                              ))}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Today's Attendance Modal */}
        {showTodayAttendance && todayAttendance && (
          <div 
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowTodayAttendance(false);
                setTodayAttendance(null);
              }
            }}
          >
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setShowTodayAttendance(false);
                      setTodayAttendance(null);
                    }}
                    className="flex items-center gap-2"
                    title="Back to dashboard"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">Today's Attendance</h2>
                    <p className="text-sm text-slate-600">{todayAttendance.course_name} • {new Date(todayAttendance.date).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setShowTodayAttendance(false);
                      setTodayAttendance(null);
                    }}
                    className="flex items-center gap-2"
                  >
                    <XCircle className="h-4 w-4" />
                    Close
                  </Button>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-6">
                <div className="mb-4 flex items-center justify-between">
                  <div className="text-sm text-slate-600">
                    <span className="font-semibold">{todayAttendance.marked_count}</span> of{' '}
                    <span className="font-semibold">{todayAttendance.total_students}</span> students marked
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fetchTodayAttendance(todayAttendance.course_id)}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                </div>
                <div className="space-y-2">
                  {todayAttendance.attendance.map((record) => (
                    <div
                      key={record.student_id}
                      className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200"
                    >
                      <div className="flex-1">
                        <div className="font-medium text-slate-900">{record.student_name}</div>
                        <div className="text-sm text-slate-500">{record.reg_number}</div>
                      </div>
                      <div className="flex items-center gap-3">
                        {record.marked ? (
                          <div className="flex items-center gap-2">
                            <span
                              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                                record.status?.toLowerCase() === 'present'
                                  ? 'bg-emerald-100 text-emerald-700'
                                  : record.status?.toLowerCase() === 'late'
                                  ? 'bg-amber-100 text-amber-700'
                                  : 'bg-rose-100 text-rose-700'
                              }`}
                            >
                              {record.status} {record.time_in && `(${record.time_in})`}
                            </span>
                            <div className="flex gap-1">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => markAttendance(record.student_id, todayAttendance.course_id, 'Present')}
                                disabled={markingAttendance}
                                className="h-8 px-3 text-xs"
                              >
                                <UserCheck className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => markAttendance(record.student_id, todayAttendance.course_id, 'Absent')}
                                disabled={markingAttendance}
                                className="h-8 px-3 text-xs"
                              >
                                <UserX className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex gap-1">
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => markAttendance(record.student_id, todayAttendance.course_id, 'Present')}
                              disabled={markingAttendance}
                              className="h-8 px-3 text-xs"
                            >
                              <UserCheck className="h-3 w-3 mr-1" />
                              Present
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => markAttendance(record.student_id, todayAttendance.course_id, 'Absent')}
                              disabled={markingAttendance}
                              className="h-8 px-3 text-xs"
                            >
                              <UserX className="h-3 w-3 mr-1" />
                              Absent
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <Footer />
    </div>
  );
};

export default LecturerDashboard;

