import * as XLSX from 'xlsx';
import { Student, Gender, StudentRole, StudentStatus } from '../types';

/**
 * Parses diverse date values from Excel into YYYY-MM-DD
 */
function parseExcelDate(val: any): string {
  if (!val) return '2009-01-01';

  if (val instanceof Date && !isNaN(val.getTime())) {
    const year = val.getFullYear();
    const month = String(val.getMonth() + 1).padStart(2, '0');
    const day = String(val.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // Handle Excel serial date numbers (e.g., 39950)
  if (typeof val === 'number') {
    // Excel epoch base: Dec 30, 1899
    const jsDate = new Date((val - (25567 + 2)) * 86400 * 1000);
    if (!isNaN(jsDate.getTime())) {
      const year = jsDate.getFullYear();
      const month = String(jsDate.getMonth() + 1).padStart(2, '0');
      const day = String(jsDate.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
  }

  const str = String(val).trim();

  // Format DD/MM/YYYY or DD-MM-YYYY or DD.MM.YYYY
  const dmyMatch = str.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})$/);
  if (dmyMatch) {
    const day = dmyMatch[1].padStart(2, '0');
    const month = dmyMatch[2].padStart(2, '0');
    const year = dmyMatch[3];
    return `${year}-${month}-${day}`;
  }

  // Format YYYY/MM/DD or YYYY-MM-DD
  const ymdMatch = str.match(/^(\d{4})[\/\-\.](\d{1,2})[\/\-\.](\d{1,2})$/);
  if (ymdMatch) {
    const year = ymdMatch[1];
    const month = ymdMatch[2].padStart(2, '0');
    const day = ymdMatch[3].padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // If only year is provided (e.g., 2009)
  if (/^\d{4}$/.test(str)) {
    return `${str}-01-01`;
  }

  return '2009-01-01';
}

function normalizeGender(val: any): Gender {
  if (!val) return 'Nam';
  const str = String(val).trim().toLowerCase();
  if (str === 'nữ' || str === 'nu' || str === 'female' || str === 'f' || str === 'gái' || str === 'gai') {
    return 'Nữ';
  }
  return 'Nam';
}

function normalizeRole(val: any): StudentRole {
  if (!val) return 'Học sinh';
  const str = String(val).trim().toLowerCase();
  if (str.includes('trưởng') && !str.includes('tổ')) return 'Lớp trưởng';
  if (str.includes('phó')) return 'Lớp phó';
  if (str.includes('thư')) return 'Bí thư';
  if (str.includes('tổ')) return 'Tổ trưởng';
  return 'Học sinh';
}

function normalizeStatus(val: any): StudentStatus {
  if (!val) return 'Đang học';
  const str = String(val).trim().toLowerCase();
  if (str.includes('chuyển') || str.includes('chuyen')) return 'Chuyển trường';
  if (str.includes('nghỉ') || str.includes('nghi')) return 'Nghỉ học';
  return 'Đang học';
}

export interface ParsedStudentRow {
  name: string;
  dob: string;
  gender: Gender;
  phone: string;
  parentName: string;
  parentPhone: string;
  address: string;
  role: StudentRole;
  status: StudentStatus;
  notes: string;
  rawRowIndex: number;
}

export interface ParseResult {
  success: boolean;
  students: ParsedStudentRow[];
  errors: string[];
  totalRowsFound: number;
}

/**
 * Reads an Excel file (.xlsx, .xls, .csv) and extracts student rows
 */
export async function parseStudentsFromExcel(file: File): Promise<ParseResult> {
  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array', cellDates: true });

        const firstSheetName = workbook.SheetNames[0];
        if (!firstSheetName) {
          resolve({
            success: false,
            students: [],
            errors: ['File không chứa trang tính (sheet) nào hợp lệ.'],
            totalRowsFound: 0,
          });
          return;
        }

        const worksheet = workbook.Sheets[firstSheetName];
        // Read as 2D array of rows
        const rawRows: any[][] = XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
          blankrows: false,
          defval: '',
        });

        if (rawRows.length === 0) {
          resolve({
            success: false,
            students: [],
            errors: ['Trang tính rỗng, không tìm thấy dữ liệu.'],
            totalRowsFound: 0,
          });
          return;
        }

        // Find header row index by scanning first 15 rows for name/họ tên keyword
        let headerRowIndex = -1;
        let colMap: Record<string, number> = {};

        for (let r = 0; r < Math.min(rawRows.length, 15); r++) {
          const row = rawRows[r].map((cell) => String(cell || '').trim().toLowerCase());
          const hasName = row.some((c) =>
            c.includes('họ và tên') || c.includes('họ tên') || c.includes('ten hoc sinh') || c.includes('tên học sinh') || c === 'tên' || c === 'ten' || c === 'họ và tên học sinh'
          );

          if (hasName) {
            headerRowIndex = r;
            // Map column indices
            row.forEach((colName, cIdx) => {
              if (
                colName.includes('họ và tên') ||
                colName.includes('họ tên') ||
                colName.includes('tên học sinh') ||
                colName.includes('ten hoc sinh') ||
                colName === 'tên' ||
                colName === 'ten'
              ) {
                if (colMap['name'] === undefined) colMap['name'] = cIdx;
              } else if (colName.includes('ngày sinh') || colName.includes('ngay sinh') || colName.includes('năm sinh') || colName === 'dob') {
                if (colMap['dob'] === undefined) colMap['dob'] = cIdx;
              } else if (colName.includes('giới tính') || colName.includes('gioi tinh') || colName.includes('phái')) {
                if (colMap['gender'] === undefined) colMap['gender'] = cIdx;
              } else if (colName.includes('sđt hs') || colName.includes('sdt hs') || colName.includes('điện thoại hs') || (colName.includes('điện thoại') && !colName.includes('phụ huynh')) || (colName.includes('sđt') && !colName.includes('phụ huynh') && !colName.includes('ph'))) {
                if (colMap['phone'] === undefined) colMap['phone'] = cIdx;
              } else if (colName.includes('phụ huynh') && (colName.includes('họ tên') || colName.includes('tên') || !colName.includes('sđt'))) {
                if (colMap['parentName'] === undefined) colMap['parentName'] = cIdx;
              } else if ((colName.includes('phụ huynh') || colName.includes('ph')) && (colName.includes('sđt') || colName.includes('sdt') || colName.includes('điện thoại') || colName.includes('phone'))) {
                if (colMap['parentPhone'] === undefined) colMap['parentPhone'] = cIdx;
              } else if (colName.includes('địa chỉ') || colName.includes('dia chi') || colName.includes('thường trú') || colName.includes('nơi ở')) {
                if (colMap['address'] === undefined) colMap['address'] = cIdx;
              } else if (colName.includes('chức vụ') || colName.includes('chuc vu') || colName.includes('vai trò')) {
                if (colMap['role'] === undefined) colMap['role'] = cIdx;
              } else if (colName.includes('trạng thái') || colName.includes('tình trạng') || colName.includes('trang thai')) {
                if (colMap['status'] === undefined) colMap['status'] = cIdx;
              } else if (colName.includes('ghi chú') || colName.includes('ghi chu') || colName.includes('note')) {
                if (colMap['notes'] === undefined) colMap['notes'] = cIdx;
              }
            });
            break;
          }
        }

        // If no header detected, fallback to standard column layout starting at row 0 or 1
        if (headerRowIndex === -1 || colMap['name'] === undefined) {
          // Assume standard columns: [0: STT, 1: Họ tên, 2: Ngày sinh, 3: Giới tính, 4: SĐT HS, 5: Tên PH, 6: SĐT PH, 7: Địa chỉ, 8: Chức vụ, 9: Trạng thái, 10: Ghi chú]
          headerRowIndex = 0;
          colMap = {
            name: 1,
            dob: 2,
            gender: 3,
            phone: 4,
            parentName: 5,
            parentPhone: 6,
            address: 7,
            role: 8,
            status: 9,
            notes: 10,
          };
        }

        const students: ParsedStudentRow[] = [];
        const errors: string[] = [];
        let totalRowsFound = 0;

        for (let r = headerRowIndex + 1; r < rawRows.length; r++) {
          const row = rawRows[r];
          if (!row || row.length === 0) continue;

          const rawName = colMap['name'] !== undefined ? row[colMap['name']] : '';
          const cleanName = String(rawName || '').trim();

          // Skip completely empty lines or summary rows (e.g., "Tổng cộng:")
          if (!cleanName || cleanName.toLowerCase().startsWith('tổng') || cleanName.toLowerCase().startsWith('giáo viên')) {
            continue;
          }

          totalRowsFound++;

          const rawDob = colMap['dob'] !== undefined ? row[colMap['dob']] : '';
          const rawGender = colMap['gender'] !== undefined ? row[colMap['gender']] : '';
          const rawPhone = colMap['phone'] !== undefined ? row[colMap['phone']] : '';
          const rawParentName = colMap['parentName'] !== undefined ? row[colMap['parentName']] : '';
          const rawParentPhone = colMap['parentPhone'] !== undefined ? row[colMap['parentPhone']] : '';
          const rawAddress = colMap['address'] !== undefined ? row[colMap['address']] : '';
          const rawRole = colMap['role'] !== undefined ? row[colMap['role']] : '';
          const rawStatus = colMap['status'] !== undefined ? row[colMap['status']] : '';
          const rawNotes = colMap['notes'] !== undefined ? row[colMap['notes']] : '';

          students.push({
            name: cleanName,
            dob: parseExcelDate(rawDob),
            gender: normalizeGender(rawGender),
            phone: String(rawPhone || '').trim(),
            parentName: String(rawParentName || '').trim(),
            parentPhone: String(rawParentPhone || '').trim(),
            address: String(rawAddress || '').trim(),
            role: normalizeRole(rawRole),
            status: normalizeStatus(rawStatus),
            notes: String(rawNotes || '').trim(),
            rawRowIndex: r + 1,
          });
        }

        if (students.length === 0) {
          errors.push('Không tìm thấy bản ghi học sinh hợp lệ nào trong file. Vui lòng kiểm tra lại cột "Họ và tên".');
          resolve({
            success: false,
            students: [],
            errors,
            totalRowsFound: 0,
          });
          return;
        }

        resolve({
          success: true,
          students,
          errors: [],
          totalRowsFound: students.length,
        });
      } catch (err: any) {
        resolve({
          success: false,
          students: [],
          errors: [`Lỗi khi đọc file Excel: ${err?.message || 'Định dạng file không hỗ trợ'}`],
          totalRowsFound: 0,
        });
      }
    };

    reader.onerror = () => {
      resolve({
        success: false,
        students: [],
        errors: ['Không thể đọc dữ liệu file tải lên.'],
        totalRowsFound: 0,
      });
    };

    reader.readAsArrayBuffer(file);
  });
}

