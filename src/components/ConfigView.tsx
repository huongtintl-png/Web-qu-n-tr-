import React, { useState } from 'react';
import {
  Settings,
  ArrowLeft,
  School,
  User,
  Calendar,
  Sparkles,
  Save,
  RotateCcw,
  Download,
  AlertTriangle,
  BookOpen,
  CheckCircle2,
} from 'lucide-react';
import { ClassConfig } from '../types';

interface ConfigViewProps {
  config: ClassConfig;
  onSaveConfig: (config: ClassConfig) => void;
  onResetData: () => void;
  onExportData: () => void;
  onBackToHome: () => void;
}

export const ConfigView: React.FC<ConfigViewProps> = ({
  config,
  onSaveConfig,
  onResetData,
  onExportData,
  onBackToHome,
}) => {
  const [formData, setFormData] = useState<ClassConfig>({ ...config });
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveConfig(formData);
  };

  return (
    <div id="configuration-view" className="max-w-4xl mx-auto space-y-6 pb-12">
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
              <Settings className="w-6 h-6 text-blue-600" />
              <span>Cấu Hình Thông Tin Năm Học & Lớp</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Tùy chỉnh thông tin trường, lớp, giáo viên chủ nhiệm và khẩu hiệu lớp
            </p>
          </div>
        </div>
      </div>

      {/* Main Form */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Thông tin cố định / mặc định */}
          <div>
            <h3 className="text-sm font-bold text-blue-800 uppercase tracking-wider mb-4 flex items-center gap-2">
              <School className="w-4 h-4 text-blue-600" />
              <span>Thông tin nhà trường và Giáo viên chủ nhiệm</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Tên trường */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Tên trường THPT <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <School className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={formData.schoolName}
                    onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
                    placeholder="VD: THPT Nguyễn Văn An"
                  />
                </div>
              </div>

              {/* Tên GVCN */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Giáo viên chủ nhiệm <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={formData.teacherName}
                    onChange={(e) => setFormData({ ...formData, teacherName: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
                    placeholder="VD: Trần Thị Hương"
                  />
                </div>
              </div>

              {/* Tên lớp */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Tên lớp chủ nhiệm <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Sparkles className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={formData.className}
                    onChange={(e) => setFormData({ ...formData, className: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-bold text-blue-700"
                    placeholder="VD: 12A1"
                  />
                </div>
              </div>

              {/* Năm học */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Năm học mặc định <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={formData.academicYear}
                    onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
                    placeholder="VD: 2026–2027"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Slogan / Mô tả lớp */}
          <div className="pt-4 border-t border-slate-100">
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Khẩu hiệu / Mục tiêu chung của tập thể lớp
            </label>
            <div className="relative">
              <BookOpen className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <textarea
                rows={3}
                value={formData.slogan}
                onChange={(e) => setFormData({ ...formData, slogan: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                placeholder="VD: Đoàn kết - Chăm ngoan - Quyết tâm đỗ Đại học"
              />
            </div>
          </div>

          {/* Save button */}
          <div className="flex items-center justify-end pt-4 border-t border-slate-100">
            <button
              id="btn-save-config"
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-sm shadow-sm transition-all"
            >
              <Save className="w-4 h-4" />
              <span>Lưu Cấu Hình</span>
            </button>
          </div>
        </form>
      </div>

      {/* Backup & Sample Data Management */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
        <div>
          <h3 className="text-base font-bold text-slate-900">Quản Lý & Sao Lưu Dữ Liệu</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Dữ liệu được lưu an toàn trực tiếp trên trình duyệt của giáo viên (localStorage).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          {/* Download JSON Backup */}
          <button
            id="btn-export-backup"
            type="button"
            onClick={onExportData}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs sm:text-sm font-semibold transition-all"
          >
            <Download className="w-4 h-4 text-blue-600" />
            <span>Tải file sao lưu dữ liệu (JSON)</span>
          </button>

          {/* Reset sample data */}
          <button
            id="btn-reset-sample-data"
            type="button"
            onClick={() => setShowConfirmReset(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs sm:text-sm font-semibold transition-all"
          >
            <RotateCcw className="w-4 h-4 text-rose-600" />
            <span>Khôi phục dữ liệu mẫu ban đầu</span>
          </button>
        </div>
      </div>

      {/* Confirm Reset Dialog */}
      {showConfirmReset && (
        <div
          id="modal-confirm-reset"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs"
        >
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-3">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-slate-900 text-center mb-1">
              Khôi phục lại dữ liệu mẫu?
            </h4>
            <p className="text-xs text-slate-500 text-center mb-5">
              Hệ thống sẽ nạp lại danh sách học sinh mẫu và các thông số ban đầu của lớp 12A1 THPT Nguyễn Văn An.
            </p>

            <div className="flex items-center justify-center gap-2.5">
              <button
                onClick={() => setShowConfirmReset(false)}
                className="w-1/2 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 hover:bg-slate-100"
              >
                Hủy bỏ
              </button>
              <button
                onClick={() => {
                  onResetData();
                  setShowConfirmReset(false);
                }}
                className="w-1/2 py-2 rounded-xl text-xs sm:text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-sm"
              >
                Khôi phục
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
