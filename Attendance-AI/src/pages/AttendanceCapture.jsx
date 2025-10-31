// Attendance Capture Page - For Lecturers to mark attendance using facial recognition
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, CheckCircle, XCircle, ArrowLeft, Camera, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import DashboardHeader from '@/components/DashboardHeader';
import Footer from '@/components/Footer';
import WebcamCapture from '@/components/FaceCapture/WebcamCapture';

const AttendanceCapture = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [isRecognizing, setIsRecognizing] = useState(false);
  const [lastResult, setLastResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchCourses();
    // Check if user is lecturer/admin
    const role = localStorage.getItem('userRole');
    if (!role || (role !== 'lecturer' && role !== 'admin')) {
      navigate('/dashboard');
    }
  }, []);

  const fetchCourses = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/lecturer/dashboard-summary', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.clear();
          window.location.href = '/login';
          return;
        }
        throw new Error('Failed to fetch courses');
      }

      const data = await response.json();
      console.log('[AttendanceCapture] Dashboard data:', data);
      
      // Extract courses from the dashboard data - use courses_stats which has full info
      const coursesList = data.courses_stats || data.courses || [];
      console.log('[AttendanceCapture] Courses list:', coursesList);
      setCourses(coursesList);
      
      // Auto-select first course if available
      if (coursesList.length > 0 && !selectedCourseId) {
        const firstCourse = coursesList[0];
        setSelectedCourseId(firstCourse.course_id);
        console.log('[AttendanceCapture] Auto-selected course:', firstCourse.course_id, firstCourse.course_name);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to load courses',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFaceCapture = async (imageBlob) => {
    if (!selectedCourseId) {
      toast({
        title: 'No Course Selected',
        description: 'Please select a course first',
        variant: 'destructive',
      });
      return;
    }

    setIsRecognizing(true);
    setLastResult(null);

    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('file', imageBlob, 'captured_face.jpg');
      if (selectedCourseId) {
        formData.append('course_id', selectedCourseId.toString());
      }

      const response = await fetch('http://localhost:8000/face/recognize-face', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      console.log('[AttendanceCapture] Response status:', response.status);
      console.log('[AttendanceCapture] Response ok:', response.ok);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
        console.error('[AttendanceCapture] API Error:', errorData);
        
        if (response.status === 401) {
          localStorage.clear();
          window.location.href = '/login';
          return;
        }

        throw new Error(errorData.detail || 'Face recognition failed');
      }

      const result = await response.json();
      console.log('[AttendanceCapture] Recognition result:', result);
      console.log('[AttendanceCapture] Student recognized:', result.student);
      console.log('[AttendanceCapture] Confidence:', result.confidence);
      console.log('[AttendanceCapture] Attendance recorded:', result.attendance_recorded);
      
      setLastResult({
        success: true,
        student: result.student,
        confidence: result.confidence,
        message: result.message,
        attendanceRecorded: result.attendance_recorded || false,
      });

      toast({
        title: '✅ Attendance Marked',
        description: `${result.student.name} - ${(result.confidence * 100).toFixed(1)}% confidence${result.attendance_recorded ? ' - Attendance recorded!' : ''}`,
      });
    } catch (error) {
      console.error('Face recognition error:', error);
      setLastResult({
        success: false,
        message: error.message || 'Face not recognized. Please try again.',
      });

      toast({
        title: 'Recognition Failed',
        description: error.message || 'Face not recognized. Please ensure the student is registered.',
        variant: 'destructive',
      });
    } finally {
      setIsRecognizing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-lg font-semibold text-slate-700">Loading courses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
      <DashboardHeader />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/dashboard')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-4xl font-bold text-slate-900 mb-2">
            Facial Recognition Attendance
          </h1>
          <p className="text-slate-600">
            Capture student faces to automatically mark attendance
          </p>
        </div>

        {/* Course Selection */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Select Course</CardTitle>
            <CardDescription>Choose the course for which to mark attendance</CardDescription>
          </CardHeader>
          <CardContent>
            {courses.length > 0 ? (
              <Select
                value={selectedCourseId?.toString() || ''}
                onValueChange={(value) => {
                  console.log('[AttendanceCapture] Course selected:', value);
                  setSelectedCourseId(parseInt(value));
                }}
              >
                <SelectTrigger className="w-full max-w-md">
                  <SelectValue placeholder="Select a course">
                    {selectedCourseId 
                      ? `${courses.find(c => c.course_id === selectedCourseId)?.course_code || ''} - ${courses.find(c => c.course_id === selectedCourseId)?.course_name || ''}`
                      : 'Select a course'}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {courses.map((course) => (
                    <SelectItem key={course.course_id} value={course.course_id.toString()}>
                      {course.course_code} - {course.course_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-amber-700 text-sm">
                  No courses available. Please ensure you have courses assigned to you.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Webcam Capture */}
        {selectedCourseId ? (
          <>
            <div className="mb-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-700">
                  <strong>Selected Course:</strong> {courses.find(c => c.course_id === selectedCourseId)?.course_code || ''} - {courses.find(c => c.course_id === selectedCourseId)?.course_name || 'Unknown'}
                </p>
              </div>
            </div>
            <WebcamCapture
              key={selectedCourseId} // Force re-render when course changes
              onCapture={handleFaceCapture}
              courseId={selectedCourseId}
              isRecognizing={isRecognizing}
            />

            {/* Last Result */}
            {lastResult && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {lastResult.success ? (
                      <CheckCircle className="h-5 w-5 text-emerald-600" />
                    ) : (
                      <XCircle className="h-5 w-5 text-rose-600" />
                    )}
                    Recognition Result
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {lastResult.success ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                        <div>
                          <p className="font-semibold text-emerald-900">
                            {lastResult.student.name}
                          </p>
                          <p className="text-sm text-emerald-700">
                            {lastResult.student.email}
                          </p>
                          <p className="text-xs text-emerald-600 mt-1">
                            ID: {lastResult.student.id}
                          </p>
                          {lastResult.attendanceRecorded && (
                            <p className="text-xs text-emerald-700 mt-2 font-semibold">
                              ✓ Attendance recorded for today
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-emerald-700">
                            {(lastResult.confidence * 100).toFixed(1)}%
                          </p>
                          <p className="text-xs text-emerald-600">Confidence</p>
                        </div>
                      </div>
                      <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-sm text-blue-700 text-center">
                          ✅ {lastResult.attendanceRecorded ? 'Attendance marked successfully!' : 'Face recognized, but attendance not recorded. Please try again.'}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 bg-rose-50 rounded-lg border border-rose-200">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertCircle className="h-5 w-5 text-rose-600" />
                        <p className="font-semibold text-rose-900">Recognition Failed</p>
                      </div>
                      <p className="text-sm text-rose-700">{lastResult.message}</p>
                      <p className="text-xs text-rose-600 mt-2">
                        Make sure the student's face is registered in the system.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <AlertCircle className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 font-medium">
                Please select a course to begin marking attendance
              </p>
            </CardContent>
          </Card>
        )}

        {/* Instructions */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>How to Use</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-slate-600">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-semibold text-xs">
                1
              </div>
              <p>Select the course for which you want to mark attendance</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-semibold text-xs">
                2
              </div>
              <p>Allow camera access when prompted</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-semibold text-xs">
                3
              </div>
              <p>Position the student's face in the center of the frame</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-semibold text-xs">
                4
              </div>
              <p>Click "Capture & Recognize" to mark attendance automatically</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-semibold text-xs">
                5
              </div>
              <p>The system will identify the student and mark them as present</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
};

export default AttendanceCapture;

