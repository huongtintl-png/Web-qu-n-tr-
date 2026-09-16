/**
 * Data types for "Giáo viên Chủ nhiệm" - Class Management App
 */

export type Gender = 'Nam' | 'Nữ';

export type StudentStatus = 'Đang học' | 'Chuyển trường' | 'Nghỉ học';

export type StudentRole = 'Lớp trưởng' | 'Lớp phó' | 'Bí thư' | 'Tổ trưởng' | 'Học sinh';

export interface Student {
  id: string;
  stt: number;
  name: string;
  dob: string; // YYYY-MM-DD
  gender: Gender;
  phone: string;
  parentName: string;
  parentPhone: string;
  address: string;
  role: StudentRole;
  status: StudentStatus;
  notes?: string;
}

export type AttendanceStatus = 'present' | 'excused' | 'unexcused' | 'late';

export interface AttendanceEntry {
  status: AttendanceStatus;
  note?: string;
}

export interface AttendanceRecord {
  date: string; // YYYY-MM-DD
  entries: Record<string, AttendanceEntry>; // studentId -> entry
  savedAt: string;
}

export type ConductRating = 'Tốt' | 'Khá' | 'Trung bình' | 'Yếu';

export interface StudentConductEntry {
  score: number; // 0 - 100
  rating: ConductRating;
  note: string;
  criteria?: string[]; // e.g., ["Phát biểu tốt (+5)", "Đi muộn (-5)"]
}

export interface ConductRecord {
  week: number;
  term: 'Học kỳ 1' | 'Học kỳ 2';
  entries: Record<string, StudentConductEntry>; // studentId -> entry
  savedAt: string;
}

export interface FinanceTransaction {
  id: string;
  date: string; // YYYY-MM-DD
  type: 'income' | 'expense';
  amount: number;
  title: string;
  category: string;
  person: string; // Người nộp hoặc người nhận
  note: string;
}

export interface StudentPaymentStatus {
  paid: boolean;
  paidDate?: string;
  amount: number;
  note?: string;
}

export interface ClassFeeCampaign {
  id: string;
  title: string;
  amountPerStudent: number;
  term: string;
  dueDate: string;
  description: string;
  studentPayments: Record<string, StudentPaymentStatus>; // studentId -> status
}

export interface ContactMessage {
  id: string;
  date: string;
  type: 'individual' | 'broadcast';
  studentId?: string;
  studentName?: string;
  category: 'Học tập' | 'Nề nếp' | 'Khen thưởng' | 'Nhắc nhở' | 'Thông báo chung';
  title: string;
  content: string;
  channel: 'Zalo' | 'SMS' | 'Trực tiếp';
  status: 'Đã gửi' | 'Nháp';
}

export interface ClassConfig {
  schoolName: string;
  teacherName: string;
  className: string;
  academicYear: string;
  slogan: string;
  classList: string[];
}

export type NavigationTab =
  | 'home'
  | 'students'
  | 'conduct'
  | 'finance'
  | 'attendance'
  | 'contact'
  | 'config';
