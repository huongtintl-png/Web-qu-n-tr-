import React, { useState, useRef } from 'react';
import {
  FileSpreadsheet,
  Download,
  Upload,
  CheckCircle2,
  AlertTriangle,
  X,
  FileCheck,
  RotateCcw,
  Users,
} from 'lucide-react';
import { Student } from '../types';
import {
  parseStudentsFromExcel,
  downloadStudentTemplate,
  ParsedStudentRow,
} from '../utils/excelUtils';

interface ExcelImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentStudentCount: number;
  onImportSuccess: (
    students: Omit<Student, 'id' | 'stt'>[],
    mode: 'append' | 'replace'
  ) => void;
}

export const ExcelImportModal: React.FC<ExcelImportModalProps> = ({
  isOpen,
  onClose,
  currentStudentCount,
  onImportSuccess,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [parsedRows, setParsedRows] = useState<ParsedStudentRow[]>([]);
  const [errorMessages, setErrorMessages] = useState<string[]>([]);
  const [importMode, setImportMode] = useState<'append' | 'replace'>('append');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleReset = () => {
    setFile(null);
    setParsedRows([]);
    setErrorMessages([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleProcessFile = async (selectedFile: File) => {
    if (!selectedFile) return;

    // Check extension
    const validExtensions = ['.xlsx', '.xls', '.csv'];
    const fileName = selectedFile.name.toLowerCase();
    const isValid = validExtensions.some((ext) => fileName.endsWith(ext));

    if (!isValid) {
      setErrorMessages(['Vui lòng chọn file có định dạng Excel (.xlsx, .xls) hoặc CSV.']);
      return;
    }

    setFile(selectedFile);
    setIsParsing(true);
    setErrorMessages([]);

    try {
      const result = await parseStudentsFromExcel(selectedFile);
      if (result.success && result.students.length > 0) {
        setParsedRows(result.students);
      } else {
        setErrorMessages(
          result.errors.length > 0
            ? result.errors
            : ['Không tìm thấy dữ liệu học sinh trong file. Vui lòng kiểm tra lại định dạng file.']
        );
      }
    } catch (err: any) {
      setErrorMessages([err?.message || 'Có lỗi xảy ra trong quá trình đọc file.']);
    } finally {
      setIsParsing(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleProcessFile(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleProcessFile(e.dataTransfer.files[0]);
    }
  };

  const handleConfirmImport = () => {
    if (parsedRows.length === 0) return;

    const formattedData: Omit<Student, 'id' | 'stt'>[] = parsedRows.map((r) => ({
      name: r.name,
      dob: r.dob,
      gender: r.gender,
      phone: r.phone,
      parentName: r.parentName,
      parentPhone: r.parentPhone,
      address: r.address,
      role: r.role,
      status: r.status,
      notes: r.notes,
    }));

    onImportSuccess(formattedData, importMode);
    handleReset();
    onClose();
  };

  return (
    <div
      id="modal-excel-import"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto"
    >
      <div className="bg-white rounded-2xl max-w-3xl w-full p-5 sm:p-6 shadow-2xl border border-slate-100 my-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-extrabold text-slate-900">
                Nhập danh sách học sinh từ file Excel
              </h3>
              <p className="text-xs text-slate-500">
                Tự động đọc các cột họ tên, ngày sinh, giới tính, liên hệ phụ huynh
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              handleReset();
              onClose();
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step 1: Download template & instructions */}
        <div className="mt-4 bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-xs text-slate-600 leading-relaxed">
            <span className="font-bold text-slate-800 block mb-0.5">Chưa có file mẫu chuẩn?</span>
            Tải mẫu Excel chuẩn Bộ GD&ĐT để nhập liệu nhanh và chính xác nhất.
          </div>
          <button
            id="btn-download-excel-template"
            type="button"
            onClick={downloadStudentTemplate}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 text-xs font-semibold shadow-xs transition-colors shrink-0"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600" />
            <span>Tải file Excel mẫu (.xlsx)</span>
          </button>
        </div>

        {/* Step 2: Upload Area */}
        {!parsedRows.length && (
          <div className="mt-4">
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-8 sm:p-10 text-center cursor-pointer transition-all ${
                isDragging
                  ? 'border-emerald-500 bg-emerald-50/50 scale-[1.01]'
                  : 'border-slate-300 hover:border-emerald-500 hover:bg-slate-50/70'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx, .xls, .csv"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3">
                <Upload className="w-7 h-7" />
              </div>
              <h4 className="text-sm sm:text-base font-bold text-slate-800 mb-1">
                Kéo thả file Excel vào đây, hoặc click để chọn file
              </h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Hỗ trợ định dạng <strong>.xlsx</strong>, <strong>.xls</strong> hoặc <strong>.csv</strong>. Dung lượng tối đa 10MB.
              </p>
            </div>

            {isParsing && (
              <div className="mt-4 p-4 rounded-xl bg-blue-50 text-blue-700 text-xs flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <span>Đang phân tích dữ liệu bảng tính...</span>
              </div>
            )}
          </div>
        )}

        {/* Error Messages */}
        {errorMessages.length > 0 && (
          <div className="mt-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs space-y-1">
            <div className="flex items-center gap-1.5 font-bold">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>Không thể phân tích dữ liệu:</span>
            </div>
            {errorMessages.map((msg, i) => (
              <p key={i} className="pl-5 text-rose-600">
                • {msg}
              </p>
            ))}
          </div>
        )}

        {/* Step 3: Preview Data Table */}
        {parsedRows.length > 0 && (
          <div className="mt-4 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-emerald-50/80 p-3 rounded-xl border border-emerald-200 text-emerald-900 text-xs">
              <div className="flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  Đã đọc file: <strong className="font-mono">{file?.name}</strong> (Tìm thấy <strong>{parsedRows.length}</strong> học sinh hợp lệ)
                </span>
              </div>
              <button
                type="button"
                onClick={handleReset}
                className="flex items-center gap-1 text-slate-600 hover:text-slate-900 font-semibold self-start sm:self-auto"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Chọn file khác</span>
              </button>
            </div>

            {/* Preview table */}
            <div className="border border-slate-200 rounded-xl overflow-hidden max-h-64 overflow-y-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-100 text-slate-600 uppercase font-bold sticky top-0 border-b border-slate-200">
                  <tr>
                    <th className="px-3 py-2 text-center w-12">STT</th>
                    <th className="px-3 py-2">Họ và tên</th>
                    <th className="px-3 py-2">Ngày sinh</th>
                    <th className="px-3 py-2">Giới tính</th>
                    <th className="px-3 py-2">SĐT HS</th>
                    <th className="px-3 py-2">Phụ huynh</th>
                    <th className="px-3 py-2">SĐT Phụ huynh</th>
                    <th className="px-3 py-2">Chức vụ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {parsedRows.map((st, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/80">
                      <td className="px-3 py-2 text-center font-mono text-slate-400">
                        {idx + 1}
                      </td>
                      <td className="px-3 py-2 font-semibold text-slate-900">
                        {st.name}
                      </td>
                      <td className="px-3 py-2 font-mono text-slate-600">
                        {st.dob}
                      </td>
                      <td className="px-3 py-2">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[11px] font-semibold ${
                            st.gender === 'Nam'
                              ? 'bg-blue-50 text-blue-700'
                              : 'bg-rose-50 text-rose-700'
                          }`}
                        >
                          {st.gender}
                        </span>
                      </td>
                      <td className="px-3 py-2 font-mono text-slate-600">
                        {st.phone || '-'}
                      </td>
                      <td className="px-3 py-2 text-slate-800">
                        {st.parentName || '-'}
                      </td>
                      <td className="px-3 py-2 font-mono text-slate-600">
                        {st.parentPhone || '-'}
                      </td>
                      <td className="px-3 py-2 text-slate-700">
                        {st.role}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mode selection */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              <span className="font-semibold text-slate-700">
                Phương thức thêm vào danh sách lớp hiện tại ({currentStudentCount} học sinh):
              </span>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="importMode"
                    value="append"
                    checked={importMode === 'append'}
                    onChange={() => setImportMode('append')}
                    className="text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>Thêm nối tiếp (+{parsedRows.length})</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer text-amber-800">
                  <input
                    type="radio"
                    name="importMode"
                    value="replace"
                    checked={importMode === 'replace'}
                    onChange={() => setImportMode('replace')}
                    className="text-amber-600 focus:ring-amber-500"
                  />
                  <span>Ghi đè danh sách lớp</span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Footer actions */}
        <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={() => {
              handleReset();
              onClose();
            }}
            className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
          >
            Đóng
          </button>
          {parsedRows.length > 0 && (
            <button
              id="btn-confirm-import-excel"
              type="button"
              onClick={handleConfirmImport}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs sm:text-sm shadow-sm transition-all"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Xác nhận nhập {parsedRows.length} học sinh</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
