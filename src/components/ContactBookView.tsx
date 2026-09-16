import React, { useState, useMemo } from 'react';
import {
  Mail,
  ArrowLeft,
  Send,
  Bell,
  User,
  Users,
  Calendar,
  MessageSquareQuote,
  Search,
  CheckCircle2,
  Share2,
  Trash2,
  Sparkles,
  Phone,
} from 'lucide-react';
import { Student, ContactMessage } from '../types';

interface ContactBookViewProps {
  students: Student[];
  messages: ContactMessage[];
  onAddMessage: (message: Omit<ContactMessage, 'id'>) => void;
  onDeleteMessage: (id: string) => void;
  onBackToHome: () => void;
}

export const ContactBookView: React.FC<ContactBookViewProps> = ({
  students,
  messages,
  onAddMessage,
  onDeleteMessage,
  onBackToHome,
}) => {
  const [activeTab, setActiveTab] = useState<'individual' | 'broadcast'>('individual');
  const [selectedStudentId, setSelectedStudentId] = useState<string>(students[0]?.id || '');
  const [searchHistory, setSearchHistory] = useState('');

  // Form State
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<ContactMessage['category']>('Học tập');
  const [channel, setChannel] = useState<'Zalo' | 'SMS' | 'Trực tiếp'>('Zalo');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  // Quick preset templates for teachers
  const sampleTemplates = [
    {
      label: 'Khen ngợi học tốt',
      title: 'Khen ngợi tinh thần học tập và kết quả kiểm tra',
      cat: 'Khen thưởng' as const,
      content: 'Thầy/Cô rất khen ngợi em đã có tinh thần học tập tích cực, chuẩn bị bài chu đáo và đạt điểm số cao trong bài kiểm tra vừa qua.',
    },
    {
      label: 'Nhắc nhở học tập',
      title: 'Nhắc nhở chuẩn bị bài và làm bài tập về nhà',
      cat: 'Học tập' as const,
      content: 'Kính gửi phụ huynh: Tuần này em còn thiếu bài tập về nhà và chưa thực sự tập trung trong giờ học. Kính nhờ phụ huynh phối hợp đôn đốc em ôn bài tại nhà.',
    },
    {
      label: 'Nhắc nề nếp đi muộn',
      title: 'Nhắc nhở thời gian đến lớp đúng giờ',
      cat: 'Nề nếp' as const,
      content: 'Kính gửi phụ huynh: Nhà trường và GVCN xin thông báo trong tuần em có đi muộn. Xin phụ huynh nhắc nhở em xuất phát sớm để đảm bảo đúng giờ truy bài.',
    },
    {
      label: 'Thông báo Họp PH',
      title: 'Thông báo lịch họp Phụ huynh học sinh lớp 12A1',
      cat: 'Thông báo chung' as const,
      content: 'Trân trọng kính mời quý Phụ huynh đến tham dự buổi họp CMHS vào 8h00 Chủ nhật tuần này tại phòng học lớp 12A1 để trao đổi định hướng ôn thi tốt nghiệp.',
    },
  ];

  const handleApplyTemplate = (tpl: typeof sampleTemplates[0]) => {
    setTitle(tpl.title);
    setContent(tpl.content);
    setCategory(tpl.cat);
  };

  const selectedStudent = useMemo(() => {
    return students.find((s) => s.id === selectedStudentId);
  }, [students, selectedStudentId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    onAddMessage({
      date,
      type: activeTab,
      studentId: activeTab === 'individual' ? selectedStudentId : undefined,
      studentName: activeTab === 'individual' ? selectedStudent?.name : 'Toàn thể lớp 12A1',
      category,
      title: title.trim(),
      content: content.trim(),
      channel,
      status: 'Đã gửi',
    });

    // Reset fields
    setTitle('');
    setContent('');
  };

  // Filtered message history
  const filteredMessages = useMemo(() => {
    return messages.filter((m) => {
      const matchSearch =
        m.title.toLowerCase().includes(searchHistory.toLowerCase()) ||
        m.content.toLowerCase().includes(searchHistory.toLowerCase()) ||
        (m.studentName && m.studentName.toLowerCase().includes(searchHistory.toLowerCase()));

      const matchTab = m.type === activeTab;
      return matchSearch && matchTab;
    });
  }, [messages, searchHistory, activeTab]);

  return (
    <div id="contact-book-view" className="space-y-6 pb-12">
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
              <Mail className="w-6 h-6 text-purple-600" />
              <span>Sổ Liên Lạc & Thông Báo Phụ Huynh</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Gửi nhận xét cá nhân hoặc phát thông báo chung tới gia đình học sinh
            </p>
          </div>
        </div>

        {/* Tab switch */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('individual')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'individual'
                ? 'bg-white text-purple-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Nhận xét từng học sinh</span>
          </button>
          <button
            onClick={() => setActiveTab('broadcast')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'broadcast'
                ? 'bg-white text-purple-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Thông báo chung cả lớp</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Form Left, History Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form: Create Announcement / Evaluation */}
        <div className="lg:col-span-6 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <MessageSquareQuote className="w-5 h-5 text-purple-600" />
              {activeTab === 'individual'
                ? 'Soạn nhận xét cho học sinh'
                : 'Soạn thông báo chung cho cả lớp'}
            </h3>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-purple-50 text-purple-700">
              Kênh: {channel}
            </span>
          </div>

          {/* Quick preset templates buttons */}
          <div>
            <span className="text-xs font-semibold text-slate-400 block mb-1.5">
              Mẫu câu nhận xét nhanh:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {sampleTemplates.map((tpl, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleApplyTemplate(tpl)}
                  className="px-2.5 py-1 text-xs rounded-lg bg-slate-100 hover:bg-purple-50 hover:text-purple-700 text-slate-700 border border-slate-200/80 transition-colors"
                >
                  {tpl.label}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 pt-1">
            {/* If individual: pick student */}
            {activeTab === 'individual' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Chọn học sinh nhận xét <span className="text-rose-500">*</span>
                </label>
                <select
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm font-semibold"
                >
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      STT {s.stt}: {s.name} ({s.gender}) — PH: {s.parentName}
                    </option>
                  ))}
                </select>

                {selectedStudent && (
                  <div className="mt-2 p-2.5 rounded-xl bg-purple-50/50 border border-purple-100 text-xs text-slate-600 flex items-center justify-between">
                    <div>
                      Phụ huynh: <strong>{selectedStudent.parentName}</strong>
                    </div>
                    <div className="flex items-center gap-1 font-mono text-purple-700 font-bold">
                      <Phone className="w-3 h-3" />
                      {selectedStudent.parentPhone}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Category & Date */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Danh mục</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                >
                  <option value="Học tập">Học tập</option>
                  <option value="Nề nếp">Nề nếp kỷ luật</option>
                  <option value="Khen thưởng">Khen thưởng</option>
                  <option value="Nhắc nhở">Nhắc nhở</option>
                  <option value="Thông báo chung">Thông báo chung</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Ngày gửi</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                />
              </div>
            </div>

            {/* Channel Selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Kênh gửi tin</label>
              <div className="grid grid-cols-3 gap-2">
                {(['Zalo', 'SMS', 'Trực tiếp'] as const).map((ch) => (
                  <button
                    key={ch}
                    type="button"
                    onClick={() => setChannel(ch)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                      channel === ch
                        ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {ch}
                  </button>
                ))}
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tiêu đề nhận xét / thông báo <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="VD: Thông báo kết quả học tập tuần 2"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm font-medium"
              />
            </div>

            {/* Content */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nội dung chi tiết <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={4}
                required
                placeholder="Nhập nội dung lời nhắn gửi gắm đến phụ huynh..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm leading-relaxed"
              />
            </div>

            {/* Submit */}
            <div className="flex items-center justify-end pt-2">
              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 active:scale-95 text-white font-bold text-sm shadow-sm transition-all"
              >
                <Send className="w-4 h-4" />
                <span>Gửi và Lưu vào Sổ Liên Lạc</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right Area: Message History */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm lịch sử thông báo, tên học sinh..."
                value={searchHistory}
                onChange={(e) => setSearchHistory(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <span className="text-xs font-bold text-slate-500 whitespace-nowrap">
              {filteredMessages.length} Tin nhắn
            </span>
          </div>

          <div className="space-y-3">
            {filteredMessages.length === 0 ? (
              <div className="bg-white p-10 rounded-2xl border border-slate-200 text-center text-slate-400">
                Chưa có thông báo nào trong mục này.
              </div>
            ) : (
              filteredMessages.map((msg) => (
                <div
                  key={msg.id}
                  id={`msg-card-${msg.id}`}
                  className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-purple-300 transition-all space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                          {msg.category}
                        </span>
                        <span className="text-xs text-slate-400">
                          {new Date(msg.date).toLocaleDateString('vi-VN')}
                        </span>
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                          {msg.channel}
                        </span>
                      </div>
                      <h4 className="text-base font-bold text-slate-900">{msg.title}</h4>
                    </div>

                    <button
                      onClick={() => onDeleteMessage(msg.id)}
                      className="p-1 rounded-lg text-slate-300 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Xóa tin nhắn"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {msg.studentName && (
                    <div className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-purple-500" />
                      <span>Học sinh: {msg.studentName}</span>
                    </div>
                  )}

                  <p className="text-xs sm:text-sm text-slate-600 bg-slate-50/70 p-3 rounded-xl border border-slate-100 leading-relaxed whitespace-pre-wrap">
                    {msg.content}
                  </p>

                  <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400">
                    <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Trạng thái: {msg.status}
                    </span>
                    <button
                      onClick={() => {
                        navigator.clipboard?.writeText?.(msg.content);
                        alert('Đã sao chép nội dung tin nhắn!');
                      }}
                      className="text-purple-600 hover:underline flex items-center gap-1 font-medium"
                    >
                      <Share2 className="w-3 h-3" />
                      Sao chép nội dung
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
