// Enrollment Management Component for Admin
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { UserCheck, Plus, Trash2, Search, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Label } from '@/components/ui/label';

export const EnrollmentManagement = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [formData, setFormData] = useState({
    student_id: '',
    course_id: '',
    semester: 'Fall',
    year: new Date().getFullYear(),
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchEnrollments();
    fetchStudents();
    fetchCourses();
  }, []);

  const fetchEnrollments = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        toast({
          title: 'Error',
          description: 'No authentication token found. Please login again.',
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }
      
      const response = await fetch('http://localhost:8000/admin/enrollments', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          // Token expired or invalid - redirect to login
          localStorage.removeItem('token');
          localStorage.removeItem('userRole');
          window.location.href = '/login';
          return;
        }
        const errorData = await response.json().catch(() => ({ detail: `HTTP ${response.status}` }));
        throw new Error(errorData.detail || 'Failed to fetch enrollments');
      }
      
      const data = await response.json();
      const enrollmentsList = data.enrollments || data || [];
      setEnrollments(enrollmentsList);
      console.log(`Loaded ${enrollmentsList.length} enrollments`);
    } catch (error) {
      console.error('Fetch enrollments error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to fetch enrollments',
        variant: 'destructive',
      });
      setEnrollments([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/admin/students', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setStudents(data.students || []);
      }
    } catch (error) {
      console.error('Failed to fetch students');
    }
  };

  const fetchCourses = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/admin/courses', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setCourses(data.courses || []);
      }
    } catch (error) {
      console.error('Failed to fetch courses');
    }
  };

  const handleCreate = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/enrollment/enroll', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          student_id: parseInt(formData.student_id),
          course_id: parseInt(formData.course_id),
          semester: formData.semester,
          year: parseInt(formData.year),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to enroll student');
      }

      toast({
        title: 'Success',
        description: 'Student enrolled successfully',
      });
      setIsCreateOpen(false);
      resetForm();
      fetchEnrollments();
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (enrollmentId) => {
    if (!confirm('Are you sure you want to remove this enrollment?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/enrollment/delete/${enrollmentId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to remove enrollment');
      }

      toast({
        title: 'Success',
        description: 'Enrollment removed successfully',
      });
      fetchEnrollments();
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const resetForm = () => {
    setFormData({
      student_id: '',
      course_id: '',
      semester: 'Fall',
      year: new Date().getFullYear(),
    });
  };

  const getStudentName = (studentId) => {
    const student = students.find(s => s.student_id === studentId);
    return student?.student_name || 'Unknown';
  };

  const getCourseName = (courseId) => {
    const course = courses.find(c => c.course_id === courseId);
    return course ? `${course.course_code} - ${course.course_name}` : 'Unknown';
  };

  const filteredEnrollments = enrollments.filter(e => {
    const studentName = getStudentName(e.student_id).toLowerCase();
    const courseName = getCourseName(e.course_id).toLowerCase();
    const query = searchQuery.toLowerCase();
    return studentName.includes(query) || courseName.includes(query);
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <UserCheck className="h-5 w-5 text-emerald-600" />
          <h3 className="text-lg font-bold text-slate-900">Enrollment Management</h3>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search enrollments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          <Button variant="outline" size="sm" onClick={fetchEnrollments}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="h-4 w-4 mr-2" />
                Enroll Student
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Enroll Student in Course</DialogTitle>
                <DialogDescription>Add a student enrollment</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Student</Label>
                    <Select
                      value={formData.student_id}
                      onValueChange={(v) => setFormData({ ...formData, student_id: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select student" />
                      </SelectTrigger>
                      <SelectContent>
                        {students.map(student => (
                          <SelectItem key={student.student_id} value={student.student_id.toString()}>
                            {student.student_name} ({student.reg_number})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Course</Label>
                    <Select
                      value={formData.course_id}
                      onValueChange={(v) => setFormData({ ...formData, course_id: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select course" />
                      </SelectTrigger>
                      <SelectContent>
                        {courses.map(course => (
                          <SelectItem key={course.course_id} value={course.course_id.toString()}>
                            {course.course_code} - {course.course_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Semester</Label>
                    <Select
                      value={formData.semester}
                      onValueChange={(v) => setFormData({ ...formData, semester: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Fall">Fall</SelectItem>
                        <SelectItem value="Spring">Spring</SelectItem>
                        <SelectItem value="Summer">Summer</SelectItem>
                        <SelectItem value="Winter">Winter</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Year</Label>
                    <Input
                      type="number"
                      value={formData.year}
                      onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                      min={2020}
                      max={2030}
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                <Button onClick={handleCreate}>Enroll Student</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Enrollments Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student</TableHead>
              <TableHead>Course</TableHead>
              <TableHead>Semester</TableHead>
              <TableHead>Year</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">Loading...</TableCell>
              </TableRow>
            ) : filteredEnrollments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                  No enrollments found
                </TableCell>
              </TableRow>
            ) : (
              filteredEnrollments.map((enrollment) => (
                <TableRow key={enrollment.id || enrollment.student_id + '-' + enrollment.course_id}>
                  <TableCell className="font-medium">
                    {enrollment.student_name || getStudentName(enrollment.student_id)}
                  </TableCell>
                  <TableCell>
                    {enrollment.course_name || getCourseName(enrollment.course_id)}
                  </TableCell>
                  <TableCell>{enrollment.semester || 'N/A'}</TableCell>
                  <TableCell>{enrollment.year || 'N/A'}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(enrollment.id)}
                    >
                      <Trash2 className="h-4 w-4 text-rose-600" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

