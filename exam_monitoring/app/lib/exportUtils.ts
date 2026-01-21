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

// Helper function to get safe value (handle "-", null, undefined)
function getSafeValue(value: string | number | null | undefined, defaultValue: string = 'לא מוגדר'): string {
  if (value === null || value === undefined || value === '' || value === '-') {
    return defaultValue;
  }
  return String(value);
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
