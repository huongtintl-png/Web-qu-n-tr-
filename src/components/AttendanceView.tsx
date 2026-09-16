import React, { useState, useMemo, useEffect } from 'react';
import {
  CalendarCheck2,
  ArrowLeft,
  Calendar,
  Save,
  CheckCircle2,
  AlertCircle,
  Clock,
  XCircle,
  Search,
  CheckCheck,
  History,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Student, AttendanceRecord, AttendanceStatus, AttendanceEntry } from '../types';

interface AttendanceViewProps {
  students: Student[];
  attendanceRecords: AttendanceRecord[];
  onSaveAttendance: (date: string, entries: Record<string, AttendanceEntry>) => void;
  onBackToHome: () => void;
}

export const AttendanceView: React.FC<AttendanceViewProps> = ({
  students,
  attendanceRecords,
  onSaveAttendance,
  onBackToHome,
}) => {
  const [selectedDate, setSelectedDate] = useState<string>('2026-09-16');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | AttendanceStatus>('all');

  // Find record for this date
  const existingRecord = useMemo(() => {
    return attendanceRecords.find((r) => r.date === selectedDate);
  }, [attendanceRecords, selectedDate]);

  // Working state for active attendance sheet
  const [workingEntries, setWorkingEntries] = useState<Record<string, AttendanceEntry>>({});

  // Sync entries whenever date or existingRecord changes
  useEffect(() => {
    const map: Record<string, AttendanceEntry> = {};
    students.forEach((student) => {
      if (existingRecord && existingRecord.entries[student.id]) {
        map[student.id] = { ...existingRecord.entries[student.id] };
      } else {
        // default all to 'present'
        map[student.id] = { status: 'present', note: '' };
      }
    });
    setWorkingEntries(map);
  }, [existingRecord, students, selectedDate]);

  // Bulk mark all present
  const handleMarkAllPresent = () => {
    const updated: Record<string, AttendanceEntry> = {};
    students.forEach((s) => {
      updated[s.id] = { status: 'present', note: '' };
    });
    setWorkingEntries(updated);
  };

  // Change individual student status
  const handleSetStatus = (studentId: string, status: AttendanceStatus) => {
    setWorkingEntries((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        status,
      },
    }));
  };

  // Change note
  const handleSetNote = (studentId: string, note: string) => {
    setWorkingEntries((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        note,
      },
    }));
  };

  // Save handler
  const handleSave = () => {
    onSaveAttendance(selectedDate, workingEntries);
  };

  // Date stepper
  const handleStepDate = (days: number) => {
    const curr = new Date(selectedDate);
    curr.setDate(curr.getDate() + days);
    setSelectedDate(curr.toISOString().split('T')[0]);
  };

  // Statistics calculation
  const stats = useMemo(() => {
    let present = 0;
    let excused = 0;
    let unexcused = 0;
    let late = 0;

    (Object.values(workingEntries) as AttendanceEntry[]).forEach((e) => {
      if (e.status === 'present') present++;
      else if (e.status === 'excused') excused++;
      else if (e.status === 'unexcused') unexcused++;
      else if (e.status === 'late') late++;
    });

    const total = students.length;
    return {
      total,
      present,
      excused,
      unexcused,
      late,
      attendanceRate: total > 0 ? Math.round((present / total) * 100) : 0,
    };
  }, [workingEntries, students]);

  // Filtered student list
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const matchSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase());
      const status = workingEntries[s.id]?.status || 'present';
      const matchStatus = activeFilter === 'all' || status === activeFilter;
      return matchSearch && matchStatus;
    });
  }, [students, searchQuery, activeFilter, workingEntries]);

  return (
    <div id="attendance-management-view" className="space-y-6 pb-12">
      {/* Top Header */}
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
              <CalendarCheck2 className="w-6 h-6 text-blue-600" />
              <span>Điểm Danh & Chuyên Cần Lớp 12A1</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Theo dõi chuyên cần hàng ngày, thống kê vắng học và đi muộn
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleMarkAllPresent}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs sm:text-sm font-bold border border-blue-200 transition-colors"
          >
            <CheckCheck className="w-4 h-4 text-blue-600" />
            <span>Tất cả có mặt</span>
          </button>
          <button
            id="btn-save-attendance"
            onClick={handleSave}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-sm shadow-sm transition-all"
          >
            <Save className="w-4 h-4" />
            <span>Lưu điểm danh</span>
          </button>
        </div>
      </div>

      {/* Date Picker Bar & Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-wrap items-center justify-between gap-4">
        {/* Date Stepper */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleStepDate(-1)}
            className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100"
            title="Ngày trước"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
            <Calendar className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-semibold text-slate-500 hidden sm:inline">Ngày điểm danh:</span>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent text-sm font-bold text-slate-800 focus:outline-none cursor-pointer"
            />
          </div>

          <button
            onClick={() => handleStepDate(1)}
            className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100"
            title="Ngày tiếp"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
            className="text-xs font-bold text-blue-600 hover:underline px-2"
          >
            Hôm nay
          </button>
        </div>

        {/* Search & Filter */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm học sinh..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <select
            value={activeFilter}
            onChange={(e) => setActiveFilter(e.target.value as any)}
            className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Mọi trạng thái</option>
            <option value="present">Có mặt</option>
            <option value="excused">Nghỉ có phép</option>
            <option value="unexcused">Nghỉ không phép</option>
            <option value="late">Đi muộn</option>
          </select>
        </div>
      </div>

      {/* REQUIRED 5 STATISTICAL INDICATORS */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4">
        {/* 1. Tổng số học sinh */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs text-center">
          <div className="text-xs font-semibold text-slate-500 mb-1">Tổng Số Học Sinh</div>
          <div className="text-2xl font-black text-slate-800">{stats.total}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Sĩ số lớp 12A1</div>
        </div>

        {/* 2. Có mặt */}
        <div className="bg-white p-4 rounded-2xl border border-emerald-200 shadow-xs text-center bg-emerald-50/20">
          <div className="text-xs font-bold text-emerald-700 flex items-center justify-center gap-1 mb-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Có Mặt
          </div>
          <div className="text-2xl font-black text-emerald-700">{stats.present}</div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-0.5">
            {stats.attendanceRate}% chuyên cần
          </div>
        </div>

        {/* 3. Nghỉ có phép */}
        <div className="bg-white p-4 rounded-2xl border border-amber-200 shadow-xs text-center bg-amber-50/20">
          <div className="text-xs font-bold text-amber-700 flex items-center justify-center gap-1 mb-1">
            <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
            Nghỉ Có Phép
          </div>
          <div className="text-2xl font-black text-amber-700">{stats.excused}</div>
          <div className="text-[11px] text-amber-600 mt-0.5">Đã nộp đơn/gọi điện</div>
        </div>

        {/* 4. Nghỉ không phép */}
        <div className="bg-white p-4 rounded-2xl border border-rose-200 shadow-xs text-center bg-rose-50/20">
          <div className="text-xs font-bold text-rose-700 flex items-center justify-center gap-1 mb-1">
            <XCircle className="w-3.5 h-3.5 text-rose-600" />
            Nghỉ Không Phép
          </div>
          <div className="text-2xl font-black text-rose-700">{stats.unexcused}</div>
          <div className="text-[11px] text-rose-600 mt-0.5">Cần báo gia đình</div>
        </div>

        {/* 5. Đi muộn */}
        <div className="bg-white p-4 rounded-2xl border border-blue-200 shadow-xs text-center bg-blue-50/20 col-span-2 sm:col-span-1">
          <div className="text-xs font-bold text-blue-700 flex items-center justify-center gap-1 mb-1">
            <Clock className="w-3.5 h-3.5 text-blue-600" />
            Đi Muộn
          </div>
          <div className="text-2xl font-black text-blue-700">{stats.late}</div>
          <div className="text-[11px] text-blue-600 mt-0.5">Sau 7h00 sáng</div>
        </div>
      </div>

      {/* Attendance Grid & Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <CalendarCheck2 className="w-4 h-4 text-blue-600" />
            Danh Sách Điểm Danh Ngày: {new Date(selectedDate).toLocaleDateString('vi-VN')}
          </h3>
          <span className="text-xs text-slate-500">
            Hiển thị: <strong>{filteredStudents.length}</strong> học sinh
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="bg-slate-50/60 border-b border-slate-200 text-xs uppercase text-slate-500 font-bold">
              <tr>
                <th className="px-4 py-3 w-12 text-center">STT</th>
                <th className="px-4 py-3 w-56">Học sinh</th>
                <th className="px-4 py-3 text-center w-80">Trạng thái điểm danh</th>
                <th className="px-4 py-3">Ghi chú (Lý do nghỉ/muộn)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.map((student, idx) => {
                const entry = workingEntries[student.id] || { status: 'present', note: '' };

                return (
                  <tr
                    key={student.id}
                    className={`hover:bg-slate-50/70 transition-colors ${
                      entry.status === 'unexcused'
                        ? 'bg-rose-50/20'
                        : entry.status === 'excused'
                        ? 'bg-amber-50/20'
                        : entry.status === 'late'
                        ? 'bg-blue-50/20'
                        : ''
                    }`}
                  >
                    <td className="px-4 py-3 text-center text-xs text-slate-400 font-bold">
                      {idx + 1}
                    </td>

                    <td className="px-4 py-3">
                      <div className="font-bold text-slate-900">{student.name}</div>
                      <div className="text-[11px] text-slate-400">
                        {student.gender} • {student.role}
                      </div>
                    </td>

                    {/* Touch-Friendly Action Buttons */}
                    <td className="px-4 py-3 text-center">
                      <div className="inline-flex rounded-xl p-1 bg-slate-100 gap-1">
                        {/* Có mặt */}
                        <button
                          type="button"
                          onClick={() => handleSetStatus(student.id, 'present')}
                          className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            entry.status === 'present'
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'text-slate-600 hover:text-emerald-700 hover:bg-emerald-50'
                          }`}
                        >
                          Có mặt
                        </button>

                        {/* Có phép */}
                        <button
                          type="button"
                          onClick={() => handleSetStatus(student.id, 'excused')}
                          className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            entry.status === 'excused'
                              ? 'bg-amber-500 text-white shadow-xs'
                              : 'text-slate-600 hover:text-amber-700 hover:bg-amber-50'
                          }`}
                        >
                          Có phép
                        </button>

                        {/* Không phép */}
                        <button
                          type="button"
                          onClick={() => handleSetStatus(student.id, 'unexcused')}
                          className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            entry.status === 'unexcused'
                              ? 'bg-rose-600 text-white shadow-xs'
                              : 'text-slate-600 hover:text-rose-700 hover:bg-rose-50'
                          }`}
                        >
                          Không phép
                        </button>

                        {/* Đi muộn */}
                        <button
                          type="button"
                          onClick={() => handleSetStatus(student.id, 'late')}
                          className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            entry.status === 'late'
                              ? 'bg-blue-600 text-white shadow-xs'
                              : 'text-slate-600 hover:text-blue-700 hover:bg-blue-50'
                          }`}
                        >
                          Đi muộn
                        </button>
                      </div>
                    </td>

                    {/* Ghi chú */}
                    <td className="px-4 py-3">
                      <input
                        type="text"
                        placeholder={
                          entry.status === 'excused'
                            ? 'Nhập lý do có phép (VD: Ốm sốt, việc gia đình)'
                            : entry.status === 'unexcused'
                            ? 'Chưa rõ lý do (cần gọi điện PH)'
                            : entry.status === 'late'
                            ? 'Số phút muộn, nguyên nhân'
                            : 'Ghi chú thêm...'
                        }
                        value={entry.note || ''}
                        onChange={(e) => handleSetNote(student.id, e.target.value)}
                        className="w-full px-3 py-1.5 text-xs sm:text-sm rounded-lg border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer save note */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div>
            Dữ liệu điểm danh được lưu trữ trực tiếp vào hệ thống quản lý chuyên cần của lớp.
          </div>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-sm transition-all"
          >
            <Save className="w-4 h-4" />
            <span>Lưu dữ liệu điểm danh ngày {new Date(selectedDate).toLocaleDateString('vi-VN')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
