// System Reports Component for Admin
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FileText, Download, RefreshCw, BarChart3 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const SystemReports = () => {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchComprehensiveReport = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/admin-management/reports/comprehensive', {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to generate report');
      }

      const data = await response.json();
      setReportData(data);
      toast({
        title: 'Success',
        description: 'Report generated successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const exportReport = () => {
    if (!reportData) {
      toast({
        title: 'No Data',
        description: 'Please generate a report first',
        variant: 'destructive',
      });
      return;
    }

    const reportText = `
COMPREHENSIVE SYSTEM REPORT
Generated: ${reportData.generated_at}

SUMMARY
===============================
Total Students: ${reportData.summary?.total_students || 0}
Total Lecturers: ${reportData.summary?.total_lecturers || 0}
Total Courses: ${reportData.summary?.total_courses || 0}
Total Attendance Records: ${reportData.summary?.total_attendance_records || 0}

ATTENDANCE STATISTICS
===============================
Present: ${reportData.attendance?.present || 0}
Absent: ${reportData.attendance?.absent || 0}
Attendance Rate: ${reportData.attendance?.rate || 0}%
    `.trim();

    const blob = new Blob([reportText], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `system_report_${new Date().toISOString().slice(0, 10)}.txt`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: 'Export Successful',
      description: 'Report exported successfully',
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BarChart3 className="h-5 w-5 text-purple-600" />
          <h3 className="text-lg font-bold text-slate-900">System Reports</h3>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={fetchComprehensiveReport}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Generate Report
          </Button>
          {reportData && (
            <Button onClick={exportReport}>
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          )}
        </div>
      </div>

      {reportData && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>System Summary</CardTitle>
              <CardDescription>Overall system statistics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600">Total Students</span>
                  <span className="font-bold">{reportData.summary?.total_students || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600">Total Lecturers</span>
                  <span className="font-bold">{reportData.summary?.total_lecturers || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600">Total Courses</span>
                  <span className="font-bold">{reportData.summary?.total_courses || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600">Total Records</span>
                  <span className="font-bold">{reportData.summary?.total_attendance_records || 0}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Attendance Statistics</CardTitle>
              <CardDescription>Attendance breakdown</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600">Present</span>
                  <span className="font-bold text-emerald-600">{reportData.attendance?.present || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600">Absent</span>
                  <span className="font-bold text-rose-600">{reportData.attendance?.absent || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600">Attendance Rate</span>
                  <span className="font-bold text-blue-600">{reportData.attendance?.rate || 0}%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {!reportData && (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 mb-4">No report generated yet</p>
            <Button onClick={fetchComprehensiveReport} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Generate Comprehensive Report
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

