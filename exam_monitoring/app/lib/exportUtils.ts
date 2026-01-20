import * as XLSX from 'xlsx';
import { Exam } from '@/types/examtypes';
import { AttendanceRow } from '@/types/attendance';

interface Report {
  _id: string;
  eventType: string;
  description: string;
  timestamp: string;
  supervisorId?: { name: string };
  studentId?: { name: string; idNumber: string };
}

interface ExportData {
  exam: Exam;
  attendance: AttendanceRow[];
  reports: Report[];
  stats: {
    total: number;
    present: number;
    absent: number;
    finished: number;
    attendanceRate: number;
  };
}

/**
 * Export exam report to Excel file
 */
// Helper function to get safe value (handle "-", null, undefined)
function getSafeValue(value: string | number | null | undefined, defaultValue: string = 'לא מוגדר'): string {
  if (value === null || value === undefined || value === '' || value === '-') {
    return defaultValue;
  }
  return String(value);
}

export function exportToExcel(data: ExportData) {
  const { exam, attendance, reports, stats } = data;
  
  // Debug: Log the exam object to see what we're working with
  console.log('Excel Export - Exam object:', exam);
  console.log('Excel Export - Exam fields:', {
    courseName: exam.courseName,
    courseCode: exam.courseCode,
    date: exam.date,
    startTime: exam.startTime,
    endTime: exam.endTime,
    location: exam.location
  });
  
  // Create new workbook
  const workbook = XLSX.utils.book_new();
  
  // Note: xlsx library doesn't support RTL at workbook level, but we'll set it at cell level

  // Sheet 1: General summary
  const summaryData: (string | number)[][] = [
    ['דוח מבחן - סיכום כללי'],
    [],
    ['פרטי המבחן'],
    ['קורס:', getSafeValue(exam.courseName)],
    ['קוד קורס:', getSafeValue(exam.courseCode?.toString(), '')],
    ['תאריך:', getSafeValue(exam.date)],
    ['שעה:', `${getSafeValue(exam.startTime)} - ${getSafeValue(exam.endTime)}`],
    ['מיקום:', getSafeValue(exam.location)],
    [],
    ['סטטיסטיקות'],
    ['סה"כ סטודנטים:', stats.total.toString()],
    ['נוכחו:', stats.present.toString()],
    ['נעדרו:', stats.absent.toString()],
    ['סיימו:', stats.finished.toString()],
    ['אחוז נוכחות:', `${stats.attendanceRate}%`],
  ];

  // Reverse column order for RTL layout (start from rightmost column)
  const reversedSummaryData = summaryData.map(row => {
    const reversedRow: (string | number)[] = [];
    for (let i = row.length - 1; i >= 0; i--) {
      reversedRow.push(row[i]);
    }
    return reversedRow;
  });
  
  const summarySheet = XLSX.utils.aoa_to_sheet(reversedSummaryData);
  
  // Set RTL for all cells in summary sheet
  const range = XLSX.utils.decode_range(summarySheet['!ref'] || 'A1');
  for (let R = range.s.r; R <= range.e.r; ++R) {
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
      if (!summarySheet[cellAddress]) continue;
      if (!summarySheet[cellAddress].s) summarySheet[cellAddress].s = {};
      summarySheet[cellAddress].s.alignment = {
        horizontal: 'right',
        vertical: 'center',
        readingOrder: 2, // RTL - right to left
        indent: 0,
      };
      // Set Hebrew-supporting font
      summarySheet[cellAddress].s.font = {
        name: 'Arial',
        sz: 11,
      };
    }
  }
  
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'סיכום');

  // Sheet 2: Attendance list
  const attendanceData = [
    ['#', 'שם', 'ת.ז', 'סטטוס', 'זמן התחלה', 'זמן סיום', 'זמן נוסף (דקות)', 'בשירותים'],
  ];

  attendance.forEach((record, idx) => {
    const statusMap: Record<string, string> = {
      present: 'נוכח',
      absent: 'נעדר',
      finished: 'סיים',
      transferred: 'הועבר',
    };

    attendanceData.push([
      (idx + 1).toString(),
      record.studentId.name,
      record.studentId.idNumber,
      statusMap[record.attendanceStatus] || record.attendanceStatus,
      record.startTime ? new Date(record.startTime).toLocaleString('he-IL') : '',
      record.endTime ? new Date(record.endTime).toLocaleString('he-IL') : '',
      (record.extraTimeMinutes || 0).toString(),
      record.isOnToilet ? 'כן' : 'לא',
    ]);
  });

  // Reverse column order for RTL layout
  const reversedAttendanceData = attendanceData.map(row => {
    const reversedRow: (string | number)[] = [];
    for (let i = row.length - 1; i >= 0; i--) {
      reversedRow.push(row[i]);
    }
    return reversedRow;
  });
  
  const attendanceSheet = XLSX.utils.aoa_to_sheet(reversedAttendanceData);
  
  // Set column widths (reversed order)
  const numCols = attendanceData[0]?.length || 8;
  attendanceSheet['!cols'] = Array(numCols).fill(null).map(() => ({ wch: 15 }));
  // Set specific widths for reversed columns (right to left: bathroom, extra time, end time, start time, status, ID, name, #)
  attendanceSheet['!cols'][0] = { wch: 10 }; // Last column (bathroom)
  attendanceSheet['!cols'][1] = { wch: 15 }; // Extra time
  attendanceSheet['!cols'][2] = { wch: 20 }; // End time
  attendanceSheet['!cols'][3] = { wch: 20 }; // Start time
  attendanceSheet['!cols'][4] = { wch: 12 }; // Status
  attendanceSheet['!cols'][5] = { wch: 12 }; // ID number
  attendanceSheet['!cols'][6] = { wch: 20 }; // Name
  attendanceSheet['!cols'][7] = { wch: 5 };  // #
  
  // Set RTL for all cells in attendance sheet
  const attendanceRange = XLSX.utils.decode_range(attendanceSheet['!ref'] || 'A1');
  for (let R = attendanceRange.s.r; R <= attendanceRange.e.r; ++R) {
    for (let C = attendanceRange.s.c; C <= attendanceRange.e.c; ++C) {
      const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
      if (!attendanceSheet[cellAddress]) continue;
      if (!attendanceSheet[cellAddress].s) attendanceSheet[cellAddress].s = {};
      attendanceSheet[cellAddress].s.alignment = {
        horizontal: 'right',
        vertical: 'center',
        readingOrder: 2, // RTL - right to left
        indent: 0,
      };
      // Header row - more prominent
      if (R === 0) {
        attendanceSheet[cellAddress].s.font = {
          bold: true,
          color: { rgb: 'FFFFFF' },
          name: 'Arial',
          sz: 11,
        };
        attendanceSheet[cellAddress].s.fill = {
          fgColor: { rgb: '4285F4' },
        };
      } else {
        // Regular cells - Hebrew-supporting font
        attendanceSheet[cellAddress].s.font = {
          name: 'Arial',
          sz: 11,
        };
      }
    }
  }

  XLSX.utils.book_append_sheet(workbook, attendanceSheet, 'נוכחות');

  // Sheet 3: Reports
  if (reports.length > 0) {
    const reportsData = [
      ['סוג אירוע', 'תיאור', 'סטודנט', 'ת.ז סטודנט', 'משגיח', 'תאריך ושעה'],
    ];

    reports.forEach((report) => {
      reportsData.push([
        report.eventType,
        report.description || '',
        report.studentId?.name || '',
        report.studentId?.idNumber || '',
        report.supervisorId?.name || '',
        new Date(report.timestamp).toLocaleString('he-IL'),
      ]);
    });

    // Reverse column order for RTL layout
    const reversedReportsData = reportsData.map(row => {
      const reversedRow: (string | number)[] = [];
      for (let i = row.length - 1; i >= 0; i--) {
        reversedRow.push(row[i]);
      }
      return reversedRow;
    });

    const reportsSheet = XLSX.utils.aoa_to_sheet(reversedReportsData);
    
    // Set column widths (reversed order)
    const numReportCols = reportsData[0]?.length || 6;
    reportsSheet['!cols'] = Array(numReportCols).fill(null).map(() => ({ wch: 20 }));
    // Set specific widths for reversed columns (right to left: date/time, supervisor, ID, student, description, event type)
    reportsSheet['!cols'][0] = { wch: 20 }; // Last column (date and time)
    reportsSheet['!cols'][1] = { wch: 20 }; // Supervisor
    reportsSheet['!cols'][2] = { wch: 12 }; // ID number
    reportsSheet['!cols'][3] = { wch: 20 }; // Student
    reportsSheet['!cols'][4] = { wch: 40 }; // Description
    reportsSheet['!cols'][5] = { wch: 25 }; // Event type
    
    // Set RTL for all cells in reports sheet
    const reportsRange = XLSX.utils.decode_range(reportsSheet['!ref'] || 'A1');
    for (let R = reportsRange.s.r; R <= reportsRange.e.r; ++R) {
      for (let C = reportsRange.s.c; C <= reportsRange.e.c; ++C) {
        const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
        if (!reportsSheet[cellAddress]) continue;
        if (!reportsSheet[cellAddress].s) reportsSheet[cellAddress].s = {};
        reportsSheet[cellAddress].s.alignment = {
          horizontal: 'right',
          vertical: 'center',
          readingOrder: 2, // RTL - right to left
          indent: 0,
        };
        // Header row - more prominent
        if (R === 0) {
          reportsSheet[cellAddress].s.font = {
            bold: true,
            color: { rgb: 'FFFFFF' },
            name: 'Arial',
            sz: 11,
          };
          reportsSheet[cellAddress].s.fill = {
            fgColor: { rgb: 'FF9800' },
          };
        } else {
          // Regular cells - Hebrew-supporting font
          reportsSheet[cellAddress].s.font = {
            name: 'Arial',
            sz: 11,
          };
        }
      }
    }

    XLSX.utils.book_append_sheet(workbook, reportsSheet, 'דיווחים');
  }

  // Create file name
  const fileName = `דוח_מבחן_${exam.courseName}_${exam.date?.replace(/\//g, '-') || 'לא_מוגדר'}.xlsx`;
  
  // Download file
  XLSX.writeFile(workbook, fileName);
}

