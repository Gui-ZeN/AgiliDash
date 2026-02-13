import { useState, useRef, useEffect } from 'react';
import { Download, FileText, FileSpreadsheet, ChevronDown, Loader2 } from 'lucide-react';

/**
 * Componente ExportButton - Botão de exportaÇão PDF/Excel
 */
const ExportButton = ({
  data = [],
  filename = 'relatorio',
  title = 'Relatorio',
  columns = [],
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [exporting, setExporting] = useState(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatValue = (value) => {
    if (value === null || value === undefined) return '';
    if (typeof value === 'number') {
      return value.toLocaleString('pt-BR', { minimumFractionDigits: 2 });
    }
    return String(value);
  };

  const exportToCSV = async () => {
    setExporting('csv');
    try {
      await new Promise(resolve => setTimeout(resolve, 500)); // Simula processamento

      const headers = columns.map(col => col.label).join(';');
      const rows = data.map(item =>
        columns.map(col => formatValue(item[col.key])).join(';')
      ).join('\n');

      const csvContent = `${headers}\n${rows}`;
      const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      URL.revokeObjectURL(url);
    } finally {
      setExporting(null);
      setIsOpen(false);
    }
  };

  const exportToExcel = async () => {
    setExporting('excel');
    try {
      await new Promise(resolve => setTimeout(resolve, 500));

      // Criar HTML table para Excel
      let html = `
        <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel">
        <head><meta charset="utf-8"><style>td,th{border:1px solid #ddd;padding:8px;}</style></head>
        <body>
        <h2>${title}</h2>
        <table>
        <thead><tr>${columns.map(col => `<th>${col.label}</th>`).join('')}</tr></thead>
        <tbody>
        ${data.map(item => `<tr>${columns.map(col => `<td>${formatValue(item[col.key])}</td>`).join('')}</tr>`).join('')}
        </tbody>
        </table>
        </body></html>
      `;

      const blob = new Blob([html], { type: 'application/vnd.ms-excel;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${filename}_${new Date().toISOString().split('T')[0]}.xls`;
      link.click();
      URL.revokeObjectURL(url);
    } finally {
      setExporting(null);
      setIsOpen(false);
    }
  };

  const exportToPDF = async () => {
    setExporting('pdf');
    try {
      await new Promise(resolve => setTimeout(resolve, 500));

      // Criar HTML para impressão/PDF
      const printContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>${title}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { color: #0e4f6d; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
            th { background: #0e4f6d; color: white; }
            tr:nth-child(even) { background: #f9f9f9; }
            .footer { margin-top: 30px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <h1>${title}</h1>
          <p>Data de geracao: ${new Date().toLocaleDateString('pt-BR')}</p>
          <table>
            <thead><tr>${columns.map(col => `<th>${col.label}</th>`).join('')}</tr></thead>
            <tbody>
            ${data.map(item => `<tr>${columns.map(col => `<td>${formatValue(item[col.key])}</td>`).join('')}</tr>`).join('')}
            </tbody>
          </table>
          <div class="footer">Portal Agili Complex - Relatorio gerado automaticamente</div>
        </body>
        </html>
      `;

      const printWindow = window.open('', '_blank');
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.print();
    } finally {
      setExporting(null);
      setIsOpen(false);
    }
  };

  const options = [
    {
      id: 'pdf',
      label: 'Exportar PDF',
      icon: FileText,
      onClick: exportToPDF,
      color: 'text-red-500'
    },
    {
      id: 'excel',
      label: 'Exportar Excel',
      icon: FileSpreadsheet,
      onClick: exportToExcel,
      color: 'text-emerald-700'
    },
    {
      id: 'csv',
      label: 'Exportar CSV',
      icon: Download,
      onClick: exportToCSV,
      color: 'text-blue-500'
    }
  ];

  return (
    <div className={`relative ${isOpen ? 'z-[95]' : 'z-20'} ${className}`} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={!!exporting}
        className="flex items-center gap-2 px-3 py-2 bg-[#0e4f6d] hover:bg-[#0a3d54] text-white rounded-xl transition-colors disabled:opacity-50"
      >
        {exporting ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Download className="w-4 h-4" />
        )}
        <span className="text-sm font-medium hidden sm:inline">Exportar</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 z-[110] mt-2 w-48 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-md dark:border-slate-700 dark:bg-slate-800">
          {options.map((option) => (
            <button
              key={option.id}
              onClick={option.onClick}
              disabled={!!exporting}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
            >
              {exporting === option.id ? (
                <Loader2 className="w-5 h-5 text-slate-400 animate-spin" />
              ) : (
                <option.icon className={`w-5 h-5 ${option.color}`} />
              )}
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {option.label}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ExportButton;
