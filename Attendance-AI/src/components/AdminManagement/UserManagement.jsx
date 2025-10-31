// Student Management Component for Admin
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
import { Users, UserPlus, Edit, Trash2, Search, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export function StudentManagement() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [formData, setFormData] = useState({
    student_name: '',
    reg_number: '',
    email: '',
    year_of_study: 1,
    faculty_id: 1,
    password: '',
  });
  const [faculties, setFaculties] = useState([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchStudents();
    fetchFaculties();
  }, []);

  const fetchStudents = async () => {
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
      
      const response = await fetch('http://localhost:8000/admin/students', {
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
        throw new Error(errorData.detail || 'Failed to fetch students');
      }
      
      const data = await response.json();
      const studentsList = data.students || data || [];
      setStudents(studentsList);
      console.log(`Loaded ${studentsList.length} students`);
    } catch (error) {
      console.error('Fetch students error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to fetch students',
        variant: 'destructive',
      });
      setStudents([]);
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

  const handleCreate = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/admin-management/students/create', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to create student');
      }

      toast({
        title: 'Success',
        description: 'Student created successfully',
      });
      setIsCreateOpen(false);
      resetForm();
      fetchStudents();
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleUpdate = async (studentId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/admin-management/students/${studentId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to update student');
      }

      toast({
        title: 'Success',
        description: 'Student updated successfully',
      });
      setEditingStudent(null);
      resetForm();
      fetchStudents();
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (studentId) => {
    if (!confirm('Are you sure you want to delete this student?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/admin-management/students/${studentId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to delete student');
      }

      toast({
        title: 'Success',
        description: 'Student deleted successfully',
      });
      fetchStudents();
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
      student_name: '',
      reg_number: '',
      email: '',
      year_of_study: 1,
      faculty_id: 1,
      password: '',
    });
  };

  const openEdit = (student) => {
    setEditingStudent(student);
    setFormData({
      student_name: student.student_name,
      reg_number: student.reg_number,
      email: student.email,
      year_of_study: student.year_of_study || 1,
      faculty_id: student.faculty_id || 1,
      password: '',
    });
  };

  const filteredStudents = students.filter(s =>
    s.student_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.reg_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-bold text-slate-900">Student Management</h3>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search students..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          <Button variant="outline" size="sm" onClick={fetchStudents}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <UserPlus className="h-4 w-4 mr-2" />
                Add Student
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Student</DialogTitle>
                <DialogDescription>Add a new student to the system</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Full Name</label>
                    <Input
                      value={formData.student_name}
                      onChange={(e) => setFormData({ ...formData, student_name: e.target.value })}
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Registration Number</label>
                    <Input
                      value={formData.reg_number}
                      onChange={(e) => setFormData({ ...formData, reg_number: e.target.value })}
                      placeholder="REG123"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Email</label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="student@university.ac.ke"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Year of Study</label>
                    <Select
                      value={formData.year_of_study.toString()}
                      onValueChange={(v) => setFormData({ ...formData, year_of_study: parseInt(v) })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5, 6].map(year => (
                          <SelectItem key={year} value={year.toString()}>Year {year}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Faculty</label>
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
                    <label className="text-sm font-medium mb-2 block">Password</label>
                    <Input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="Enter password"
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                <Button onClick={handleCreate}>Create Student</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Edit Dialog */}
      {editingStudent && (
        <Dialog open={!!editingStudent} onOpenChange={() => setEditingStudent(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Student</DialogTitle>
              <DialogDescription>Update student information</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Full Name</label>
                  <Input
                    value={formData.student_name}
                    onChange={(e) => setFormData({ ...formData, student_name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Registration Number</label>
                  <Input
                    value={formData.reg_number}
                    onChange={(e) => setFormData({ ...formData, reg_number: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Email</label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Year of Study</label>
                  <Select
                    value={formData.year_of_study.toString()}
                    onValueChange={(v) => setFormData({ ...formData, year_of_study: parseInt(v) })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6].map(year => (
                        <SelectItem key={year} value={year.toString()}>Year {year}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Faculty</label>
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
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingStudent(null)}>Cancel</Button>
              <Button onClick={() => handleUpdate(editingStudent.student_id)}>Update Student</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Students Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Reg Number</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Year</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">Loading...</TableCell>
              </TableRow>
            ) : filteredStudents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                  No students found
                </TableCell>
              </TableRow>
            ) : (
              filteredStudents.map((student) => (
                <TableRow key={student.student_id}>
                  <TableCell className="font-medium">{student.student_name}</TableCell>
                  <TableCell>{student.reg_number}</TableCell>
                  <TableCell>{student.email}</TableCell>
                  <TableCell>Year {student.year_of_study}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEdit(student)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(student.student_id)}
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
}

