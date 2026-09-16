/**
 * GIÁO VIÊN CHỦ NHIỆM - Web App Quản Lý Lớp Học THPT
 * Trường: THPT Nguyễn Văn An | Lớp: 12A1 | GVCN: Trần Thị Hương | Năm học: 2026–2027
 */

import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  NavigationTab,
  Student,
  ClassConfig,
  AttendanceRecord,
  ConductRecord,
  FinanceTransaction,
  ClassFeeCampaign,
  ContactMessage,
  AttendanceEntry,
  StudentConductEntry,
} from './types';
import {
  getStoredConfig,
  saveStoredConfig,
  getStoredStudents,
  saveStoredStudents,
  getStoredAttendance,
  saveStoredAttendance,
  getStoredConduct,
  saveStoredConduct,
  getStoredTransactions,
  saveStoredTransactions,
  getStoredFeeCampaign,
  saveStoredFeeCampaign,
  getStoredContact,
  saveStoredContact,
  resetAllToDefault,
  exportAllData,
} from './storage';
import { Navbar } from './components/Navbar';
import { ClassHeaderBanner } from './components/ClassHeaderBanner';
import { HomeDashboard } from './components/HomeDashboard';
import { StudentsView } from './components/StudentsView';
import { ConductView } from './components/ConductView';
import { FinanceView } from './components/FinanceView';
import { AttendanceView } from './components/AttendanceView';
import { ContactBookView } from './components/ContactBookView';
import { ConfigView } from './components/ConfigView';
import { ToastContainer, ToastMessage } from './components/ToastNotification';

