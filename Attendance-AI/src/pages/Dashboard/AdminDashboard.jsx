// Admin Dashboard Component
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
import { 
  Users, 
  GraduationCap, 
  BookOpen, 
  Building2, 
  TrendingUp, 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Search,
  Filter,
  Download,
  RefreshCw,
  ArrowUpDown,
  BarChart3,
  UserCheck,
  Shield,
  Clock
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import DashboardHeader from '@/components/DashboardHeader';
import Footer from '@/components/Footer';
import AttendanceCharts from '@/components/AttendanceCharts';
import { AdminEnhancedCharts } from '@/components/EnhancedCharts';
import { StudentManagement } from '@/components/AdminManagement/UserManagement';
import { LecturerManagement } from '@/components/AdminManagement/LecturerManagement';
import { CourseManagement } from '@/components/AdminManagement/CourseManagement';
import { EnrollmentManagement } from '@/components/AdminManagement/EnrollmentManagement';
import { SystemReports } from '@/components/AdminManagement/SystemReports';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterFaculty, setFilterFaculty] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date-desc');
  const { toast } = useToast();

  useEffect(() => {
    // Check if we have a valid token and role before fetching
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('userRole');
    
    if (!token || !role) {
      console.error('No token or role found, redirecting to login');
      window.location.href = '/login';
      return;
    }
    
    if (role !== 'admin') {
      console.error('User is not an admin, redirecting to login');
      window.location.href = '/login';
      return;
    }
    
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async (showToast = false) => {
    try {
      setRefreshing(true);
      const token = localStorage.getItem('token');
      const role = localStorage.getItem('userRole');
      
      console.log('[AdminDashboard] Fetching dashboard data...');
      console.log('[AdminDashboard] Token exists:', !!token);
      console.log('[AdminDashboard] Role:', role);
      
      if (!token) {
        console.error('[AdminDashboard] No token found');
        window.location.href = '/login';
        return;
      }
      
      const response = await fetch('http://localhost:8000/admin-dashboard/dashboard-summary', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('[AdminDashboard] Response status:', response.status);
      console.log('[AdminDashboard] Response ok:', response.ok);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Failed to parse error' }));
        console.error('[AdminDashboard] API Error:', errorData);
        console.error('[AdminDashboard] Status:', response.status);
        
        if (response.status === 401) {
          console.error('[AdminDashboard] 401 Unauthorized');
          console.error('[AdminDashboard] Error detail:', errorData.detail);
          
          toast({
            title: 'Authentication Failed',
            description: errorData.detail || 'Invalid or expired token. Please log in again.',
            variant: 'destructive',
          });
          
          localStorage.clear();
          setTimeout(() => {
            window.location.href = '/login';
          }, 1500);
          return;
        }
        
        if (response.status === 403) {
          console.error('[AdminDashboard] 403 Forbidden - Admin privileges not found');
          toast({
            title: 'Access Denied',
            description: errorData.detail || 'You do not have admin privileges.',
            variant: 'destructive',
          });
          setTimeout(() => {
            window.location.href = '/login';
          }, 1500);
          return;
        }
        
        throw new Error(errorData.detail || `Failed to fetch admin dashboard data (${response.status})`);
      }

      const data = await response.json();
      console.log('Admin dashboard data fetched successfully:', data);
      setDashboardData(data);
      
      // Store admin name in localStorage for header
      if (data.admin_name) {
        localStorage.setItem('lecturerName', data.admin_name);
        localStorage.setItem('adminName', data.admin_name);
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

  // Filter and sort recent records
  const filteredRecords = useMemo(() => {
    if (!dashboardData?.recent_records) return [];

    let filtered = [...dashboardData.recent_records];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(record =>
        record.student_name?.toLowerCase().includes(query) ||
        record.reg_number?.toLowerCase().includes(query) ||
        record.course_name?.toLowerCase().includes(query) ||
        record.lecturer_name?.toLowerCase().includes(query) ||
        record.status?.toLowerCase().includes(query)
      );
    }

    // Faculty filter (would need faculty in records - skip for now)
    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(record => record.status?.toLowerCase() === statusFilter);
    }

    // Sort
    filtered.sort((a, b) => {
      if (sortBy === 'date-desc') {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      }
      if (sortBy === 'date-asc') {
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      }
      if (sortBy === 'student-asc') {
        return a.student_name.localeCompare(b.student_name);
      }
      if (sortBy === 'student-desc') {
        return b.student_name.localeCompare(a.student_name);
      }
      return 0;
    });

    return filtered;
  }, [dashboardData, searchQuery, filterFaculty, statusFilter, sortBy]);

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

    const headers = ["Date", "Time", "Student Name", "Reg Number", "Course", "Lecturer", "Status"];
    const csv = [
      headers.join(','),
      ...filteredRecords.map(record => [
        `"${new Date(record.date).toLocaleDateString()}"`,
        `"${record.time || 'N/A'}"`,
        `"${record.student_name}"`,
        `"${record.reg_number}"`,
        `"${record.course_name}"`,
        `"${record.lecturer_name}"`,
        `"${record.status}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `admin_attendance_records_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({
      title: 'Export Successful',
      description: 'Attendance records exported to CSV.',
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
          <p className="text-lg font-semibold text-slate-700">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  const overallStats = dashboardData?.overall_stats || {};
  const attendanceStats = dashboardData?.attendance_stats || {};
  const todayStats = dashboardData?.today_stats || {};

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
      <DashboardHeader />

      {/* Header Section */}
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl shadow-lg">
                  <Shield className="h-8 w-8 text-white" />
                </div>
                <h1 className="text-4xl font-bold text-slate-900">
                  Welcome back, {dashboardData?.admin_name || 'Admin'}
                </h1>
              </div>
              <p className="text-slate-600">System-wide overview and management</p>
            </div>
            <div className="hidden md:flex items-center gap-4 px-8 py-5 rounded-2xl border-4 shadow-xl" style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)', borderColor: '#7c3aed', color: '#ffffff' }}>
              <div className="p-3 rounded-xl border-2" style={{ backgroundColor: 'rgba(255, 255, 255, 0.3)', borderColor: 'rgba(255, 255, 255, 0.5)' }}>
                <Shield className="h-7 w-7" style={{ color: '#ffffff' }} />
              </div>
              <div>
                <div className="text-xs font-black uppercase tracking-wider mb-1" style={{ color: '#ffffff' }}>System Status</div>
                <div className="text-2xl font-black" style={{ color: '#ffffff', textShadow: '1px 1px 3px rgba(0,0,0,0.3)' }}>Active</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overall Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Students */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-xl">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="text-3xl font-bold text-slate-900 mb-1">{overallStats.total_students || 0}</div>
            <div className="text-sm font-medium text-slate-500">Total Students</div>
          </div>

          {/* Total Lecturers */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-100 rounded-xl">
                <GraduationCap className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <div className="text-3xl font-bold text-slate-900 mb-1">{overallStats.total_lecturers || 0}</div>
            <div className="text-sm font-medium text-slate-500">Total Lecturers</div>
          </div>

          {/* Total Courses */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-indigo-100 rounded-xl">
                <BookOpen className="h-6 w-6 text-indigo-600" />
              </div>
            </div>
            <div className="text-3xl font-bold text-slate-900 mb-1">{overallStats.total_courses || 0}</div>
            <div className="text-sm font-medium text-slate-500">Total Courses</div>
          </div>

          {/* Total Faculties */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-emerald-100 rounded-xl">
                <Building2 className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
            <div className="text-3xl font-bold text-slate-900 mb-1">{overallStats.total_faculties || 0}</div>
            <div className="text-sm font-medium text-slate-500">Total Faculties</div>
          </div>
        </div>

        {/* Attendance Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Attendance Rate */}
          <div className="rounded-2xl p-6 shadow-xl border-4 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1" style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)', borderColor: '#7c3aed', color: '#ffffff' }}>
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl" style={{ backgroundColor: 'rgba(255, 255, 255, 0.3)' }}>
                <TrendingUp className="h-7 w-7" style={{ color: '#ffffff' }} />
              </div>
            </div>
            <div className="text-5xl font-black mb-2" style={{ color: '#ffffff', textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}>
              {attendanceStats.attendance_rate?.toFixed(1) || 0}%
            </div>
            <div className="text-base font-black uppercase tracking-wider" style={{ color: '#ffffff' }}>Attendance Rate</div>
          </div>

          {/* Total Records */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-indigo-100 rounded-xl">
                <Activity className="h-6 w-6 text-indigo-600" />
              </div>
            </div>
            <div className="text-3xl font-bold text-slate-900 mb-1">{attendanceStats.total_records || 0}</div>
            <div className="text-sm font-medium text-slate-500">Total Records</div>
          </div>

          {/* Present */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-emerald-100 rounded-xl">
                <CheckCircle className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
            <div className="text-3xl font-bold text-emerald-600 mb-1">{attendanceStats.present_count || 0}</div>
            <div className="text-sm font-medium text-slate-500">Present</div>
          </div>

          {/* Absent */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-rose-100 rounded-xl">
                <XCircle className="h-6 w-6 text-rose-600" />
              </div>
            </div>
            <div className="text-3xl font-bold text-rose-600 mb-1">{attendanceStats.absent_count || 0}</div>
            <div className="text-sm font-medium text-slate-500">Absent</div>
          </div>
        </div>

        {/* Today's Stats */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 mb-8 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Clock className="h-5 w-5 text-blue-600" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Today's Activity</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-slate-50 rounded-lg">
              <div className="text-2xl font-bold text-slate-900">{todayStats.total || 0}</div>
              <div className="text-sm text-slate-600">Records Today</div>
            </div>
            <div className="text-center p-4 bg-emerald-50 rounded-lg">
              <div className="text-2xl font-bold text-emerald-600">{todayStats.present || 0}</div>
              <div className="text-sm text-slate-600">Present Today</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{todayStats.rate?.toFixed(1) || 0}%</div>
              <div className="text-sm text-slate-600">Today's Rate</div>
            </div>
          </div>
        </div>

        {/* Low Attendance Alert */}
        {dashboardData?.low_attendance_students && dashboardData.low_attendance_students.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg border border-amber-200 mb-8">
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 px-6 py-4 border-b border-amber-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Low Attendance Alert</h2>
                  <p className="text-sm text-slate-600">{dashboardData.low_attendance_students.length} students below 70% attendance</p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Student</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Reg Number</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Attendance Rate</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Records</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {dashboardData.low_attendance_students.map((student, index) => (
                      <tr key={index} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="font-medium text-slate-900">{student.student_name}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm text-slate-600">{student.reg_number}</div>
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
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Faculty Statistics */}
        {dashboardData?.faculty_stats && dashboardData.faculty_stats.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 mb-8">
            <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-6 py-4 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <Building2 className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Faculty Statistics</h2>
                  <p className="text-sm text-slate-600">Breakdown by faculty</p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {dashboardData.faculty_stats.map((faculty, index) => (
                  <Card key={index} className="border border-slate-200">
                    <CardHeader>
                      <CardTitle className="text-lg">{faculty.faculty_name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-600">Students</span>
                          <span className="text-lg font-bold text-slate-900">{faculty.students_count}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-600">Lecturers</span>
                          <span className="text-lg font-bold text-slate-900">{faculty.lecturers_count}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-600">Courses</span>
                          <span className="text-lg font-bold text-slate-900">{faculty.courses_count}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Top Courses */}
        {dashboardData?.top_courses && dashboardData.top_courses.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 mb-8">
            <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-6 py-4 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <BarChart3 className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Top Courses by Attendance</h2>
                  <p className="text-sm text-slate-600">Most active courses</p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Course</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Code</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Total Records</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Present</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Rate</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {dashboardData.top_courses.map((course, index) => (
                      <tr key={index} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="font-medium text-slate-900">{course.course_name}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm text-slate-600">{course.course_code}</div>
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-600">{course.total_records}</td>
                        <td className="px-4 py-3 text-sm font-semibold text-emerald-600">{course.present_count}</td>
                        <td className="px-4 py-3">
                          <span className="font-bold text-slate-900">{course.attendance_rate}%</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Recent Attendance Records */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 mb-8">
          <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-6 py-4 border-b border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <Activity className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Recent Attendance Records</h2>
                  <p className="text-sm text-slate-600">Latest attendance across all courses</p>
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

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search students, courses, lecturers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="present">Present</SelectItem>
                  <SelectItem value="absent">Absent</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <ArrowUpDown className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Sort By" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date-desc">Date (Newest First)</SelectItem>
                  <SelectItem value="date-asc">Date (Oldest First)</SelectItem>
                  <SelectItem value="student-asc">Student Name (A-Z)</SelectItem>
                  <SelectItem value="student-desc">Student Name (Z-A)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase">Date</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase">Time</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase">Student</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase">Course</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase">Lecturer</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase">Status</th>
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
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-slate-600">{record.time || <span className="text-slate-400 italic">N/A</span>}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-900">{record.student_name}</div>
                        <div className="text-xs text-slate-500">{record.reg_number}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-900">{record.course_name}</div>
                        <div className="text-xs text-slate-500">{record.course_code}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-slate-600">{record.lecturer_name}</div>
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
                    <td colSpan="6" className="px-6 py-16 text-center">
                      <Activity className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                      <p className="text-slate-500 font-medium">No attendance records found</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
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
                <p className="text-sm text-slate-600">System-wide attendance insights</p>
              </div>
            </div>
          </div>
          <div className="p-6">
            <AdminEnhancedCharts dashboardData={dashboardData} />
          </div>
        </div>

        {/* Admin Management Section */}
        <div className="bg-white rounded-2xl shadow-lg border border-purple-200 mb-8">
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 px-6 py-4 border-b border-purple-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Shield className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">Admin Management</h2>
                <p className="text-sm text-slate-600">System administration and user management - Admin Only</p>
              </div>
            </div>
          </div>
          <div className="p-6">
            <Tabs defaultValue="students" className="w-full">
              <TabsList className="w-full flex flex-row items-center justify-start gap-0 mb-6 bg-slate-100 p-1 rounded-lg border border-slate-200">
                <TabsTrigger 
                  value="students" 
                  className="flex-1 min-w-0 py-3 px-4 text-sm font-semibold rounded-md transition-all data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-md data-[state=inactive]:text-slate-600 hover:text-slate-900"
                >
                  Students
                </TabsTrigger>
                <TabsTrigger 
                  value="lecturers" 
                  className="flex-1 min-w-0 py-3 px-4 text-sm font-semibold rounded-md transition-all data-[state=active]:bg-white data-[state=active]:text-purple-600 data-[state=active]:shadow-md data-[state=inactive]:text-slate-600 hover:text-slate-900"
                >
                  Lecturers
                </TabsTrigger>
                <TabsTrigger 
                  value="courses" 
                  className="flex-1 min-w-0 py-3 px-4 text-sm font-semibold rounded-md transition-all data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-md data-[state=inactive]:text-slate-600 hover:text-slate-900"
                >
                  Courses
                </TabsTrigger>
                <TabsTrigger 
                  value="enrollments" 
                  className="flex-1 min-w-0 py-3 px-4 text-sm font-semibold rounded-md transition-all data-[state=active]:bg-white data-[state=active]:text-emerald-600 data-[state=active]:shadow-md data-[state=inactive]:text-slate-600 hover:text-slate-900"
                >
                  Enrollments
                </TabsTrigger>
                <TabsTrigger 
                  value="reports" 
                  className="flex-1 min-w-0 py-3 px-4 text-sm font-semibold rounded-md transition-all data-[state=active]:bg-white data-[state=active]:text-purple-600 data-[state=active]:shadow-md data-[state=inactive]:text-slate-600 hover:text-slate-900"
                >
                  Reports
                </TabsTrigger>
              </TabsList>
              
              <div className="mt-6">
                <TabsContent value="students" className="mt-0">
                  <StudentManagement />
                </TabsContent>
                
                <TabsContent value="lecturers" className="mt-0">
                  <LecturerManagement />
                </TabsContent>
                
                <TabsContent value="courses" className="mt-0">
                  <CourseManagement />
                </TabsContent>
                
                <TabsContent value="enrollments" className="mt-0">
                  <EnrollmentManagement />
                </TabsContent>
                
                <TabsContent value="reports" className="mt-0">
                  <SystemReports />
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default AdminDashboard;

