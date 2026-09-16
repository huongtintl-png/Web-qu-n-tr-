import React, { useState, useMemo } from 'react';
import {
  ClipboardCheck,
  Award,
  ArrowLeft,
  Save,
  CheckCircle2,
  AlertTriangle,
  Star,
  Search,
  CheckCheck,
  Edit3,
  Calendar,
  Filter,
} from 'lucide-react';
import { Student, ConductRecord, ConductRating, StudentConductEntry } from '../types';

interface ConductViewProps {
  students: Student[];
  conductRecords: ConductRecord[];
  onSaveConduct: (week: number, term: 'Học kỳ 1' | 'Học kỳ 2', entries: Record<string, StudentConductEntry>) => void;
  onBackToHome: () => void;
}

export const ConductView: React.FC<ConductViewProps> = ({
  students,
  conductRecords,
  onSaveConduct,
  onBackToHome,
}) => {
  const [selectedTerm, setSelectedTerm] = useState<'Học kỳ 1' | 'Học kỳ 2'>('Học kỳ 1');
  const [selectedWeek, setSelectedWeek] = useState<number>(2);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRating, setFilterRating] = useState<'all' | ConductRating>('all');

  // Load existing records or initialize defaults for each student
  const activeRecord = useMemo(() => {
    return conductRecords.find(
      (r) => r.week === selectedWeek && r.term === selectedTerm
    );
  }, [conductRecords, selectedWeek, selectedTerm]);

  // Working state for edits
  const [workingEntries, setWorkingEntries] = useState<Record<string, StudentConductEntry>>({});

  // Synchronize when activeRecord changes or students change
  React.useEffect(() => {
    const map: Record<string, StudentConductEntry> = {};
    students.forEach((student) => {
      if (activeRecord && activeRecord.entries[student.id]) {
        map[student.id] = { ...activeRecord.entries[student.id] };
      } else {
        // default to 95 - Tốt
        map[student.id] = {
          score: 95,
          rating: 'Tốt',
          note: 'Chăm ngoan, chấp hành tốt nội quy lớp học.',
        };
      }
    });
    setWorkingEntries(map);
  }, [activeRecord, students, selectedWeek, selectedTerm]);

  // Quick action: Mark all as Tốt
  const handleMarkAllGood = () => {
    const updated: Record<string, StudentConductEntry> = {};
    students.forEach((student) => {
      updated[student.id] = {
        score: 95,
        rating: 'Tốt',
        note: 'Chăm ngoan, chấp hành tốt nề nếp và nội quy trường lớp.',
      };
    });
    setWorkingEntries(updated);
  };

  // Update a student entry
  const handleUpdateStudent = (studentId: string, field: keyof StudentConductEntry, value: any) => {
    setWorkingEntries((prev) => {
      const current = prev[studentId] || {
        score: 90,
        rating: 'Tốt',
        note: '',
      };

      const next = { ...current, [field]: value };

      // Auto-adjust rating based on score if score changed
      if (field === 'score') {
        const num = Number(value);
        if (num >= 90) next.rating = 'Tốt';
        else if (num >= 70) next.rating = 'Khá';
        else if (num >= 50) next.rating = 'Trung bình';
        else next.rating = 'Yếu';
      }

      return {
        ...prev,
        [studentId]: next,
      };
    });
  };

  // Save current record
  const handleSave = () => {
    onSaveConduct(selectedWeek, selectedTerm, workingEntries);
  };

  // Statistics
  const stats = useMemo(() => {
    let tot = 0;
    let kha = 0;
    let tb = 0;
    let yeu = 0;

    (Object.values(workingEntries) as StudentConductEntry[]).forEach((entry) => {
      if (entry.rating === 'Tốt') tot++;
      else if (entry.rating === 'Khá') kha++;
      else if (entry.rating === 'Trung bình') tb++;
      else if (entry.rating === 'Yếu') yeu++;
    });

    const total = students.length || 1;
    return {
      tot,
      totPct: Math.round((tot / total) * 100),
      kha,
      khaPct: Math.round((kha / total) * 100),
      tb,
      tbPct: Math.round((tb / total) * 100),
      yeu,
      yeuPct: Math.round((yeu / total) * 100),
      avgScore: Math.round(
        (Object.values(workingEntries) as StudentConductEntry[]).reduce((acc: number, curr: StudentConductEntry) => acc + (curr.score || 0), 0) / total
      ),
    };
  }, [workingEntries, students]);

  // Filtered student list for table
  const displayedStudents = useMemo(() => {
    return students.filter((s) => {
      const matchSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase());
      const studentRating = workingEntries[s.id]?.rating || 'Tốt';
      const matchRating = filterRating === 'all' || studentRating === filterRating;
      return matchSearch && matchRating;
    });
  }, [students, searchQuery, filterRating, workingEntries]);

  return (
    <div id="conduct-management-view" className="space-y-6 pb-12">
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
              <ClipboardCheck className="w-6 h-6 text-amber-600" />
              <span>Đánh Giá Hạnh Kiểm Lớp 12A1</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Chấm điểm rèn luyện định kỳ theo tuần và tổng kết học kỳ
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleMarkAllGood}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs sm:text-sm font-semibold border border-amber-200 transition-colors"
          >
            <CheckCheck className="w-4 h-4 text-amber-600" />
            <span>Tất cả đạt Tốt</span>
          </button>
          <button
            id="btn-save-conduct"
            onClick={handleSave}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-bold text-sm shadow-sm transition-all"
          >
            <Save className="w-4 h-4" />
            <span>Lưu đánh giá</span>
          </button>
        </div>
      </div>

      {/* Week / Term Selector & Search Controls */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Term Selector */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
            {(['Học kỳ 1', 'Học kỳ 2'] as const).map((term) => (
              <button
                key={term}
                onClick={() => setSelectedTerm(term)}
                className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-all ${
                  selectedTerm === term
                    ? 'bg-white text-blue-800 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {term}
              </button>
            ))}
          </div>

          {/* Week Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">Chọn tuần:</span>
            <select
              value={selectedWeek}
              onChange={(e) => setSelectedWeek(Number(e.target.value))}
              className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              {Array.from({ length: 18 }, (_, i) => i + 1).map((w) => (
                <option key={w} value={w}>
                  Tuần {w} (Tháng {Math.min(12, Math.floor((w - 1) / 4) + 9)}/2026)
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Search & Rating Filter */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm kiếm học sinh..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <select
            value={filterRating}
            onChange={(e) => setFilterRating(e.target.value as any)}
            className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="all">Mọi xếp loại</option>
            <option value="Tốt">Xếp loại Tốt</option>
            <option value="Khá">Xếp loại Khá</option>
            <option value="Trung bình">Xếp loại TB</option>
            <option value="Yếu">Xếp loại Yếu</option>
          </select>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs text-center">
          <div className="text-xs font-semibold text-slate-400 mb-1">Điểm TB Lớp</div>
          <div className="text-2xl font-extrabold text-blue-600">{stats.avgScore}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Thang 100 điểm</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-emerald-200/80 shadow-xs text-center bg-emerald-50/20">
          <div className="text-xs font-semibold text-emerald-700 mb-1 flex items-center justify-center gap-1">
            <Star className="w-3.5 h-3.5 fill-emerald-500 text-emerald-500" />
            Loại Tốt
          </div>
          <div className="text-2xl font-extrabold text-emerald-700">{stats.tot}</div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-0.5">{stats.totPct}% sĩ số</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-blue-200/80 shadow-xs text-center bg-blue-50/20">
          <div className="text-xs font-semibold text-blue-700 mb-1">Loại Khá</div>
          <div className="text-2xl font-extrabold text-blue-700">{stats.kha}</div>
          <div className="text-[11px] text-blue-600 font-semibold mt-0.5">{stats.khaPct}% sĩ số</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-amber-200/80 shadow-xs text-center bg-amber-50/20">
          <div className="text-xs font-semibold text-amber-700 mb-1">Loại TB</div>
          <div className="text-2xl font-extrabold text-amber-700">{stats.tb}</div>
          <div className="text-[11px] text-amber-600 font-semibold mt-0.5">{stats.tbPct}% sĩ số</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-rose-200/80 shadow-xs text-center bg-rose-50/20 col-span-2 sm:col-span-1">
          <div className="text-xs font-semibold text-rose-700 mb-1">Loại Yếu</div>
          <div className="text-2xl font-extrabold text-rose-700">{stats.yeu}</div>
          <div className="text-[11px] text-rose-600 font-semibold mt-0.5">{stats.yeuPct}% sĩ số</div>
        </div>
      </div>

      {/* Conduct Evaluation Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-500" />
            Bảng Đánh Giá Chi Tiết — Tuần {selectedWeek} ({selectedTerm})
          </h3>
          <span className="text-xs text-slate-500">
            Hiển thị: <strong>{displayedStudents.length}</strong> học sinh
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="bg-slate-50/50 border-b border-slate-200 text-xs uppercase text-slate-500 font-bold">
              <tr>
                <th className="px-4 py-3 w-12 text-center">STT</th>
                <th className="px-4 py-3 w-56">Học sinh</th>
                <th className="px-4 py-3 w-28 text-center">Điểm (0-100)</th>
                <th className="px-4 py-3 w-36 text-center">Xếp loại</th>
                <th className="px-4 py-3">Nhận xét của Giáo viên Chủ nhiệm</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {displayedStudents.map((student, idx) => {
                const entry = workingEntries[student.id] || {
                  score: 95,
                  rating: 'Tốt',
                  note: '',
                };

                return (
                  <tr key={student.id} className="hover:bg-amber-50/20 transition-colors">
                    <td className="px-4 py-3 text-center text-xs text-slate-400 font-bold">
                      {idx + 1}
                    </td>

                    <td className="px-4 py-3">
                      <div className="font-bold text-slate-800 text-sm">{student.name}</div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-2">
                        <span>{student.gender}</span>
                        <span>•</span>
                        <span>{student.role}</span>
                      </div>
                    </td>

                    {/* Điểm số */}
                    <td className="px-4 py-3 text-center">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={entry.score}
                        onChange={(e) =>
                          handleUpdateStudent(student.id, 'score', Number(e.target.value))
                        }
                        className="w-18 px-2.5 py-1 text-center font-bold text-slate-800 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                      />
                    </td>

                    {/* Mức xếp loại */}
                    <td className="px-4 py-3 text-center">
                      <select
                        value={entry.rating}
                        onChange={(e) =>
                          handleUpdateStudent(student.id, 'rating', e.target.value as ConductRating)
                        }
                        className={`px-3 py-1 rounded-lg text-xs font-bold border focus:outline-none ${
                          entry.rating === 'Tốt'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                            : entry.rating === 'Khá'
                            ? 'bg-blue-50 text-blue-700 border-blue-300'
                            : entry.rating === 'Trung bình'
                            ? 'bg-amber-50 text-amber-700 border-amber-300'
                            : 'bg-rose-50 text-rose-700 border-rose-300'
                        }`}
                      >
                        <option value="Tốt">Tốt</option>
                        <option value="Khá">Khá</option>
                        <option value="Trung bình">Trung bình</option>
                        <option value="Yếu">Yếu</option>
                      </select>
                    </td>

                    {/* Nhận xét */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          placeholder="Nhập nhận xét cụ thể (ví dụ: Chăm ngoan, tích cực phát biểu...)"
                          value={entry.note}
                          onChange={(e) =>
                            handleUpdateStudent(student.id, 'note', e.target.value)
                          }
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs sm:text-sm bg-slate-50/50 focus:bg-white"
                        />
                        {/* Quick preset buttons for common comments */}
                        <button
                          type="button"
                          onClick={() =>
                            handleUpdateStudent(
                              student.id,
                              'note',
                              'Chăm ngoan, chấp hành tốt nội quy lớp học.'
                            )
                          }
                          className="px-2 py-1 text-[11px] rounded bg-slate-100 hover:bg-slate-200 text-slate-600 whitespace-nowrap hidden lg:inline-block"
                          title="Gợi ý: Mẫu chuẩn"
                        >
                          Mẫu
                        </button>
                      </div>
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
            Lưu ý: Điểm hạnh kiểm được xếp theo thang 100 (Tốt: 90-100, Khá: 70-89, Trung bình: 50-69, Yếu: &lt;50).
          </div>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold shadow-sm transition-all"
          >
            <Save className="w-4 h-4" />
            <span>Lưu tất cả đánh giá</span>
          </button>
        </div>
      </div>
    </div>
  );
};