export default function App() {
  // Navigation State
  const [activeTab, setActiveTab] = useState<NavigationTab>('home');

  // Application Data States (persisted via localStorage)
  const [config, setConfig] = useState<ClassConfig>(getStoredConfig);
  const [students, setStudents] = useState<Student[]>(getStoredStudents);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(getStoredAttendance);
  const [conductRecords, setConductRecords] = useState<ConductRecord[]>(getStoredConduct);
  const [transactions, setTransactions] = useState<FinanceTransaction[]>(getStoredTransactions);
  const [feeCampaign, setFeeCampaign] = useState<ClassFeeCampaign>(getStoredFeeCampaign);
  const [contactMessages, setContactMessages] = useState<ContactMessage[]>(getStoredContact);

  // Toast Notification State
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: 'success' | 'error' | 'info', message: string) => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 5);
    setToasts((prev) => [...prev, { id, type, message }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // --- ACTIONS: Students ---
  const handleAddStudent = (newStudentData: Omit<Student, 'id' | 'stt'>) => {
    const newStudent: Student = {
      ...newStudentData,
      id: `hs-${Date.now()}`,
      stt: students.length + 1,
    };
    const updated = [...students, newStudent];
    setStudents(updated);
    saveStoredStudents(updated);
    addToast('success', `Đã thêm học sinh "${newStudent.name}" vào danh sách lớp.`);
  };

  const handleAddMultipleStudents = (
    newStudentsData: Omit<Student, 'id' | 'stt'>[],
    mode: 'append' | 'replace' = 'append'
  ) => {
    const timestamp = Date.now();
    let updated: Student[];
    if (mode === 'replace') {
      updated = newStudentsData.map((data, idx) => ({
        ...data,
        id: `hs-${timestamp}-${idx}`,
        stt: idx + 1,
      }));
      setStudents(updated);
      saveStoredStudents(updated);
      addToast('success', `Đã nhập và làm mới toàn bộ danh sách lớp với ${updated.length} học sinh từ file Excel.`);
    } else {
      const baseStt = students.length;
      const newItems: Student[] = newStudentsData.map((data, idx) => ({
        ...data,
        id: `hs-${timestamp}-${idx}`,
        stt: baseStt + idx + 1,
      }));
      updated = [...students, ...newItems];
      setStudents(updated);
      saveStoredStudents(updated);
      addToast('success', `Đã thêm thành công ${newItems.length} học sinh từ file Excel vào danh sách lớp.`);
    }
  };

  const handleUpdateStudent = (updatedStudent: Student) => {
    const updated = students.map((s) => (s.id === updatedStudent.id ? updatedStudent : s));
    setStudents(updated);
    saveStoredStudents(updated);
    addToast('success', `Đã cập nhật thông tin học sinh "${updatedStudent.name}".`);
  };

  const handleDeleteStudent = (studentId: string) => {
    const student = students.find((s) => s.id === studentId);
    const updated = students
      .filter((s) => s.id !== studentId)
      .map((s, idx) => ({ ...s, stt: idx + 1 })); // recalculate STT
    setStudents(updated);
    saveStoredStudents(updated);
    addToast('info', `Đã xóa học sinh "${student?.name || ''}" khỏi danh sách.`);
  };

  const handleDeleteMultipleStudents = (studentIds: string[]) => {
    if (studentIds.length === 0) return;
    const count = studentIds.length;
    const idSet = new Set(studentIds);
    const updated = students
      .filter((s) => !idSet.has(s.id))
      .map((s, idx) => ({ ...s, stt: idx + 1 })); // recalculate STT
    setStudents(updated);
    saveStoredStudents(updated);
    addToast('info', `Đã xóa thành công ${count} học sinh khỏi danh sách lớp.`);
  };

  // --- ACTIONS: Attendance ---
  const handleSaveAttendance = (date: string, entries: Record<string, AttendanceEntry>) => {
    const newRecord: AttendanceRecord = {
      date,
      entries,
      savedAt: new Date().toISOString(),
    };
    // Replace if exists for date, or prepend
    const existingIdx = attendanceRecords.findIndex((r) => r.date === date);
    let updated: AttendanceRecord[];
    if (existingIdx >= 0) {
      updated = [...attendanceRecords];
      updated[existingIdx] = newRecord;
    } else {
      updated = [newRecord, ...attendanceRecords];
    }
    setAttendanceRecords(updated);
    saveStoredAttendance(updated);
    addToast('success', `Đã lưu thành công dữ liệu điểm danh ngày ${new Date(date).toLocaleDateString('vi-VN')}.`);
  };

  // --- ACTIONS: Conduct ---
  const handleSaveConduct = (
    week: number,
    term: 'Học kỳ 1' | 'Học kỳ 2',
    entries: Record<string, StudentConductEntry>
  ) => {
    const newRecord: ConductRecord = {
      week,
      term,
      entries,
      savedAt: new Date().toISOString(),
    };
    const existingIdx = conductRecords.findIndex((r) => r.week === week && r.term === term);
    let updated: ConductRecord[];
    if (existingIdx >= 0) {
      updated = [...conductRecords];
      updated[existingIdx] = newRecord;
    } else {
      updated = [newRecord, ...conductRecords];
    }
    setConductRecords(updated);
    saveStoredConduct(updated);
    addToast('success', `Đã lưu thành công đánh giá hạnh kiểm Tuần ${week} (${term}).`);
  };

  // --- ACTIONS: Finance ---
  const handleAddTransaction = (newTx: Omit<FinanceTransaction, 'id'>) => {
    const transaction: FinanceTransaction = {
      ...newTx,
      id: `tx-${Date.now()}`,
    };
    const updated = [transaction, ...transactions];
    setTransactions(updated);
    saveStoredTransactions(updated);
    addToast(
      'success',
      `Đã thêm ${transaction.type === 'income' ? 'khoản thu' : 'khoản chi'} "${transaction.title}".`
    );
  };

  const handleDeleteTransaction = (id: string) => {
    const updated = transactions.filter((t) => t.id !== id);
    setTransactions(updated);
    saveStoredTransactions(updated);
    addToast('info', 'Đã xóa chứng từ giao dịch.');
  };

  const handleUpdateFeeCampaign = (campaign: ClassFeeCampaign) => {
    setFeeCampaign(campaign);
    saveStoredFeeCampaign(campaign);
    addToast('success', 'Đã cập nhật tiến độ nộp tiền của học sinh.');
  };

  // --- ACTIONS: Contact Messages ---
  const handleAddContactMessage = (msgData: Omit<ContactMessage, 'id'>) => {
    const msg: ContactMessage = {
      ...msgData,
      id: `msg-${Date.now()}`,
    };
    const updated = [msg, ...contactMessages];
    setContactMessages(updated);
    saveStoredContact(updated);
    addToast('success', `Đã gửi và lưu thông báo vào Sổ Liên Lạc thành công!`);
  };

  const handleDeleteContactMessage = (id: string) => {
    const updated = contactMessages.filter((m) => m.id !== id);
    setContactMessages(updated);
    saveStoredContact(updated);
    addToast('info', 'Đã xóa thông báo khỏi sổ liên lạc.');
  };

  // --- ACTIONS: Class Config ---
  const handleSaveConfig = (newConfig: ClassConfig) => {
    setConfig(newConfig);
    saveStoredConfig(newConfig);
    addToast('success', 'Đã lưu cấu hình năm học và thông tin lớp thành công!');
  };

  const handleUpdateAcademicYear = (academicYear: string) => {
    const updated = { ...config, academicYear };
    setConfig(updated);
    saveStoredConfig(updated);
    addToast('info', `Đã chuyển sang ${academicYear}`);
  };

  const handleAddClass = (newClassName: string) => {
    const existingList = config.classList || [config.className];
    if (!existingList.includes(newClassName)) {
      const updatedList = [...existingList, newClassName];
      const updatedConfig = { ...config, className: newClassName, classList: updatedList };
      setConfig(updatedConfig);
      saveStoredConfig(updatedConfig);
      addToast('success', `Đã thêm và chuyển sang lớp ${newClassName}!`);
    } else {
      const updatedConfig = { ...config, className: newClassName };
      setConfig(updatedConfig);
      saveStoredConfig(updatedConfig);
      addToast('info', `Đã chuyển sang quản lý lớp ${newClassName}.`);
    }
  };

  const handleSelectClass = (className: string) => {
    const updatedConfig = { ...config, className };
    setConfig(updatedConfig);
    saveStoredConfig(updatedConfig);
    addToast('info', `Đang xem lớp ${className}`);
  };

  const handleResetData = () => {
    resetAllToDefault();
    setConfig(getStoredConfig());
    setStudents(getStoredStudents());
    setAttendanceRecords(getStoredAttendance());
    setConductRecords(getStoredConduct());
    setTransactions(getStoredTransactions());
    setFeeCampaign(getStoredFeeCampaign());
    setContactMessages(getStoredContact());
    addToast('success', 'Đã khôi phục toàn bộ dữ liệu mẫu lớp 12A1 THPT Nguyễn Văn An!');
  };

  const handleExportData = () => {
    const data = exportAllData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sao-luu-lop-${config.className}-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    addToast('success', 'Đã tải xuống file sao lưu dữ liệu!');
  };

  return (
    <div className="min-h-screen bg-[#f0f7ff] text-slate-800 flex flex-col selection:bg-blue-600 selection:text-white">
      {/* 1. Top Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        config={config}
        onUpdateAcademicYear={handleUpdateAcademicYear}
      />

      {/* 2. Prominent Class Info Header */}
      <ClassHeaderBanner
        config={config}
        students={students}
        attendanceRecords={attendanceRecords}
        transactions={transactions}
        conductRecords={conductRecords}
        onAddClass={handleAddClass}
        onSelectClass={handleSelectClass}
      />

      {/* 3. Main Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        <AnimatePresence mode="wait">
          {/* HOME DASHBOARD */}
          {activeTab === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
            >
              <HomeDashboard
                onOpenModule={(tab) => setActiveTab(tab)}
                students={students}
                attendanceRecords={attendanceRecords}
                conductRecords={conductRecords}
                transactions={transactions}
                feeCampaign={feeCampaign}
                contactMessages={contactMessages}
              />
            </motion.div>
          )}

          {/* STUDENTS MANAGEMENT */}
          {activeTab === 'students' && (
            <motion.div
              key="students"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
            >
              <StudentsView
                students={students}
                onAddStudent={handleAddStudent}
                onAddMultipleStudents={handleAddMultipleStudents}
                onUpdateStudent={handleUpdateStudent}
                onDeleteStudent={handleDeleteStudent}
                onDeleteMultipleStudents={handleDeleteMultipleStudents}
                onBackToHome={() => setActiveTab('home')}
                className={config.className}
                schoolName={config.schoolName}
                academicYear={config.academicYear}
              />
            </motion.div>
          )}

          {/* CONDUCT ASSESSMENT */}
          {activeTab === 'conduct' && (
            <motion.div
              key="conduct"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
            >
              <ConductView
                students={students}
                conductRecords={conductRecords}
                onSaveConduct={handleSaveConduct}
                onBackToHome={() => setActiveTab('home')}
              />
            </motion.div>
          )}

          {/* CLASS FINANCE */}
          {activeTab === 'finance' && (
            <motion.div
              key="finance"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
            >
              <FinanceView
                students={students}
                transactions={transactions}
                feeCampaign={feeCampaign}
                onAddTransaction={handleAddTransaction}
                onDeleteTransaction={handleDeleteTransaction}
                onUpdateFeeCampaign={handleUpdateFeeCampaign}
                onBackToHome={() => setActiveTab('home')}
              />
            </motion.div>
          )}

          {/* ATTENDANCE */}
          {activeTab === 'attendance' && (
            <motion.div
              key="attendance"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
            >
              <AttendanceView
                students={students}
                attendanceRecords={attendanceRecords}
                onSaveAttendance={handleSaveAttendance}
                onBackToHome={() => setActiveTab('home')}
              />
            </motion.div>
          )}

          {/* CONTACT BOOK */}
          {activeTab === 'contact' && (
            <motion.div
              key="contact"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
            >
              <ContactBookView
                students={students}
                messages={contactMessages}
                onAddMessage={handleAddContactMessage}
                onDeleteMessage={handleDeleteContactMessage}
                onBackToHome={() => setActiveTab('home')}
              />
            </motion.div>
          )}

          {/* YEAR & CLASS CONFIGURATION */}
          {activeTab === 'config' && (
            <motion.div
              key="config"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
            >
              <ConfigView
                config={config}
                onSaveConfig={handleSaveConfig}
                onResetData={handleResetData}
                onExportData={handleExportData}
                onBackToHome={() => setActiveTab('home')}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Toast Notification Container */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />

      {/* Footer */}
      <footer className="mt-auto border-t border-blue-100 bg-white/80 py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            <strong>GIÁO VIÊN CHỦ NHIỆM</strong> • Lớp {config.className} • {config.schoolName} ({config.academicYear})
          </div>
          <div className="text-slate-400">
            GVCN: {config.teacherName} • Thiết kế chuyên biệt cho công tác chủ nhiệm THPT
          </div>
        </div>
      </footer>
    </div>
  );
}
