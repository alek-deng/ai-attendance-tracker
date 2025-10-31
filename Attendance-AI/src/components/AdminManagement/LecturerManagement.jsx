// Lecturer Management Component for Admin
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
import { GraduationCap, UserPlus, Edit, Trash2, Search, RefreshCw, Shield } from 'lucide-react';
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
import { Checkbox } from '@/components/ui/checkbox';

export const LecturerManagement = () => {
  const [lecturers, setLecturers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingLecturer, setEditingLecturer] = useState(null);
  const [formData, setFormData] = useState({
    lecturer_name: '',
    email: '',
    department: '',
    faculty_id: 1,
    password: '',
    is_admin: false,
  });
  const [faculties, setFaculties] = useState([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchLecturers();
    fetchFaculties();
  }, []);

  const fetchLecturers = async () => {
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
      
      const response = await fetch('http://localhost:8000/admin/lecturers', {
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
        throw new Error(errorData.detail || 'Failed to fetch lecturers');
      }
      
      const data = await response.json();
      const lecturersList = data.lecturers || data || [];
      setLecturers(lecturersList);
      console.log(`Loaded ${lecturersList.length} lecturers`);
    } catch (error) {
      console.error('Fetch lecturers error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to fetch lecturers',
        variant: 'destructive',
      });
      setLecturers([]);
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
      const response = await fetch('http://localhost:8000/admin-management/lecturers/create', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to create lecturer');
      }

      toast({
        title: 'Success',
        description: 'Lecturer created successfully',
      });
      setIsCreateOpen(false);
      resetForm();
      fetchLecturers();
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleUpdate = async (lecturerId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/admin-management/lecturers/${lecturerId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to update lecturer');
      }

      toast({
        title: 'Success',
        description: 'Lecturer updated successfully',
      });
      setEditingLecturer(null);
      resetForm();
      fetchLecturers();
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (lecturerId) => {
    if (!confirm('Are you sure you want to delete this lecturer?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/admin-management/lecturers/${lecturerId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to delete lecturer');
      }

      toast({
        title: 'Success',
        description: 'Lecturer deleted successfully',
      });
      fetchLecturers();
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
      lecturer_name: '',
      email: '',
      department: '',
      faculty_id: 1,
      password: '',
      is_admin: false,
    });
  };

  const openEdit = (lecturer) => {
    setEditingLecturer(lecturer);
    setFormData({
      lecturer_name: lecturer.lecturer_name,
      email: lecturer.email,
      department: lecturer.department || '',
      faculty_id: lecturer.faculty_id || 1,
      password: '',
      is_admin: lecturer.is_admin || false,
    });
  };

  const filteredLecturers = lecturers.filter(l =>
    l.lecturer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.department?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <GraduationCap className="h-5 w-5 text-purple-600" />
          <h3 className="text-lg font-bold text-slate-900">Lecturer Management</h3>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search lecturers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          <Button variant="outline" size="sm" onClick={fetchLecturers}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <UserPlus className="h-4 w-4 mr-2" />
                Add Lecturer
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Lecturer</DialogTitle>
                <DialogDescription>Add a new lecturer to the system</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Full Name</Label>
                    <Input
                      value={formData.lecturer_name}
                      onChange={(e) => setFormData({ ...formData, lecturer_name: e.target.value })}
                      placeholder="Dr. Jane Smith"
                    />
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="lecturer@university.ac.ke"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Department</Label>
                    <Input
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      placeholder="Computer Science"
                    />
                  </div>
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
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Password</Label>
                    <Input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="Enter password"
                    />
                  </div>
                  <div className="flex items-center space-x-2 pt-8">
                    <Checkbox
                      id="is_admin"
                      checked={formData.is_admin}
                      onCheckedChange={(checked) => setFormData({ ...formData, is_admin: checked })}
                    />
                    <Label htmlFor="is_admin" className="flex items-center gap-2 cursor-pointer">
                      <Shield className="h-4 w-4 text-purple-600" />
                      Grant Admin Privileges
                    </Label>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                <Button onClick={handleCreate}>Create Lecturer</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Edit Dialog */}
      {editingLecturer && (
        <Dialog open={!!editingLecturer} onOpenChange={() => setEditingLecturer(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Lecturer</DialogTitle>
              <DialogDescription>Update lecturer information</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Full Name</Label>
                  <Input
                    value={formData.lecturer_name}
                    onChange={(e) => setFormData({ ...formData, lecturer_name: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Department</Label>
                  <Input
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  />
                </div>
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
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="edit_is_admin"
                  checked={formData.is_admin}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_admin: checked })}
                />
                <Label htmlFor="edit_is_admin" className="flex items-center gap-2 cursor-pointer">
                  <Shield className="h-4 w-4 text-purple-600" />
                  Grant Admin Privileges
                </Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingLecturer(null)}>Cancel</Button>
              <Button onClick={() => handleUpdate(editingLecturer.lecturer_id)}>Update Lecturer</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Lecturers Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Admin</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">Loading...</TableCell>
              </TableRow>
            ) : filteredLecturers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                  No lecturers found
                </TableCell>
              </TableRow>
            ) : (
              filteredLecturers.map((lecturer) => (
                <TableRow key={lecturer.lecturer_id}>
                  <TableCell className="font-medium">{lecturer.lecturer_name}</TableCell>
                  <TableCell>{lecturer.email}</TableCell>
                  <TableCell>{lecturer.department || 'N/A'}</TableCell>
                  <TableCell>
                    {lecturer.is_admin ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-700">
                        <Shield className="h-3 w-3 mr-1" />
                        Admin
                      </span>
                    ) : (
                      <span className="text-slate-400">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEdit(lecturer)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(lecturer.lecturer_id)}
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

