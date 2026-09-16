import React, { useState, useMemo } from 'react';
import {
  Wallet,
  ArrowLeft,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  CheckCircle2,
  XCircle,
  Search,
  DollarSign,
  TrendingUp,
  CreditCard,
  FileText,
  Trash2,
  CheckCheck,
} from 'lucide-react';
import {
  Student,
  FinanceTransaction,
  ClassFeeCampaign,
  StudentPaymentStatus,
} from '../types';

interface FinanceViewProps {
  students: Student[];
  transactions: FinanceTransaction[];
  feeCampaign: ClassFeeCampaign;
  onAddTransaction: (transaction: Omit<FinanceTransaction, 'id'>) => void;
  onDeleteTransaction: (id: string) => void;
  onUpdateFeeCampaign: (campaign: ClassFeeCampaign) => void;
  onBackToHome: () => void;
}

export const FinanceView: React.FC<FinanceViewProps> = ({
  students,
  transactions,
  feeCampaign,
  onAddTransaction,
  onDeleteTransaction,
  onUpdateFeeCampaign,
  onBackToHome,
}) => {
  const [activeTab, setActiveTab] = useState<'transactions' | 'fee-tracking'>('transactions');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'income' | 'expense'>('income');
  const [searchQuery, setSearchQuery] = useState('');

  // Transaction form state
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    category: 'Quỹ lớp',
    person: '',
    note: '',
  });

  // Calculate high-level financial indicators
  const totalIncome = useMemo(() => {
    return transactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions]);

  const totalExpense = useMemo(() => {
    return transactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions]);

  const balance = totalIncome - totalExpense;

  // Fee campaign indicators:
  // Expected total = total students * amountPerStudent
  const totalStudents = students.filter((s) => s.status === 'Đang học').length;
  const expectedFeeTotal = totalStudents * feeCampaign.amountPerStudent;

  const collectedFeeTotal = useMemo(() => {
    let sum = 0;
    (Object.values(feeCampaign.studentPayments) as StudentPaymentStatus[]).forEach((p) => {
      if (p.paid) sum += p.amount || feeCampaign.amountPerStudent;
    });
    return sum;
  }, [feeCampaign]);

  const remainingFeeTotal = Math.max(0, expectedFeeTotal - collectedFeeTotal);
  const paidStudentsCount = (Object.values(feeCampaign.studentPayments) as StudentPaymentStatus[]).filter((p) => p.paid).length;
  const paidPercent = totalStudents > 0 ? Math.round((paidStudentsCount / totalStudents) * 100) : 0;

  // Handlers
  const handleOpenAdd = (type: 'income' | 'expense') => {
    setModalType(type);
    setFormData({
      title: '',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      category: type === 'income' ? 'Quỹ lớp' : 'Vật tư & Thiết bị',
      person: '',
      note: '',
    });
    setIsAddModalOpen(true);
  };

  const handleSubmitTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseInt(formData.amount.replace(/\D/g, ''), 10);
    if (!formData.title.trim() || !numAmount || numAmount <= 0) return;

    onAddTransaction({
      title: formData.title.trim(),
      type: modalType,
      amount: numAmount,
      date: formData.date,
      category: formData.category,
      person: formData.person.trim() || 'Thủ quỹ lớp',
      note: formData.note.trim(),
    });

    setIsAddModalOpen(false);
  };

  // Toggle student payment status in campaign
  const handleToggleStudentPayment = (studentId: string) => {
    const current = feeCampaign.studentPayments[studentId];
    const isNowPaid = !current?.paid;

    const updatedPayments = {
      ...feeCampaign.studentPayments,
      [studentId]: {
        paid: isNowPaid,
        amount: feeCampaign.amountPerStudent,
        paidDate: isNowPaid ? new Date().toISOString().split('T')[0] : undefined,
        note: isNowPaid ? 'Đã thu' : 'Chưa thu',
      },
    };

    onUpdateFeeCampaign({
      ...feeCampaign,
      studentPayments: updatedPayments,
    });
  };

  // Mark all students as paid
  const handleMarkAllStudentsPaid = () => {
    const today = new Date().toISOString().split('T')[0];
    const updatedPayments: Record<string, StudentPaymentStatus> = {};
    students.forEach((s) => {
      updatedPayments[s.id] = {
        paid: true,
        paidDate: today,
        amount: feeCampaign.amountPerStudent,
        note: 'Đã hoàn tất',
      };
    });

    onUpdateFeeCampaign({
      ...feeCampaign,
      studentPayments: updatedPayments,
    });
  };

  // Filtered transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter(
      (t) =>
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.person.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [transactions, searchQuery]);

  return (
    <div id="finance-management-view" className="space-y-6 pb-12">
      {/* Header */}
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
              <Wallet className="w-6 h-6 text-emerald-600" />
              <span>Quản Lý Tài Chính & Quỹ Lớp</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Minh bạch thu chi, theo dõi tiến độ nộp quỹ của học sinh lớp 12A1
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            id="btn-add-income"
            onClick={() => handleOpenAdd('income')}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs sm:text-sm shadow-sm transition-all"
          >
            <ArrowDownLeft className="w-4 h-4" />
            <span>+ Thêm khoản thu</span>
          </button>
          <button
            id="btn-add-expense"
            onClick={() => handleOpenAdd('expense')}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-bold text-xs sm:text-sm shadow-sm transition-all"
          >
            <ArrowUpRight className="w-4 h-4" />
            <span>- Thêm khoản chi</span>
          </button>
        </div>
      </div>

      {/* 5 REQUIRED KEY FINANCIAL INDICATORS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {/* 1. Tổng thu */}
        <div className="bg-white p-4 rounded-2xl border border-emerald-200 shadow-xs bg-emerald-50/20">
          <div className="text-xs font-semibold text-emerald-700 flex items-center gap-1 mb-1">
            <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-600" />
            Tổng Thu
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-700">
            {totalIncome.toLocaleString('vi-VN')} <span className="text-xs font-bold">đ</span>
          </div>
          <div className="text-[11px] text-emerald-600/80 mt-0.5">Các nguồn quỹ & đóng góp</div>
        </div>

        {/* 2. Tổng chi */}
        <div className="bg-white p-4 rounded-2xl border border-rose-200 shadow-xs bg-rose-50/20">
          <div className="text-xs font-semibold text-rose-700 flex items-center gap-1 mb-1">
            <ArrowUpRight className="w-3.5 h-3.5 text-rose-600" />
            Tổng Chi
          </div>
          <div className="text-xl sm:text-2xl font-black text-rose-700">
            {totalExpense.toLocaleString('vi-VN')} <span className="text-xs font-bold">đ</span>
          </div>
          <div className="text-[11px] text-rose-600/80 mt-0.5">Hoạt động, vật tư, in ấn</div>
        </div>

        {/* 3. Số dư quỹ */}
        <div className="bg-white p-4 rounded-2xl border-2 border-blue-500 shadow-sm bg-blue-50/30 col-span-2 sm:col-span-1">
          <div className="text-xs font-bold text-blue-700 flex items-center gap-1 mb-1">
            <Wallet className="w-3.5 h-3.5 text-blue-600" />
            Số Dư Hiện Tại
          </div>
          <div className="text-2xl sm:text-3xl font-black text-blue-800">
            {balance.toLocaleString('vi-VN')} <span className="text-xs font-bold">đ</span>
          </div>
          <div className="text-[11px] text-blue-600 font-semibold mt-0.5">Khả dụng trong quỹ</div>
        </div>

        {/* 4. Tổng số tiền đã thu */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 flex items-center gap-1 mb-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Tiền Quỹ Đã Thu
          </div>
          <div className="text-xl sm:text-2xl font-bold text-slate-800">
            {collectedFeeTotal.toLocaleString('vi-VN')} <span className="text-xs font-bold">đ</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            {paidStudentsCount}/{totalStudents} học sinh ({paidPercent}%)
          </div>
        </div>

        {/* 5. Số tiền còn phải thu */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 flex items-center gap-1 mb-1">
            <XCircle className="w-3.5 h-3.5 text-amber-500" />
            Còn Phải Thu
          </div>
          <div className="text-xl sm:text-2xl font-bold text-amber-600">
            {remainingFeeTotal.toLocaleString('vi-VN')} <span className="text-xs font-bold">đ</span>
          </div>
          <div className="text-[11px] text-amber-600/90 mt-0.5">
            {totalStudents - paidStudentsCount} học sinh chưa nộp
          </div>
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('transactions')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 transition-all ${
            activeTab === 'transactions'
              ? 'border-blue-600 text-blue-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Sổ Lịch Sử Thu - Chi ({transactions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('fee-tracking')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 transition-all ${
            activeTab === 'fee-tracking'
              ? 'border-blue-600 text-blue-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Theo Dõi Nộp Tiền Theo Học Sinh ({paidStudentsCount}/{totalStudents})</span>
        </button>
      </div>

      {/* TAB 1: SỔ GIAO DỊCH THU - CHI */}
      {activeTab === 'transactions' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm nội dung, danh mục, người phụ trách..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-white border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <span className="text-xs text-slate-400 font-medium hidden sm:inline">
              Tổng số {filteredTransactions.length} giao dịch
            </span>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-700">
                <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500 font-bold">
                  <tr>
                    <th className="px-4 py-3 w-12 text-center">STT</th>
                    <th className="px-4 py-3 w-28">Ngày</th>
                    <th className="px-4 py-3 w-28 text-center">Loại</th>
                    <th className="px-4 py-3">Nội dung thu / chi</th>
                    <th className="px-4 py-3">Danh mục</th>
                    <th className="px-4 py-3">Người nộp / nhận</th>
                    <th className="px-4 py-3 text-right">Số tiền</th>
                    <th className="px-4 py-3 text-center w-16">Xóa</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredTransactions.map((tx, idx) => (
                    <tr key={tx.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-4 py-3 text-center text-xs text-slate-400 font-bold">
                        {idx + 1}
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-600 whitespace-nowrap font-medium">
                        {new Date(tx.date).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                            tx.type === 'income'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {tx.type === 'income' ? '+ Thu' : '- Chi'}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-900">
                        <div>{tx.title}</div>
                        {tx.note && <div className="text-xs text-slate-400 font-normal">{tx.note}</div>}
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-600">
                        <span className="bg-slate-100 px-2 py-0.5 rounded-md font-medium">
                          {tx.category}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-700 font-medium">
                        {tx.person}
                      </td>
                      <td
                        className={`px-4 py-3 text-right font-black text-sm ${
                          tx.type === 'income' ? 'text-emerald-600' : 'text-rose-600'
                        }`}
                      >
                        {tx.type === 'income' ? '+' : '-'}
                        {tx.amount.toLocaleString('vi-VN')} đ
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => onDeleteTransaction(tx.id)}
                          className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Xóa giao dịch"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: THEO DÕI NỘP TIỀN TỪNG HỌC SINH */}
      {activeTab === 'fee-tracking' && (
        <div className="space-y-4">
          {/* Campaign summary card */}
          <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-sky-50 p-5 rounded-2xl border border-blue-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-600 text-white">
                  {feeCampaign.term}
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  Hạn nộp: {new Date(feeCampaign.dueDate).toLocaleDateString('vi-VN')}
                </span>
              </div>
              <h3 className="text-lg font-extrabold text-slate-900">{feeCampaign.title}</h3>
              <p className="text-xs sm:text-sm text-slate-600 mt-0.5">{feeCampaign.description}</p>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <div className="bg-white px-4 py-2 rounded-xl border border-blue-200 shadow-xs">
                <div className="text-[11px] text-slate-400 font-medium">Mức thu / học sinh</div>
                <div className="text-base font-extrabold text-blue-700">
                  {feeCampaign.amountPerStudent.toLocaleString('vi-VN')} đ
                </div>
              </div>

              <button
                onClick={handleMarkAllStudentsPaid}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-sm transition-all"
              >
                <CheckCheck className="w-4 h-4" />
                <span>Đánh dấu tất cả đã nộp</span>
              </button>
            </div>
          </div>

          {/* Progress bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-xs font-bold mb-2">
              <span className="text-slate-700">
                Tiến độ thu: <strong>{paidStudentsCount}/{totalStudents} học sinh</strong>
              </span>
              <span className="text-emerald-600 font-extrabold">{paidPercent}%</span>
            </div>
            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-500"
                style={{ width: `${paidPercent}%` }}
              />
            </div>
          </div>

          {/* Student list check table */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-700">
                <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500 font-bold">
                  <tr>
                    <th className="px-4 py-3 w-12 text-center">STT</th>
                    <th className="px-4 py-3 w-64">Họ và tên học sinh</th>
                    <th className="px-4 py-3 text-center w-36">Trạng thái nộp</th>
                    <th className="px-4 py-3 w-32">Số tiền</th>
                    <th className="px-4 py-3 w-32">Ngày nộp</th>
                    <th className="px-4 py-3">Ghi chú</th>
                    <th className="px-4 py-3 text-center w-28">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {students.map((student, idx) => {
                    const payStatus = feeCampaign.studentPayments[student.id] || { paid: false, amount: feeCampaign.amountPerStudent };

                    return (
                      <tr
                        key={student.id}
                        className={`hover:bg-blue-50/30 transition-colors ${
                          payStatus.paid ? 'bg-emerald-50/10' : ''
                        }`}
                      >
                        <td className="px-4 py-3 text-center text-xs text-slate-400 font-bold">
                          {idx + 1}
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-bold text-slate-800">{student.name}</div>
                          <div className="text-xs text-slate-400">PH: {student.parentName}</div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span
                            className={`inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full ${
                              payStatus.paid
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {payStatus.paid ? (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                Đã nộp
                              </>
                            ) : (
                              <>
                                <XCircle className="w-3.5 h-3.5 text-rose-600" />
                                Chưa nộp
                              </>
                            )}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-semibold text-slate-800 text-xs">
                          {feeCampaign.amountPerStudent.toLocaleString('vi-VN')} đ
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-500">
                          {payStatus.paidDate
                            ? new Date(payStatus.paidDate).toLocaleDateString('vi-VN')
                            : '—'}
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-600">
                          {payStatus.note || (payStatus.paid ? 'Đã thu' : 'Chưa thu')}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => handleToggleStudentPayment(student.id)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs ${
                              payStatus.paid
                                ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                            }`}
                          >
                            {payStatus.paid ? 'Hủy đánh dấu' : 'Đánh dấu đã nộp'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Thêm khoản thu / chi */}
      {isAddModalOpen && (
        <div
          id="modal-add-transaction"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs"
        >
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold text-slate-900 mb-1 flex items-center gap-2">
              {modalType === 'income' ? (
                <ArrowDownLeft className="w-5 h-5 text-emerald-600" />
              ) : (
                <ArrowUpRight className="w-5 h-5 text-rose-600" />
              )}
              {modalType === 'income' ? 'Thêm Khoản Thu Mới' : 'Thêm Khoản Chi Mới'}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Nhập chi tiết chứng từ thu chi vào sổ quỹ lớp 12A1
            </p>

            <form onSubmit={handleSubmitTransaction} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nội dung thu / chi <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder={modalType === 'income' ? 'VD: Thu Quỹ phụ huynh đợt 2' : 'VD: Mua nước uống tháng 10'}
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Số tiền (VNĐ) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="1000"
                    placeholder="VD: 500000"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Ngày thực hiện</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Danh mục</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  >
                    <option value="Quỹ lớp">Quỹ lớp</option>
                    <option value="Vật tư & Nước uống">Vật tư & Nước uống</option>
                    <option value="Học tập & In ấn">Học tập & In ấn</option>
                    <option value="Sự kiện & Ngoại khóa">Sự kiện & Ngoại khóa</option>
                    <option value="Khen thưởng">Khen thưởng</option>
                    <option value="Khác">Khác</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {modalType === 'income' ? 'Người nộp tiền' : 'Người nhận / Đơn vị'}
                  </label>
                  <input
                    type="text"
                    placeholder="VD: Ban đại diện CMHS"
                    value={formData.person}
                    onChange={(e) => setFormData({ ...formData, person: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Ghi chú</label>
                <textarea
                  rows={2}
                  placeholder="Ghi chú hóa đơn hoặc số lượng..."
                  value={formData.note}
                  onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className={`px-5 py-2 rounded-xl text-sm font-bold text-white shadow-sm transition-all ${
                    modalType === 'income'
                      ? 'bg-emerald-600 hover:bg-emerald-700'
                      : 'bg-rose-600 hover:bg-rose-700'
                  }`}
                >
                  {modalType === 'income' ? 'Lưu khoản thu' : 'Lưu khoản chi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
