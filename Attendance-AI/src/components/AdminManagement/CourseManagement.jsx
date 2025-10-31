// Course Management Component for Admin
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
import { BookOpen, Plus, Edit, Trash2, Search, RefreshCw } from 'lucide-react';
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

export const CourseManagement = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [formData, setFormData] = useState({
    course_name: '',
    course_code: '',
    faculty_id: 1,
    lecturer_id: null,
  });
  const [faculties, setFaculties] = useState([]);
  const [lecturers, setLecturers] = useState([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchCourses();
    fetchFaculties();
    fetchLecturers();
  }, []);

  const fetchCourses = async () => {
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
      
      const response = await fetch('http://localhost:8000/admin/courses', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('userRole');
          window.location.href = '/login';
          return;
        }
        const errorData = await response.json().catch(() => ({ detail: `HTTP ${response.status}` }));
        throw new Error(errorData.detail || 'Failed to fetch courses');
      }
      
      const data = await response.json();
      const coursesList = data.courses || data || [];
      setCourses(coursesList);
      console.log(`Loaded ${coursesList.length} courses`);
    } catch (error) {
      console.error('Fetch courses error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to fetch courses',
        variant: 'destructive',
      });
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchFaculties = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/admin/faculties', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setFaculties(data.faculties || []);
      }
    } catch (error) {
      console.error('Failed to fetch faculties');
    }
  };

  const fetchLecturers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/admin/lecturers', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setLecturers(data.lecturers || []);
      }
    } catch (error) {
      console.error('Failed to fetch lecturers');
    }
  };

  const handleCreate = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/admin-management/courses/create', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          lecturer_id: formData.lecturer_id || null,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to create course');
      }

      toast({
        title: 'Success',
        description: 'Course created successfully',
      });
      setIsCreateOpen(false);
      resetForm();
      fetchCourses();
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleUpdate = async (courseId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/admin-management/courses/${courseId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          lecturer_id: formData.lecturer_id || null,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to update course');
      }

      toast({
        title: 'Success',
        description: 'Course updated successfully',
      });
      setEditingCourse(null);
      resetForm();
      fetchCourses();
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (courseId) => {
    if (!confirm('Are you sure you want to delete this course? This will also delete all enrollments.')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/admin-management/courses/${courseId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to delete course');
      }

      toast({
        title: 'Success',
        description: 'Course deleted successfully',
      });
      fetchCourses();
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
      course_name: '',
      course_code: '',
      faculty_id: 1,
      lecturer_id: null,
    });
  };

  const openEdit = (course) => {
    setEditingCourse(course);
    setFormData({
      course_name: course.course_name,
      course_code: course.course_code,
      faculty_id: course.faculty_id || 1,
      lecturer_id: course.lecturer_id || null,
    });
  };

  const filteredCourses = courses.filter(c =>
    c.course_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.course_code?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getFacultyName = (facultyId) => {
    const faculty = faculties.find(f => f.faculty_id === facultyId);
    return faculty?.faculty_name || 'N/A';
  };

  const getLecturerName = (lecturerId) => {
    const lecturer = lecturers.find(l => l.lecturer_id === lecturerId);
    return lecturer?.lecturer_name || 'Unassigned';
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BookOpen className="h-5 w-5 text-indigo-600" />
          <h3 className="text-lg font-bold text-slate-900">Course Management</h3>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          <Button variant="outline" size="sm" onClick={fetchCourses}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="h-4 w-4 mr-2" />
                Add Course
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Course</DialogTitle>
                <DialogDescription>Add a new course to the system</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Course Name</Label>
                    <Input
                      value={formData.course_name}
                      onChange={(e) => setFormData({ ...formData, course_name: e.target.value })}
                      placeholder="Data Structures"
                    />
                  </div>
                  <div>
                    <Label>Course Code</Label>
                    <Input
                      value={formData.course_code}
                      onChange={(e) => setFormData({ ...formData, course_code: e.target.value })}
                      placeholder="CS201"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Faculty</Label>
                    <Select
                      value={formData.faculty_id.toString()}
                      onValueChange={(v) => setFormData({ ...formData, faculty_id: parseInt(v) })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {faculties.map(fac => (
                          <SelectItem key={fac.faculty_id} value={fac.faculty_id.toString()}>
                            {fac.faculty_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Lecturer (Optional)</Label>
                    <Select
                      value={formData.lecturer_id?.toString() || 'none'}
                      onValueChange={(v) => setFormData({ ...formData, lecturer_id: v === 'none' ? null : parseInt(v) })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No Lecturer</SelectItem>
                        {lecturers.map(lec => (
                          <SelectItem key={lec.lecturer_id} value={lec.lecturer_id.toString()}>
                            {lec.lecturer_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                <Button onClick={handleCreate}>Create Course</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Edit Dialog */}
      {editingCourse && (
        <Dialog open={!!editingCourse} onOpenChange={() => setEditingCourse(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Course</DialogTitle>
              <DialogDescription>Update course information</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Course Name</Label>
                  <Input
                    value={formData.course_name}
                    onChange={(e) => setFormData({ ...formData, course_name: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Course Code</Label>
                  <Input
                    value={formData.course_code}
                    onChange={(e) => setFormData({ ...formData, course_code: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Faculty</Label>
                  <Select
                    value={formData.faculty_id.toString()}
                    onValueChange={(v) => setFormData({ ...formData, faculty_id: parseInt(v) })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {faculties.map(fac => (
                        <SelectItem key={fac.faculty_id} value={fac.faculty_id.toString()}>
                          {fac.faculty_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Lecturer</Label>
                  <Select
                    value={formData.lecturer_id?.toString() || 'none'}
                    onValueChange={(v) => setFormData({ ...formData, lecturer_id: v === 'none' ? null : parseInt(v) })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No Lecturer</SelectItem>
                      {lecturers.map(lec => (
                        <SelectItem key={lec.lecturer_id} value={lec.lecturer_id.toString()}>
                          {lec.lecturer_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingCourse(null)}>Cancel</Button>
              <Button onClick={() => handleUpdate(editingCourse.course_id)}>Update Course</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Courses Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Course Code</TableHead>
              <TableHead>Course Name</TableHead>
              <TableHead>Faculty</TableHead>
              <TableHead>Lecturer</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">Loading...</TableCell>
              </TableRow>
            ) : filteredCourses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                  No courses found
                </TableCell>
              </TableRow>
            ) : (
              filteredCourses.map((course) => (
                <TableRow key={course.course_id}>
                  <TableCell className="font-medium">{course.course_code}</TableCell>
                  <TableCell>{course.course_name}</TableCell>
                  <TableCell>{getFacultyName(course.faculty_id)}</TableCell>
                  <TableCell>{getLecturerName(course.lecturer_id)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEdit(course)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(course.course_id)}
                      >
                        <Trash2 className="h-4 w-4 text-rose-600" />
                      </Button>
                    </div>
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