/**
 * Generates and triggers download of a standardized Vietnamese student Excel template
 */
export function downloadStudentTemplate() {
  const headers = [
    'STT',
    'Họ và tên (*)',
    'Ngày sinh (DD/MM/YYYY)',
    'Giới tính (Nam/Nữ)',
    'Số điện thoại HS',
    'Họ tên Phụ huynh',
    'Số điện thoại Phụ huynh',
    'Địa chỉ thường trú',
    'Chức vụ',
    'Trạng thái',
    'Ghi chú',
  ];

  const sampleData = [
    [
      1,
      'Nguyễn Hoàng Anh',
      '15/05/2009',
      'Nam',
      '0912345678',
      'Nguyễn Văn Tuấn (Bố)',
      '0988111222',
      'Số 12, Phố Huế, Hoàn Kiếm, Hà Nội',
      'Lớp trưởng',
      'Đang học',
      'Năng nổ, nhiệt tình, học đều các môn',
    ],
    [
      2,
      'Trần Thị Mai Phương',
      '22/08/2009',
      'Nữ',
      '0923456789',
      'Trần Quốc Dũng (Bố)',
      '0988222333',
      'Tổ 5, Phường Ngọc Hà, Ba Đình, Hà Nội',
      'Lớp phó',
      'Đang học',
      'Cán sự học tập, đội tuyển Tiếng Anh',
    ],
    [
      3,
      'Lê Minh Khang',
      '10/02/2009',
      'Nam',
      '0934567890',
      'Lê Văn Thắng (Bố)',
      '0988333444',
      'Số 45/2 đường Cầu Giấy, Hà Nội',
      'Bí thư',
      'Đang học',
      'Hoạt náo viên phong trào Đoàn',
    ],
    [
      4,
      'Phạm Thu Uyên',
      '03/11/2009',
      'Nữ',
      '0945678901',
      'Phạm Quang Hải (Bố)',
      '0988444555',
      'Số 88 Giải Phóng, Hai Bà Trưng, Hà Nội',
      'Học sinh',
      'Đang học',
      '',
    ],
  ];

  const wsData = [headers, ...sampleData];
  const ws = XLSX.utils.aoa_to_sheet(wsData);

  // Set column widths
  ws['!cols'] = [
    { wch: 6 },  // STT
    { wch: 24 }, // Họ và tên
    { wch: 20 }, // Ngày sinh
    { wch: 16 }, // Giới tính
    { wch: 18 }, // SĐT HS
    { wch: 24 }, // Tên PH
    { wch: 22 }, // SĐT PH
    { wch: 36 }, // Địa chỉ
    { wch: 16 }, // Chức vụ
    { wch: 16 }, // Trạng thái
    { wch: 30 }, // Ghi chú
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Danh Sách Học Sinh');

  XLSX.writeFile(wb, 'Mau_Danh_Sach_Hoc_Sinh_Lop.xlsx');
}

/**
 * Exports current students list to Excel
 */
export function exportStudentsToExcel(
  students: Student[],
  className: string = '12A1',
  schoolName: string = 'THPT Nguyễn Văn An',
  academicYear: string = '2026-2027'
) {
  const titleRows = [
    [`DANH SÁCH HỌC SINH LỚP ${className.toUpperCase()}`],
    [`Trường: ${schoolName} | Năm học: ${academicYear}`],
    [`Ngày xuất danh sách: ${new Date().toLocaleDateString('vi-VN')} | Tổng số: ${students.length} học sinh`],
    [], // empty spacer
  ];

  const headers = [
    'STT',
    'Họ và tên',
    'Ngày sinh',
    'Giới tính',
    'Số điện thoại HS',
    'Họ tên Phụ huynh',
    'SĐT Phụ huynh',
    'Địa chỉ thường trú',
    'Chức vụ',
    'Trạng thái',
    'Ghi chú',
  ];

  const studentRows = students.map((s, idx) => [
    idx + 1,
    s.name,
    s.dob ? formatDateVi(s.dob) : '',
    s.gender,
    s.phone || '',
    s.parentName || '',
    s.parentPhone || '',
    s.address || '',
    s.role || 'Học sinh',
    s.status || 'Đang học',
    s.notes || '',
  ]);

  const wsData = [...titleRows, headers, ...studentRows];
  const ws = XLSX.utils.aoa_to_sheet(wsData);

  ws['!cols'] = [
    { wch: 6 },  // STT
    { wch: 24 }, // Họ và tên
    { wch: 15 }, // Ngày sinh
    { wch: 12 }, // Giới tính
    { wch: 16 }, // SĐT HS
    { wch: 24 }, // Tên PH
    { wch: 18 }, // SĐT PH
    { wch: 35 }, // Địa chỉ
    { wch: 15 }, // Chức vụ
    { wch: 15 }, // Trạng thái
    { wch: 28 }, // Ghi chú
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, `Lớp_${className}`);

  const safeClassName = className.replace(/[^a-zA-Z0-9_-]/g, '_');
  XLSX.writeFile(wb, `Danh_Sach_Lop_${safeClassName}_${academicYear.replace(/[^a-zA-Z0-9_-]/g, '_')}.xlsx`);
}

function formatDateVi(dateStr: string): string {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateStr;
}
