import React, { useState } from 'react';
import {
  School,
  User,
  Calendar,
  PlusCircle,
  Users2,
  Wallet,
  Award,
  CheckCircle2,
  ChevronRight,
  BookOpen,
} from 'lucide-react';
import { ClassConfig, Student, AttendanceRecord, FinanceTransaction, ConductRecord, AttendanceEntry, StudentConductEntry } from '../types';

interface ClassHeaderBannerProps {
  config: ClassConfig;
  students: Student[];
  attendanceRecords: AttendanceRecord[];
  transactions: FinanceTransaction[];
  conductRecords: ConductRecord[];
  onAddClass: (newClassName: string) => void;
  onSelectClass: (className: string) => void;
}

export const ClassHeaderBanner: React.FC<ClassHeaderBannerProps> = ({
  config,
  students,
  attendanceRecords,
  transactions,
  conductRecords,
  onAddClass,
  onSelectClass,
}) => {
  const [showAddClassModal, setShowAddClassModal] = useState(false);
  const [newClassNameInput, setNewClassNameInput] = useState('');

  // Calculate live stats
  const totalStudents = students.filter((s) => s.status === 'Đang học').length;
  const maleCount = students.filter((s) => s.gender === 'Nam' && s.status === 'Đang học').length;
  const femaleCount = students.filter((s) => s.gender === 'Nữ' && s.status === 'Đang học').length;

  // Attendance for latest date
  const latestAttendance = attendanceRecords[0];
  let presentCount = 0;
  if (latestAttendance) {
    presentCount = (Object.values(latestAttendance.entries) as AttendanceEntry[]).filter((e) => e.status === 'present').length;
  }

  // Current balance
  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  const balance = totalIncome - totalExpense;

  // Conduct summary
  const latestConduct = conductRecords[0];
  let goodConductCount = 0;
  if (latestConduct) {
    goodConductCount = (Object.values(latestConduct.entries) as StudentConductEntry[]).filter((e) => e.rating === 'Tốt').length;
  }

  const handleCreateClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassNameInput.trim()) return;
    onAddClass(newClassNameInput.trim());
    setNewClassNameInput('');
    setShowAddClassModal(false);
  };

  return (
    <div className="bg-white border-b border-blue-100/80 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
          {/* Main Class Information Area */}
          <div className="flex items-start gap-4 sm:gap-5">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-sky-400 text-white flex flex-col items-center justify-center font-black shadow-md shadow-blue-500/20 flex-shrink-0">
              <span className="text-xl sm:text-2xl tracking-tight leading-none">{config.className}</span>
              <span className="text-[10px] font-medium text-blue-100 tracking-wider uppercase mt-0.5">LỚP</span>
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                  <School className="w-3.5 h-3.5 text-blue-600" />
                  {config.schoolName}
                </span>

                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                  {config.academicYear}
                </span>

                {/* Class Switcher Pills */}
                {config.classList && config.classList.length > 1 && (
                  <div className="flex items-center gap-1 ml-1">
                    <span className="text-xs text-slate-400 font-medium">Lớp:</span>
                    {config.classList.map((cls) => (
                      <button
                        key={cls}
                        onClick={() => onSelectClass(cls)}
                        className={`text-xs px-2 py-0.5 rounded-md font-semibold transition-all ${
                          config.className === cls
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-blue-100 hover:text-blue-700'
                        }`}
                      >
                        {cls}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  Lớp {config.className}
                </h1>
                <span className="text-slate-300 font-light">|</span>
                <span className="text-sm sm:text-base font-medium text-slate-600 flex items-center gap-1.5">
                  <User className="w-4 h-4 text-blue-500" />
                  GVCN: <strong className="text-slate-800 font-semibold">{config.teacherName}</strong>
                </span>
              </div>

              <p className="text-xs sm:text-sm text-slate-500 italic flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                <span>&ldquo;{config.slogan}&rdquo;</span>
              </p>
            </div>
          </div>

          {/* Quick Metrics & "+ Thêm lớp mới" Button */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Sĩ số chip */}
            <div className="flex items-center gap-2 bg-slate-50 hover:bg-blue-50/50 border border-slate-200/80 px-3.5 py-2 rounded-xl transition-colors">
              <Users2 className="w-4 h-4 text-blue-600" />
              <div className="text-left">
                <div className="text-[11px] font-medium text-slate-400 leading-none">Sĩ số lớp</div>
                <div className="text-sm font-bold text-slate-800 leading-tight mt-0.5">
                  {totalStudents} <span className="text-xs font-normal text-slate-500">({maleCount} Nam, {femaleCount} Nữ)</span>
                </div>
              </div>
            </div>

            {/* Quỹ lớp chip */}
            <div className="flex items-center gap-2 bg-slate-50 hover:bg-emerald-50/50 border border-slate-200/80 px-3.5 py-2 rounded-xl transition-colors">
              <Wallet className="w-4 h-4 text-emerald-600" />
              <div className="text-left">
                <div className="text-[11px] font-medium text-slate-400 leading-none">Số dư quỹ lớp</div>
                <div className="text-sm font-bold text-emerald-700 leading-tight mt-0.5">
                  {balance.toLocaleString('vi-VN')} đ
                </div>
              </div>
            </div>

            {/* Add Class Button */}
            <button
              id="btn-add-new-class"
              onClick={() => setShowAddClassModal(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs sm:text-sm font-semibold shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ Thêm lớp mới</span>
            </button>
          </div>
        </div>
      </div>

      {/* Add Class Modal Dialog */}
      {showAddClassModal && (
        <div
          id="modal-add-class"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs"
        >
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold text-slate-900 mb-1 flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-blue-600" />
              Thêm lớp chủ nhiệm mới
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 mb-4">
              Nhập tên lớp mới bạn muốn quản lý (Ví dụ: 12A2, 11B3, 10A1)
            </p>

            <form onSubmit={handleCreateClass} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Tên lớp học
                </label>
                <input
                  type="text"
                  required
                  placeholder="VD: 12A2"
                  value={newClassNameInput}
                  onChange={(e) => setNewClassNameInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
                  autoFocus
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddClassModal(false)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition-all"
                >
                  Xác nhận thêm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
