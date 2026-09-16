import React, { useState, useMemo } from 'react';
import {
  Users,
  Search,
  Plus,
  Edit2,
  Trash2,
  Eye,
  ArrowLeft,
  X,
  Phone,
  Calendar,
  MapPin,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  FileSpreadsheet,
  Download,
  CheckSquare,
} from 'lucide-react';
import { Student, Gender, StudentRole, StudentStatus } from '../types';
import { ExcelImportModal } from './ExcelImportModal';
import { exportStudentsToExcel } from '../utils/excelUtils';

interface StudentsViewProps {
  students: Student[];
  onAddStudent: (student: Omit<Student, 'id' | 'stt'>) => void;
  onAddMultipleStudents?: (students: Omit<Student, 'id' | 'stt'>[], mode: 'append' | 'replace') => void;
  onUpdateStudent: (student: Student) => void;
  onDeleteStudent: (id: string) => void;
  onDeleteMultipleStudents?: (ids: string[]) => void;
  onBackToHome: () => void;
  className?: string;
  schoolName?: string;
  academicYear?: string;
}

export const StudentsView: React.FC<StudentsViewProps> = ({
  students,
  onAddStudent,
  onAddMultipleStudents,
  onUpdateStudent,
  onDeleteStudent,
  onDeleteMultipleStudents,
  onBackToHome,
  className = '12A1',
  schoolName = 'THPT Nguyễn Văn An',
  academicYear = '2026-2027',
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [genderFilter, setGenderFilter] = useState<'all' | 'Nam' | 'Nữ'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | StudentStatus>('all');

  // Selection states for batch operations
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBatchMenuOpen, setIsBatchMenuOpen] = useState(false);
  const [isBatchDeleteModalOpen, setIsBatchDeleteModalOpen] = useState(false);
  const [batchDeleteType, setBatchDeleteType] = useState<'selected' | 'all'>('selected');

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isExcelModalOpen, setIsExcelModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [viewingStudent, setViewingStudent] = useState<Student | null>(null);
  const [deletingStudentId, setDeletingStudentId] = useState<string | null>(null);

  // Form State for Add / Edit
  const [formData, setFormData] = useState({
    name: '',
    dob: '2009-01-01',
    gender: 'Nam' as Gender,
    phone: '',
    parentName: '',
    parentPhone: '',
    address: '',
    role: 'Học sinh' as StudentRole,
    status: 'Đang học' as StudentStatus,
    notes: '',
  });

  // Filter students
  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const matchSearch =
        student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.phone.includes(searchQuery) ||
        student.parentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.parentPhone.includes(searchQuery);

      const matchGender = genderFilter === 'all' || student.gender === genderFilter;
      const matchStatus = statusFilter === 'all' || student.status === statusFilter;

      return matchSearch && matchGender && matchStatus;
    });
  }, [students, searchQuery, genderFilter, statusFilter]);

  // Keep selected IDs valid against existing student list
  const validSelectedIds = useMemo(() => {
    const studentIdSet = new Set(students.map((s) => s.id));
    return selectedIds.filter((id) => studentIdSet.has(id));
  }, [selectedIds, students]);

  const isAllFilteredSelected = useMemo(() => {
    return (
      filteredStudents.length > 0 &&
      filteredStudents.every((s) => validSelectedIds.includes(s.id))
    );
  }, [filteredStudents, validSelectedIds]);

  const isSomeFilteredSelected = useMemo(() => {
    return (
      filteredStudents.some((s) => validSelectedIds.includes(s.id)) &&
      !isAllFilteredSelected
    );
  }, [filteredStudents, validSelectedIds, isAllFilteredSelected]);

  const toggleSelectStudent = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleSelectAllFiltered = () => {
    const filteredIds = filteredStudents.map((s) => s.id);
    if (isAllFilteredSelected) {
      setSelectedIds((prev) => prev.filter((id) => !filteredIds.includes(id)));
    } else {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...filteredIds])));
    }
  };

  const handleSelectAll = () => {
    setSelectedIds(students.map((s) => s.id));
  };

  const handleDeselectAll = () => {
    setSelectedIds([]);
  };

  const targetStudentsForDelete = useMemo(() => {
    if (batchDeleteType === 'all') return students;
    const set = new Set(validSelectedIds);
    return students.filter((s) => set.has(s.id));
  }, [batchDeleteType, students, validSelectedIds]);

  const confirmBatchDelete = () => {
    const targetIds = batchDeleteType === 'all' ? students.map((s) => s.id) : validSelectedIds;
    if (targetIds.length === 0) return;

    if (onDeleteMultipleStudents) {
      onDeleteMultipleStudents(targetIds);
    } else {
      targetIds.forEach((id) => onDeleteStudent(id));
    }

    setSelectedIds([]);
    setIsBatchDeleteModalOpen(false);
  };

  const handleOpenAddModal = () => {
    setFormData({
      name: '',
      dob: '2009-05-15',
      gender: 'Nam',
      phone: '',
      parentName: '',
      parentPhone: '',
      address: '',
      role: 'Học sinh',
      status: 'Đang học',
      notes: '',
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (student: Student) => {
    setEditingStudent(student);
    setFormData({
      name: student.name,
      dob: student.dob,
      gender: student.gender,
      phone: student.phone,
      parentName: student.parentName,
      parentPhone: student.parentPhone,
      address: student.address,
      role: student.role,
      status: student.status,
      notes: student.notes || '',
    });
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    if (editingStudent) {
      onUpdateStudent({
        ...editingStudent,
        ...formData,
      });
      setEditingStudent(null);
    } else {
      onAddStudent(formData);
      setIsAddModalOpen(false);
    }
  };

  const confirmDelete = () => {
    if (deletingStudentId) {
      onDeleteStudent(deletingStudentId);
      // Remove from selected list if present
      setSelectedIds((prev) => prev.filter((id) => id !== deletingStudentId));
      setDeletingStudentId(null);
    }
  };

  const handleExportExcel = () => {
    exportStudentsToExcel(students, className, schoolName, academicYear);
  };

  const handleImportExcelSuccess = (
    importedStudents: Omit<Student, 'id' | 'stt'>[],
    mode: 'append' | 'replace'
  ) => {
    if (onAddMultipleStudents) {
      onAddMultipleStudents(importedStudents, mode);
    } else {
      // Fallback: add sequentially
      importedStudents.forEach((st) => onAddStudent(st));
    }
  };

  return (
    <div id="students-management-view" className="space-y-6 pb-12">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToHome}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
            title="Quay lại Trang chủ"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <Users className="w-6 h-6 text-blue-600" />
              <span>Danh Sách Học Sinh</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Tổng số: <strong>{students.length}</strong> học sinh ({students.filter((s) => s.gender === 'Nam').length} Nam, {students.filter((s) => s.gender === 'Nữ').length} Nữ)
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
          <button
            id="btn-import-excel"
            onClick={() => setIsExcelModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 font-bold text-xs sm:text-sm shadow-2xs transition-all active:scale-95"
            title="Nhập danh sách học sinh từ file Excel (.xlsx, .xls, .csv)"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Nhập từ Excel</span>
          </button>

          <button
            id="btn-export-excel"
            onClick={handleExportExcel}
            className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 border border-slate-200 text-slate-700 font-semibold text-xs sm:text-sm shadow-2xs transition-all active:scale-95"
            title="Xuất danh sách học sinh ra file Excel"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span className="hidden sm:inline">Xuất Excel</span>
          </button>

          {/* NÚT THAO TÁC XOÁ HÀNG LOẠT */}
          <div className="relative">
            <button
              id="btn-batch-delete-main"
              onClick={() => {
                if (validSelectedIds.length > 0) {
                  setBatchDeleteType('selected');
                  setIsBatchDeleteModalOpen(true);
                } else {
                  setIsBatchMenuOpen(!isBatchMenuOpen);
                }
              }}
              disabled={students.length === 0}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl font-bold text-xs sm:text-sm border shadow-2xs transition-all active:scale-95 disabled:opacity-40 disabled:pointer-events-none ${
                validSelectedIds.length > 0
                  ? 'bg-rose-600 hover:bg-rose-700 text-white border-rose-600 shadow-rose-100'
                  : 'bg-rose-50 hover:bg-rose-100/90 text-rose-700 border-rose-200'
              }`}
              title="Xóa hàng loạt học sinh khỏi danh sách lớp"
            >
              <Trash2 className={`w-4 h-4 ${validSelectedIds.length > 0 ? 'text-white' : 'text-rose-600'}`} />
              <span>
                {validSelectedIds.length > 0
                  ? `Xóa (${validSelectedIds.length}) đã chọn`
                  : 'Xóa hàng loạt'}
              </span>
            </button>

            {/* Dropdown Options for Batch Delete when no student or to select all */}
            {isBatchMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-20"
                  onClick={() => setIsBatchMenuOpen(false)}
                />
                <div
                  id="dropdown-batch-delete-menu"
                  className="absolute right-0 top-full mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200/90 p-2 z-30 animate-in fade-in zoom-in-95 duration-150"
                >
                  <div className="px-3 py-2 border-b border-slate-100 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    Thao tác xóa hàng loạt
                  </div>
                  <div className="p-1 space-y-1">
                    <button
                      type="button"
                      id="btn-menu-select-all-filtered"
                      onClick={() => {
                        handleSelectAll();
                        setIsBatchMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-700 rounded-xl transition-colors flex items-center justify-between"
                    >
                      <span>Chọn tất cả ({students.length} học sinh)</span>
                      <CheckSquare className="w-3.5 h-3.5 text-slate-400" />
                    </button>
                    {validSelectedIds.length > 0 && (
                      <button
                        type="button"
                        id="btn-menu-delete-selected"
                        onClick={() => {
                          setIsBatchMenuOpen(false);
                          setBatchDeleteType('selected');
                          setIsBatchDeleteModalOpen(true);
                        }}
                        className="w-full text-left px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors flex items-center justify-between"
                      >
                        <span>Xóa {validSelectedIds.length} học sinh đang chọn</span>
                        <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                      </button>
                    )}
                    <div className="border-t border-slate-100 my-1 pt-1">
                      <button
                        type="button"
                        id="btn-menu-clear-all"
                        onClick={() => {
                          setIsBatchMenuOpen(false);
                          setBatchDeleteType('all');
                          setIsBatchDeleteModalOpen(true);
                        }}
                        className="w-full text-left px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors flex items-center justify-between"
                      >
                        <div>
                          <div>Xóa toàn bộ danh sách lớp</div>
                          <div className="text-[10px] font-normal text-rose-400">Xóa hết {students.length} học sinh</div>
                        </div>
                        <Trash2 className="w-4 h-4 text-rose-500" />
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          <button
            id="btn-add-student"
            onClick={handleOpenAddModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-xs sm:text-sm shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>+ Thêm học sinh</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        {/* Search input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            id="input-search-student"
            type="text"
            placeholder="Tìm kiếm theo tên, SĐT, phụ huynh..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter controls */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Gender Filter */}
          <select
            value={genderFilter}
            onChange={(e) => setGenderFilter(e.target.value as any)}
            className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Tất cả giới tính</option>
            <option value="Nam">Giới tính: Nam</option>
            <option value="Nữ">Giới tính: Nữ</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="Đang học">Đang học</option>
            <option value="Chuyển trường">Chuyển trường</option>
            <option value="Nghỉ học">Nghỉ học</option>
          </select>

          <span className="text-xs text-slate-400 font-medium pl-2 hidden sm:inline">
            Tìm thấy: <strong>{filteredStudents.length}</strong> kết quả
          </span>
        </div>
      </div>

      {/* THANH THAO TÁC CHỌN HÀNG LOẠT (HIỆN KHI CÓ HỌC SINH ĐƯỢC TÍCH CHỌN) */}
      {validSelectedIds.length > 0 && (
        <div
          id="batch-selection-banner"
          className="bg-blue-50/90 border border-blue-200/90 rounded-2xl p-3.5 px-4 sm:px-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs animate-in fade-in slide-in-from-top-2 duration-150"
        >
          <div className="flex items-center gap-3">
            <span className="flex items-center justify-center w-7 h-7 rounded-xl bg-blue-600 text-white text-xs font-black shadow-xs shrink-0">
              {validSelectedIds.length}
            </span>
            <div>
              <p className="text-sm font-bold text-blue-950">
                Đã chọn <span className="text-blue-700">{validSelectedIds.length}</span> / {students.length} học sinh
              </p>
              <p className="text-xs text-blue-700/80">
                {isAllFilteredSelected
                  ? 'Đã chọn toàn bộ học sinh đang hiển thị trong kết quả lọc'
                  : 'Tích vào ô kiểm bên trái từng học sinh để chọn thêm'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              id="btn-batch-toggle-filtered"
              onClick={toggleSelectAllFiltered}
              className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-blue-200 text-xs font-semibold text-blue-800 transition-colors shadow-2xs"
            >
              {isAllFilteredSelected ? 'Bỏ chọn trang này' : `Chọn cả ${filteredStudents.length} em đang lọc`}
            </button>
            <button
              type="button"
              id="btn-batch-select-all"
              onClick={handleSelectAll}
              className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-blue-200 text-xs font-semibold text-blue-800 transition-colors shadow-2xs"
            >
              Chọn tất cả ({students.length})
            </button>
            <button
              type="button"
              id="btn-batch-deselect-all"
              onClick={handleDeselectAll}
              className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-xs font-medium text-slate-600 transition-colors shadow-2xs"
            >
              Bỏ chọn
            </button>
            <button
              type="button"
              id="btn-trigger-delete-selected"
              onClick={() => {
                setBatchDeleteType('selected');
                setIsBatchDeleteModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-95 text-white text-xs font-bold shadow-xs transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Xóa {validSelectedIds.length} học sinh</span>
            </button>
          </div>
        </div>
      )}

      {/* Student Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-xs uppercase text-slate-500 font-bold tracking-wider">
              <tr>
                {/* Checkbox chọn hàng loạt */}
                <th className="px-3 py-3.5 w-11 text-center">
                  <input
                    type="checkbox"
                    id="checkbox-select-all-students"
                    checked={isAllFilteredSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = isSomeFilteredSelected;
                    }}
                    onChange={toggleSelectAllFiltered}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 cursor-pointer"
                    title={isAllFilteredSelected ? 'Bỏ chọn tất cả' : 'Chọn tất cả học sinh đang hiển thị'}
                  />
                </th>
                <th className="px-3 py-3.5 w-12 text-center">STT</th>
                <th className="px-4 py-3.5">Họ và tên</th>
                <th className="px-4 py-3.5">Ngày sinh</th>
                <th className="px-4 py-3.5">Giới tính</th>
                <th className="px-4 py-3.5">Số điện thoại</th>
                <th className="px-4 py-3.5">Phụ huynh</th>
                <th className="px-4 py-3.5 text-center">Trạng thái</th>
                <th className="px-4 py-3.5 text-center w-28">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-slate-400">
                    Không tìm thấy học sinh nào phù hợp với điều kiện tìm kiếm.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student, index) => {
                  const isSelected = validSelectedIds.includes(student.id);
                  return (
                    <tr
                      key={student.id}
                      id={`student-row-${student.id}`}
                      className={`transition-colors ${
                        isSelected
                          ? 'bg-blue-50/70 hover:bg-blue-100/60'
                          : 'hover:bg-slate-50/80'
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="px-3 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          id={`checkbox-student-${student.id}`}
                          checked={isSelected}
                          onChange={() => toggleSelectStudent(student.id)}
                          className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 cursor-pointer"
                          title="Tích chọn học sinh để xóa hoặc thao tác hàng loạt"
                        />
                      </td>

                      <td className="px-3 py-3 text-center font-semibold text-slate-500 text-xs">
                        {index + 1}
                      </td>

                    {/* Họ và tên */}
                    <td className="px-4 py-3 font-semibold text-slate-900">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                            student.gender === 'Nam'
                              ? 'bg-sky-100 text-sky-700'
                              : 'bg-rose-100 text-rose-700'
                          }`}
                        >
                          {student.name.split(' ').slice(-1)[0].charAt(0)}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                            <span>{student.name}</span>
                            {student.role !== 'Học sinh' && (
                              <span className="text-[10px] font-semibold px-2 py-0.2 rounded-full bg-blue-100 text-blue-700">
                                {student.role}
                              </span>
                            )}
                          </div>
                          {student.notes && (
                            <p className="text-xs text-slate-400 font-normal line-clamp-1">
                              {student.notes}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Ngày sinh */}
                    <td className="px-4 py-3 text-slate-600 text-xs font-medium whitespace-nowrap">
                      {new Date(student.dob).toLocaleDateString('vi-VN')}
                    </td>

                    {/* Giới tính */}
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                          student.gender === 'Nam'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {student.gender}
                      </span>
                    </td>

                    {/* SĐT học sinh */}
                    <td className="px-4 py-3 text-xs text-slate-600 font-mono whitespace-nowrap">
                      {student.phone || '—'}
                    </td>

                    {/* Phụ huynh */}
                    <td className="px-4 py-3 text-xs text-slate-700">
                      <div className="font-medium text-slate-800">{student.parentName}</div>
                      <div className="text-slate-500 font-mono flex items-center gap-1">
                        <Phone className="w-3 h-3 text-emerald-600" />
                        <span>{student.parentPhone}</span>
                      </div>
                    </td>

                    {/* Trạng thái */}
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`inline-block text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${
                          student.status === 'Đang học'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : student.status === 'Chuyển trường'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {student.status}
                      </span>
                    </td>

                    {/* Thao tác */}
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          id={`btn-view-${student.id}`}
                          onClick={() => setViewingStudent(student)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          title="Xem chi tiết"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          id={`btn-edit-${student.id}`}
                          onClick={() => handleOpenEditModal(student)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                          title="Chỉnh sửa"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          id={`btn-delete-${student.id}`}
                          onClick={() => setDeletingStudentId(student.id)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Xóa"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: Thêm / Sửa học sinh */}
      {(isAddModalOpen || editingStudent) && (
        <div
          id="modal-student-form"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto"
        >
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-100 my-8 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-lg font-bold text-slate-900">
                {editingStudent ? 'Chỉnh sửa thông tin học sinh' : 'Thêm học sinh mới vào lớp'}
              </h3>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingStudent(null);
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick banner to switch to Excel import if adding a new student */}
            {!editingStudent && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-50/90 border border-emerald-200 flex items-center justify-between gap-3 text-xs text-emerald-900">
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    Có sẵn file danh sách? <strong>Tải file Excel lên</strong> để thêm hàng loạt.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setIsExcelModalOpen(true);
                  }}
                  className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold shrink-0 transition-colors shadow-2xs"
                >
                  Nhập từ Excel
                </button>
              </div>
            )}

            <form onSubmit={handleSubmitForm} className="space-y-4">
              {/* Row 1: Name & Gender */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Họ và tên học sinh <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="VD: Nguyễn Văn A"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Giới tính</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value as Gender })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  >
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                  </select>
                </div>
              </div>

              {/* Row 2: DOB & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Ngày sinh</label>
                  <input
                    type="date"
                    value={formData.dob}
                    onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Số điện thoại HS
                  </label>
                  <input
                    type="text"
                    placeholder="0912 345 678"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
              </div>

              {/* Row 3: Parent Name & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Họ tên Phụ huynh
                  </label>
                  <input
                    type="text"
                    placeholder="VD: Nguyễn Văn B (Bố)"
                    value={formData.parentName}
                    onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Số điện thoại Phụ huynh
                  </label>
                  <input
                    type="text"
                    placeholder="0988 111 222"
                    value={formData.parentPhone}
                    onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
              </div>

              {/* Row 4: Address */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Địa chỉ thường trú
                </label>
                <input
                  type="text"
                  placeholder="Số nhà, đường phố, phường/xã, quận/huyện..."
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>

              {/* Row 5: Role & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Chức vụ</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as StudentRole })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  >
                    <option value="Học sinh">Học sinh</option>
                    <option value="Lớp trưởng">Lớp trưởng</option>
                    <option value="Lớp phó">Lớp phó</option>
                    <option value="Bí thư">Bí thư</option>
                    <option value="Tổ trưởng">Tổ trưởng</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Trạng thái</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as StudentStatus })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  >
                    <option value="Đang học">Đang học</option>
                    <option value="Chuyển trường">Chuyển trường</option>
                    <option value="Nghỉ học">Nghỉ học</option>
                  </select>
                </div>
              </div>

              {/* Row 6: Notes */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Ghi chú riêng của GVCN
                </label>
                <textarea
                  rows={2}
                  placeholder="Đặc điểm học lực, nề nếp, hoàn cảnh gia đình..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingStudent(null);
                  }}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition-all"
                >
                  {editingStudent ? 'Lưu thay đổi' : 'Lưu học sinh'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* POPUP: Xem chi tiết học sinh */}
      {viewingStudent && (
        <div
          id="modal-student-detail"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs"
        >
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-3">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-base shadow-sm ${
                    viewingStudent.gender === 'Nam'
                      ? 'bg-blue-600 text-white'
                      : 'bg-rose-500 text-white'
                  }`}
                >
                  {viewingStudent.name.split(' ').slice(-1)[0].charAt(0)}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">{viewingStudent.name}</h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                      {viewingStudent.role}
                    </span>
                    <span className="text-xs text-slate-400">STT: {viewingStudent.stt}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setViewingStudent(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-sm">
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                <div>
                  <span className="text-xs text-slate-400 block">Ngày sinh</span>
                  <strong className="text-slate-800">
                    {new Date(viewingStudent.dob).toLocaleDateString('vi-VN')}
                  </strong>
                </div>
                <div>
                  <span className="text-xs text-slate-400 block">Giới tính</span>
                  <strong className="text-slate-800">{viewingStudent.gender}</strong>
                </div>
                <div>
                  <span className="text-xs text-slate-400 block">Số điện thoại HS</span>
                  <strong className="text-slate-800 font-mono">{viewingStudent.phone || 'Chưa cập nhật'}</strong>
                </div>
                <div>
                  <span className="text-xs text-slate-400 block">Trạng thái</span>
                  <strong className="text-emerald-600">{viewingStudent.status}</strong>
                </div>
              </div>

              <div className="bg-blue-50/60 p-3.5 rounded-xl border border-blue-100 space-y-1.5">
                <span className="text-xs font-bold text-blue-700 uppercase tracking-wider block">
                  Thông tin Liên hệ Phụ huynh
                </span>
                <div className="text-slate-800 font-semibold">{viewingStudent.parentName}</div>
                <div className="text-slate-600 text-xs flex items-center gap-1.5 font-mono">
                  <Phone className="w-3.5 h-3.5 text-emerald-600" />
                  <strong>{viewingStudent.parentPhone}</strong>
                </div>
                <div className="text-slate-600 text-xs flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  <span>{viewingStudent.address || 'Chưa cập nhật địa chỉ'}</span>
                </div>
              </div>

              {viewingStudent.notes && (
                <div className="bg-amber-50/60 p-3.5 rounded-xl border border-amber-100">
                  <span className="text-xs font-bold text-amber-800 uppercase tracking-wider block mb-1">
                    Ghi chú GVCN
                  </span>
                  <p className="text-xs text-slate-700 leading-relaxed">{viewingStudent.notes}</p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-100">
              <button
                onClick={() => {
                  const student = viewingStudent;
                  setViewingStudent(null);
                  handleOpenEditModal(student);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-blue-600 hover:bg-blue-50 transition-colors"
              >
                <Edit2 className="w-3.5 h-3.5" />
                Chỉnh sửa thông tin
              </button>
              <button
                onClick={() => setViewingStudent(null)}
                className="px-4 py-2 rounded-xl text-sm font-bold text-white bg-slate-800 hover:bg-slate-900 shadow-sm"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRMATION DIALOG: Xóa học sinh */}
      {deletingStudentId && (
        <div
          id="modal-confirm-delete"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs"
        >
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-3">
              <Trash2 className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-slate-900 text-center mb-1">
              Xác nhận xóa học sinh?
            </h4>
            <p className="text-xs text-slate-500 text-center mb-5">
              Bạn có chắc muốn xóa dữ liệu học sinh này khỏi danh sách lớp? Thao tác này không thể hoàn tác.
            </p>

            <div className="flex items-center justify-center gap-2.5">
              <button
                onClick={() => setDeletingStudentId(null)}
                className="w-1/2 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 hover:bg-slate-100"
              >
                Hủy bỏ
              </button>
              <button
                id="btn-confirm-delete-student"
                onClick={confirmDelete}
                className="w-1/2 py-2 rounded-xl text-xs sm:text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-sm"
              >
                Xóa vĩnh viễn
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRMATION DIALOG: XÓA HÀNG LOẠT HỌC SINH */}
      {isBatchDeleteModalOpen && (
        <div
          id="modal-confirm-batch-delete"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs"
        >
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200 my-8">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-3">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-extrabold text-slate-900 text-center mb-1">
              {batchDeleteType === 'all'
                ? `Cảnh báo: Xóa toàn bộ ${students.length} học sinh?`
                : `Xác nhận xóa hàng loạt (${targetStudentsForDelete.length} học sinh)?`}
            </h4>
            <p className="text-xs text-slate-500 text-center mb-4 leading-relaxed">
              {batchDeleteType === 'all'
                ? `Thao tác này sẽ xóa sạch dữ liệu của toàn bộ ${students.length} học sinh trong lớp. Thao tác không thể hoàn tác.`
                : `Bạn đang chuẩn bị xóa ${targetStudentsForDelete.length} học sinh được chọn. Thứ tự STT của các học sinh còn lại sẽ được tự động đánh số lại từ 1.`}
            </p>

            {/* Danh sách học sinh preview */}
            <div className="mb-4">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-1.5 px-1">
                <span>Danh sách học sinh sẽ xóa:</span>
                <span className="text-rose-600 font-bold">{targetStudentsForDelete.length} em</span>
              </div>
              <div className="max-h-48 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50/80 p-2 space-y-1.5 text-xs">
                {targetStudentsForDelete.length === 0 ? (
                  <p className="text-center py-4 text-slate-400">Không có học sinh nào được chọn.</p>
                ) : (
                  targetStudentsForDelete.map((st, i) => (
                    <div
                      key={st.id}
                      className="flex items-center justify-between p-2 bg-white rounded-lg border border-slate-200/60 shadow-2xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-5 text-slate-400 font-mono font-semibold">{i + 1}.</span>
                        <span className="font-bold text-slate-800">{st.name}</span>
                        <span
                          className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                            st.gender === 'Nam'
                              ? 'bg-blue-50 text-blue-700'
                              : 'bg-rose-50 text-rose-700'
                          }`}
                        >
                          {st.gender}
                        </span>
                      </div>
                      <span className="text-slate-400 font-mono text-[11px]">
                        {new Date(st.dob).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {batchDeleteType === 'all' && (
              <div className="mb-4 p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  Gợi ý: Nếu muốn sao lưu danh sách trước khi xóa sạch, bạn nên nhấn <strong>Hủy bỏ</strong> và sử dụng tính năng <strong>Xuất Excel</strong> trước.
                </span>
              </div>
            )}

            <div className="flex items-center justify-center gap-2.5 pt-2">
              <button
                type="button"
                id="btn-cancel-batch-delete"
                onClick={() => setIsBatchDeleteModalOpen(false)}
                className="w-1/2 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                id="btn-confirm-batch-delete"
                onClick={confirmBatchDelete}
                disabled={targetStudentsForDelete.length === 0}
                className="w-1/2 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 active:scale-95 disabled:opacity-50 shadow-sm transition-all flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>
                  {batchDeleteType === 'all'
                    ? 'Xóa tất cả'
                    : `Xóa (${targetStudentsForDelete.length}) em`}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
      {/* EXCEL IMPORT MODAL */}
      <ExcelImportModal
        isOpen={isExcelModalOpen}
        onClose={() => setIsExcelModalOpen(false)}
        currentStudentCount={students.length}
        onImportSuccess={handleImportExcelSuccess}
      />
    </div>
  );
};
