import React from 'react';
import {
  ClipboardCheck,
  Wallet,
  CalendarCheck2,
  Mail,
  ArrowRight,
  Sparkles,
  Users,
  TrendingUp,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Bell,
  Award,
} from 'lucide-react';
import {
  NavigationTab,
  Student,
  AttendanceRecord,
  ConductRecord,
  FinanceTransaction,
  ClassFeeCampaign,
  ContactMessage,
  AttendanceEntry,
  StudentConductEntry,
  StudentPaymentStatus,
} from '../types';

interface HomeDashboardProps {
  onOpenModule: (tab: NavigationTab) => void;
  students: Student[];
  attendanceRecords: AttendanceRecord[];
  conductRecords: ConductRecord[];
  transactions: FinanceTransaction[];
  feeCampaign: ClassFeeCampaign;
  contactMessages: ContactMessage[];
}

export const HomeDashboard: React.FC<HomeDashboardProps> = ({
  onOpenModule,
  students,
  attendanceRecords,
  conductRecords,
  transactions,
  feeCampaign,
  contactMessages,
}) => {
  // Compute key summary figures for cards
  const totalStudents = students.filter((s) => s.status === 'Đang học').length;

  // 1. Conduct stats
  const latestConduct = conductRecords[0];
  let conductGood = 0;
  let conductFair = 0;
  if (latestConduct) {
    const entries = Object.values(latestConduct.entries) as StudentConductEntry[];
    conductGood = entries.filter((e) => e.rating === 'Tốt').length;
    conductFair = entries.filter((e) => e.rating === 'Khá').length;
  }

  // 2. Finance stats
  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((s, t) => s + t.amount, 0);
  const totalExpense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((s, t) => s + t.amount, 0);
  const balance = totalIncome - totalExpense;

  const paidCount = (Object.values(feeCampaign.studentPayments) as StudentPaymentStatus[]).filter((p) => p.paid).length;
  const unpaidCount = totalStudents - paidCount;

  // 3. Attendance stats for today
  const latestAttendance = attendanceRecords[0];
  let presentCount = 0;
  let excusedCount = 0;
  let unexcusedCount = 0;
  let lateCount = 0;
  if (latestAttendance) {
    (Object.values(latestAttendance.entries) as AttendanceEntry[]).forEach((e) => {
      if (e.status === 'present') presentCount++;
      else if (e.status === 'excused') excusedCount++;
      else if (e.status === 'unexcused') unexcusedCount++;
      else if (e.status === 'late') lateCount++;
    });
  } else {
    presentCount = totalStudents;
  }

  // 4. Contact stats
  const broadcastCount = contactMessages.filter((m) => m.type === 'broadcast').length;
  const individualCount = contactMessages.filter((m) => m.type === 'individual').length;

  return (
    <div id="home-dashboard-view" className="space-y-8 pb-12">
      {/* Welcome & Quick Notification Banner */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-600 rounded-3xl p-6 sm:p-8 text-white shadow-lg shadow-blue-500/15 relative overflow-hidden">
        {/* Subtle decorative circles */}
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute right-1/3 -top-10 w-48 h-48 bg-sky-300/15 rounded-full blur-xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold text-blue-100 mb-3 border border-white/20">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Kỳ I • Năm học 2026–2027</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">
            Chào mừng Thầy/Cô trở lại làm việc!
          </h2>
          <p className="text-blue-100 text-sm sm:text-base leading-relaxed mb-5">
            Không gian điều hành lớp học trực quan, hỗ trợ tối đa công tác quản lý nề nếp,
            điểm danh, hạnh kiểm, sổ liên lạc và quỹ lớp 12A1 dễ dàng và chính xác.
          </p>

          {/* Quick shortcuts */}
          <div className="flex flex-wrap gap-2.5">
            <button
              onClick={() => onOpenModule('attendance')}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white text-blue-800 text-xs sm:text-sm font-bold shadow hover:bg-blue-50 active:scale-95 transition-all"
            >
              <CalendarCheck2 className="w-4 h-4 text-blue-600" />
              Điểm danh hôm nay
            </button>
            <button
              onClick={() => onOpenModule('students')}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/15 hover:bg-white/25 border border-white/25 text-white text-xs sm:text-sm font-semibold backdrop-blur-sm transition-all"
            >
              <Users className="w-4 h-4" />
              Xem danh sách ({totalStudents} HS)
            </button>
            <button
              onClick={() => onOpenModule('contact')}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/15 hover:bg-white/25 border border-white/25 text-white text-xs sm:text-sm font-semibold backdrop-blur-sm transition-all"
            >
              <Bell className="w-4 h-4" />
              Gửi thông báo mới
            </button>
          </div>
        </div>
      </div>

      {/* SECTION: 4 MAIN FUNCTION CARDS */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <span>Chức năng chủ nhiệm chính</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                4 Chức năng
              </span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-500">
              Chọn chức năng để bắt đầu quản trị và cập nhật dữ liệu lớp học
            </p>
          </div>
        </div>

        {/* The 4 Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
          {/* CARD 1 — ĐÁNH GIÁ HẠNH KIỂM */}
          <div
            id="card-conduct"
            className="group bg-white rounded-2xl p-6 border border-slate-200/80 hover:border-blue-400 shadow-sm hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center border border-amber-200/60 group-hover:scale-105 group-hover:bg-amber-500 group-hover:text-white transition-all duration-300">
                  <ClipboardCheck className="w-7 h-7" />
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200/80">
                  Tuần 2 • HK 1
                </span>
              </div>

              <h4 className="text-lg sm:text-xl font-bold text-slate-900 mb-1.5 group-hover:text-amber-700 transition-colors">
                ĐÁNH GIÁ HẠNH KIỂM
              </h4>
              <p className="text-slate-600 text-sm leading-relaxed mb-4">
                Chấm điểm hạnh kiểm hàng tuần, tổng kết theo kỳ.
              </p>

              {/* Status summary pill */}
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 mb-5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-slate-600">
                  <Award className="w-4 h-4 text-amber-500" />
                  <span>Xếp loại tuần gần nhất:</span>
                </div>
                <div className="font-bold text-slate-800">
                  <span className="text-emerald-600">{conductGood} Tốt</span>
                  <span className="mx-1 text-slate-300">•</span>
                  <span className="text-blue-600">{conductFair} Khá</span>
                </div>
              </div>
            </div>

            <button
              id="btn-open-conduct"
              onClick={() => onOpenModule('conduct')}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-98 text-white font-bold text-sm shadow-sm transition-all"
            >
              <span>Mở</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* CARD 2 — TÀI CHÍNH LỚP */}
          <div
            id="card-finance"
            className="group bg-white rounded-2xl p-6 border border-slate-200/80 hover:border-emerald-400 shadow-sm hover:shadow-xl hover:shadow-emerald-500/10 transition-all duration-300 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center border border-emerald-200/60 group-hover:scale-105 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300">
                  <Wallet className="w-7 h-7" />
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                  Số dư: {balance.toLocaleString('vi-VN')} đ
                </span>
              </div>

              <h4 className="text-lg sm:text-xl font-bold text-slate-900 mb-1.5 group-hover:text-emerald-700 transition-colors">
                TÀI CHÍNH LỚP
              </h4>
              <p className="text-slate-600 text-sm leading-relaxed mb-4">
                Quản lý thu chi, quỹ lớp, theo dõi đã nộp tiền.
              </p>

              {/* Status summary pill */}
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 mb-5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-slate-600">
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                  <span>Quỹ HK1 ({feeCampaign.title}):</span>
                </div>
                <div className="font-bold text-slate-800">
                  <span className="text-emerald-600">{paidCount}/{totalStudents} đã nộp</span>
                  {unpaidCount > 0 && (
                    <span className="text-amber-600 text-[11px] ml-1.5">({unpaidCount} chưa nộp)</span>
                  )}
                </div>
              </div>
            </div>

            <button
              id="btn-open-finance"
              onClick={() => onOpenModule('finance')}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-bold text-sm shadow-sm transition-all"
            >
              <span>Mở</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* CARD 3 — ĐIỂM DANH */}
          <div
            id="card-attendance"
            className="group bg-white rounded-2xl p-6 border border-slate-200/80 hover:border-blue-400 shadow-sm hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="w-14 h-14 rounded-2xl bg-blue-500/10 text-blue-600 flex items-center justify-center border border-blue-200/60 group-hover:scale-105 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                  <CalendarCheck2 className="w-7 h-7" />
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200/80">
                  Hôm nay ({latestAttendance?.date || '2026-09-16'})
                </span>
              </div>

              <h4 className="text-lg sm:text-xl font-bold text-slate-900 mb-1.5 group-hover:text-blue-700 transition-colors">
                ĐIỂM DANH
              </h4>
              <p className="text-slate-600 text-sm leading-relaxed mb-4">
                Theo dõi chuyên cần, thống kê nghỉ học.
              </p>

              {/* Status summary pill */}
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 mb-5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-slate-600">
                  <CheckCircle2 className="w-4 h-4 text-blue-600" />
                  <span>Tình trạng chuyên cần:</span>
                </div>
                <div className="font-bold text-slate-800">
                  <span className="text-emerald-600">{presentCount} có mặt</span>
                  {excusedCount > 0 && <span className="text-amber-600 ml-1.5">, {excusedCount} phép</span>}
                  {lateCount > 0 && <span className="text-blue-600 ml-1.5">, {lateCount} muộn</span>}
                </div>
              </div>
            </div>

            <button
              id="btn-open-attendance"
              onClick={() => onOpenModule('attendance')}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-bold text-sm shadow-sm transition-all"
            >
              <span>Mở</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* CARD 4 — SỔ LIÊN LẠC */}
          <div
            id="card-contact"
            className="group bg-white rounded-2xl p-6 border border-slate-200/80 hover:border-purple-400 shadow-sm hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-300 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="w-14 h-14 rounded-2xl bg-purple-500/10 text-purple-600 flex items-center justify-center border border-purple-200/60 group-hover:scale-105 group-hover:bg-purple-600 group-hover:text-white transition-all duration-300">
                  <Mail className="w-7 h-7" />
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200/80">
                  {contactMessages.length} Tin đã gửi
                </span>
              </div>

              <h4 className="text-lg sm:text-xl font-bold text-slate-900 mb-1.5 group-hover:text-purple-700 transition-colors">
                SỔ LIÊN LẠC
              </h4>
              <p className="text-slate-600 text-sm leading-relaxed mb-4">
                Gửi nhận xét và thông báo đến phụ huynh.
              </p>

              {/* Status summary pill */}
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 mb-5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-slate-600">
                  <Bell className="w-4 h-4 text-purple-600" />
                  <span>Kênh liên lạc gia đình:</span>
                </div>
                <div className="font-bold text-slate-800">
                  <span className="text-purple-600">{broadcastCount} thông báo chung</span>
                  <span className="mx-1 text-slate-300">•</span>
                  <span className="text-slate-600">{individualCount} cá nhân</span>
                </div>
              </div>
            </div>

            <button
              id="btn-open-contact"
              onClick={() => onOpenModule('contact')}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 active:scale-98 text-white font-bold text-sm shadow-sm transition-all"
            >
              <span>Mở</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>

      {/* Class Schedule & Quick Notes Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 cols: Ban cán sự lớp & Nhiệm vụ tuần */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              <span>Ban Cán sự Lớp 12A1 & Phân công trực nhật tuần này</span>
            </h4>
            <button
              onClick={() => onOpenModule('students')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline"
            >
              Chi tiết học sinh →
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
            <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-100">
              <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider block">Lớp trưởng</span>
              <p className="text-sm font-bold text-slate-800 mt-0.5">Nguyễn Văn An</p>
              <p className="text-xs text-slate-500">SĐT: 0912 345 678</p>
            </div>
            <div className="p-3 rounded-xl bg-indigo-50/60 border border-indigo-100">
              <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider block">Lớp phó Học tập</span>
              <p className="text-sm font-bold text-slate-800 mt-0.5">Trần Thị Bích Ngọc</p>
              <p className="text-xs text-slate-500">SĐT: 0913 456 789</p>
            </div>
            <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-100">
              <span className="text-[11px] font-bold text-amber-600 uppercase tracking-wider block">Bí thư Chi đoàn</span>
              <p className="text-sm font-bold text-slate-800 mt-0.5">Lê Hoàng Nam</p>
              <p className="text-xs text-slate-500">SĐT: 0914 567 890</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 text-xs sm:text-sm text-slate-700">
            <div className="font-bold text-slate-800 mb-1 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-blue-500" />
              Lịch trực nhật tuần này: <strong>Tổ 2 (Tổ trưởng: Đỗ Thảo Nhi)</strong>
            </div>
            <p className="text-slate-500 text-xs leading-relaxed">
              Nhiệm vụ: Mở cửa phòng học lúc 6h45, lau bảng, chuẩn bị phấn nước, đổ rác cuối buổi học và khóa cửa lúc 11h45.
            </p>
          </div>
        </div>

        {/* Right col: Ghi chú nhắc nhở GVCN */}
        <div className="bg-gradient-to-br from-amber-50/70 to-orange-50/60 rounded-2xl p-6 border border-amber-200/70 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3 text-amber-800 font-bold text-base">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              <span>Ghi chú công việc tuần</span>
            </div>

            <ul className="space-y-2.5 text-xs sm:text-sm text-slate-700">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 flex-shrink-0"></span>
                <span>Thu phiếu xác nhận thông tin tuyển sinh THPT Quốc gia của 24 học sinh.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 flex-shrink-0"></span>
                <span>Chuẩn bị nội dung cuộc họp Ban đại diện CMHS vào Chủ nhật (20/09).</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 flex-shrink-0"></span>
                <span>Gặp riêng em Dương Tuấn Kiệt và em Tạ Minh Khang nhắc nhở về giờ giấc.</span>
              </li>
            </ul>
          </div>

          <div className="pt-4 mt-4 border-t border-amber-200/60 text-right">
            <button
              onClick={() => onOpenModule('contact')}
              className="text-xs font-bold text-amber-800 hover:text-amber-950 hover:underline"
            >
              Gửi thông báo nhắc nhở →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