/**
 * Export exam report to PDF file with Hebrew support
 * Uses html2canvas to convert HTML to PDF and maintain Hebrew support
 */
export async function exportToPDF(data: ExportData) {
  // Ensure we're on client side
  if (typeof window === 'undefined') {
    throw new Error('PDF export is only available on client side');
  }

  const { exam, attendance, reports, stats } = data;
  
  // Debug: Log the exam object to see what we're working with
  console.log('PDF Export - Exam object:', exam);
  console.log('PDF Export - Exam fields:', {
    courseName: exam.courseName,
    courseCode: exam.courseCode,
    date: exam.date,
    startTime: exam.startTime,
    endTime: exam.endTime,
    location: exam.location
  });
  
  // Dynamic import for client-side only
  const [{ default: jsPDF }, html2canvas] = await Promise.all([
    import('jspdf'),
    import('html2canvas')
  ]);

  // Create temporary HTML element with content
  const tempDiv = document.createElement('div');
  tempDiv.style.position = 'absolute';
  tempDiv.style.left = '-9999px';
  tempDiv.style.width = '210mm'; // A4 width
  tempDiv.style.padding = '20mm';
  tempDiv.style.backgroundColor = '#ffffff';
  tempDiv.style.fontFamily = 'Arial, "Noto Sans Hebrew", sans-serif';
  tempDiv.style.direction = 'rtl';
  tempDiv.style.textAlign = 'right';
  tempDiv.innerHTML = `
    <div style="text-align: center; margin-bottom: 20px;">
      <h1 style="font-size: 24px; font-weight: bold; margin-bottom: 10px;">דוח מבחן</h1>
    </div>
    
    <div style="margin-bottom: 20px;">
      <h2 style="font-size: 18px; font-weight: bold; margin-bottom: 10px;">פרטי המבחן</h2>
      <p><strong>קורס:</strong> ${getSafeValue(exam.courseName)}</p>
      ${exam.courseCode && exam.courseCode !== '-' ? `<p><strong>קוד קורס:</strong> ${exam.courseCode}</p>` : ''}
      <p><strong>תאריך:</strong> ${getSafeValue(exam.date)}</p>
      <p><strong>שעה:</strong> ${getSafeValue(exam.startTime)} - ${getSafeValue(exam.endTime)}</p>
      <p><strong>מיקום:</strong> ${getSafeValue(exam.location)}</p>
    </div>
    
    <div style="margin-bottom: 20px;">
      <h2 style="font-size: 18px; font-weight: bold; margin-bottom: 10px;">סטטיסטיקות</h2>
      <p><strong>סה"כ סטודנטים:</strong> ${stats.total}</p>
      <p><strong>נוכחו:</strong> ${stats.present}</p>
      <p><strong>נעדרו:</strong> ${stats.absent}</p>
      <p><strong>סיימו:</strong> ${stats.finished}</p>
      <p><strong>אחוז נוכחות:</strong> ${stats.attendanceRate}%</p>
    </div>
    
    ${attendance.length > 0 ? `
    <div style="margin-bottom: 20px;">
      <h2 style="font-size: 18px; font-weight: bold; margin-bottom: 10px;">רשימת נוכחות</h2>
      <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
        <thead>
          <tr style="background-color: #4285f4; color: white;">
            <th style="border: 1px solid #ddd; padding: 8px; text-align: right;">#</th>
            <th style="border: 1px solid #ddd; padding: 8px; text-align: right;">שם</th>
            <th style="border: 1px solid #ddd; padding: 8px; text-align: right;">ת.ז</th>
            <th style="border: 1px solid #ddd; padding: 8px; text-align: right;">סטטוס</th>
            <th style="border: 1px solid #ddd; padding: 8px; text-align: right;">זמן התחלה</th>
            <th style="border: 1px solid #ddd; padding: 8px; text-align: right;">זמן סיום</th>
            <th style="border: 1px solid #ddd; padding: 8px; text-align: right;">זמן נוסף</th>
            <th style="border: 1px solid #ddd; padding: 8px; text-align: right;">בשירותים</th>
          </tr>
        </thead>
        <tbody>
          ${attendance.map((record, idx) => {
            const statusMap: Record<string, string> = {
              present: 'נוכח',
              absent: 'נעדר',
              finished: 'סיים',
              transferred: 'הועבר',
            };
            const bgColor = idx % 2 === 0 ? '#f5f5f5' : '#ffffff';
            return `
              <tr style="background-color: ${bgColor};">
                <td style="border: 1px solid #ddd; padding: 6px; text-align: right;">${idx + 1}</td>
                <td style="border: 1px solid #ddd; padding: 6px; text-align: right;">${record.studentId.name}</td>
                <td style="border: 1px solid #ddd; padding: 6px; text-align: right;">${record.studentId.idNumber}</td>
                <td style="border: 1px solid #ddd; padding: 6px; text-align: right;">${statusMap[record.attendanceStatus] || record.attendanceStatus}</td>
                <td style="border: 1px solid #ddd; padding: 6px; text-align: right;">${record.startTime ? new Date(record.startTime).toLocaleString('he-IL') : ''}</td>
                <td style="border: 1px solid #ddd; padding: 6px; text-align: right;">${record.endTime ? new Date(record.endTime).toLocaleString('he-IL') : ''}</td>
                <td style="border: 1px solid #ddd; padding: 6px; text-align: right;">${record.extraTimeMinutes || 0}</td>
                <td style="border: 1px solid #ddd; padding: 6px; text-align: right;">${record.isOnToilet ? 'כן' : 'לא'}</td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    </div>
    ` : ''}
    
    ${reports.length > 0 ? `
    <div style="margin-bottom: 20px;">
      <h2 style="font-size: 18px; font-weight: bold; margin-bottom: 10px;">דיווחים</h2>
      <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
        <thead>
          <tr style="background-color: #ff9800; color: white;">
            <th style="border: 1px solid #ddd; padding: 8px; text-align: right;">סוג אירוע</th>
            <th style="border: 1px solid #ddd; padding: 8px; text-align: right;">תיאור</th>
            <th style="border: 1px solid #ddd; padding: 8px; text-align: right;">סטודנט</th>
            <th style="border: 1px solid #ddd; padding: 8px; text-align: right;">ת.ז</th>
            <th style="border: 1px solid #ddd; padding: 8px; text-align: right;">משגיח</th>
            <th style="border: 1px solid #ddd; padding: 8px; text-align: right;">תאריך ושעה</th>
          </tr>
        </thead>
        <tbody>
          ${reports.map((report, idx) => {
            const bgColor = idx % 2 === 0 ? '#fff8dc' : '#ffffff';
            return `
              <tr style="background-color: ${bgColor};">
                <td style="border: 1px solid #ddd; padding: 6px; text-align: right;">${report.eventType}</td>
                <td style="border: 1px solid #ddd; padding: 6px; text-align: right;">${report.description || ''}</td>
                <td style="border: 1px solid #ddd; padding: 6px; text-align: right;">${report.studentId?.name || ''}</td>
                <td style="border: 1px solid #ddd; padding: 6px; text-align: right;">${report.studentId?.idNumber || ''}</td>
                <td style="border: 1px solid #ddd; padding: 6px; text-align: right;">${report.supervisorId?.name || ''}</td>
                <td style="border: 1px solid #ddd; padding: 6px; text-align: right;">${new Date(report.timestamp).toLocaleString('he-IL')}</td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    </div>
    ` : ''}
    
    <div style="margin-top: 30px; text-align: center; font-size: 10px; color: #666;">
      נוצר ב: ${new Date().toLocaleString('he-IL')}
    </div>
  `;

  document.body.appendChild(tempDiv);

  try {
    // Convert HTML to canvas
    const canvas = await html2canvas.default(tempDiv, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
    });

    // Create PDF from canvas
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const imgWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;

    // Add first image
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    // Add additional pages if needed
    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    // Create file name and download
    const fileName = `דוח_מבחן_${exam.courseName}_${exam.date?.replace(/\//g, '-') || 'לא_מוגדר'}.pdf`;
    pdf.save(fileName);
  } finally {
    // Cleanup - remove temporary element
    document.body.removeChild(tempDiv);
  }
}
