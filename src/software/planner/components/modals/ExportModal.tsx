import React, { useRef } from 'react';
import { useProject } from '../../context/ProjectContext';
import { X, Download, Upload, FileText, FileSpreadsheet, Code } from 'lucide-react';

export const ExportModal: React.FC = () => {
  const { project, isExportModalOpen, setIsExportModalOpen, loadProjectTemplate } = useProject();
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isExportModalOpen) return null;

  // Export JSON
  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(project, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${project.code || 'project'}_data.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Export CSV
  const handleExportCSV = () => {
    let csv = 'ID,WBS,Task Name,Duration,Start Date,Finish Date,Percent Complete,Status,Priority,Cost\n';
    project.tasks.forEach((t, i) => {
      const cleanName = `"${t.name.replace(/"/g, '""')}"`;
      csv += `${i + 1},${t.wbs},${cleanName},${t.duration},${t.startDate},${t.finishDate},${t.percentComplete}%,${t.status},${t.priority},${t.totalCost || 0}\n`;
    });

    const dataStr = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${project.code || 'project'}_tasks.csv`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Import JSON file
  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], 'UTF-8');
      fileReader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (parsed && parsed.tasks) {
            loadProjectTemplate(parsed);
            setIsExportModalOpen(false);
          } else {
            alert('Invalid project JSON file format.');
          }
        } catch (err) {
          alert('Error parsing JSON file.');
        }
      };
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 select-none">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="h-14 bg-slate-950 border-b border-slate-800 px-6 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Download className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-bold text-slate-100">Project Data Import & Export</h2>
          </div>
          <button
            onClick={() => setIsExportModalOpen(false)}
            className="p-1 hover:bg-slate-800 text-slate-400 hover:text-slate-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-xs font-sans">
          <div className="space-y-3">
            <h3 className="font-bold text-slate-300 uppercase tracking-wider text-[11px]">
              Export Options
            </h3>

            <button
              onClick={handleExportJSON}
              className="w-full p-3.5 bg-slate-950 border border-slate-800 hover:border-cyan-500/80 rounded-xl flex items-center justify-between transition text-left group"
            >
              <div className="flex items-center space-x-3">
                <Code className="w-5 h-5 text-cyan-400" />
                <div>
                  <span className="font-bold text-slate-100 block">Export Full Project JSON</span>
                  <span className="text-[11px] text-slate-400">
                    Complete project state, WBS, dependencies, resources, and baselines.
                  </span>
                </div>
              </div>
              <Download className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 transition" />
            </button>

            <button
              onClick={handleExportCSV}
              className="w-full p-3.5 bg-slate-950 border border-slate-800 hover:border-emerald-500/80 rounded-xl flex items-center justify-between transition text-left group"
            >
              <div className="flex items-center space-x-3">
                <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
                <div>
                  <span className="font-bold text-slate-100 block">Export CSV Task Schedule</span>
                  <span className="text-[11px] text-slate-400">
                    Spreadsheet readable format compatible with Excel and Google Sheets.
                  </span>
                </div>
              </div>
              <Download className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 transition" />
            </button>
          </div>

          <div className="border-t border-slate-800 pt-4 space-y-3">
            <h3 className="font-bold text-slate-300 uppercase tracking-wider text-[11px]">
              Import Option
            </h3>

            <input
              type="file"
              ref={fileInputRef}
              accept=".json"
              onChange={handleFileImport}
              className="hidden"
            />

            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full p-3.5 bg-slate-950 border border-slate-800 hover:border-amber-500/80 rounded-xl flex items-center justify-between transition text-left group"
            >
              <div className="flex items-center space-x-3">
                <Upload className="w-5 h-5 text-amber-400" />
                <div>
                  <span className="font-bold text-slate-100 block">Import Project JSON</span>
                  <span className="text-[11px] text-slate-400">
                    Upload an EVLab project file (.json) to restore complete project workspace.
                  </span>
                </div>
              </div>
              <Upload className="w-4 h-4 text-slate-500 group-hover:text-amber-400 transition" />
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="h-14 bg-slate-950 border-t border-slate-800 px-6 flex items-center justify-end">
          <button
            onClick={() => setIsExportModalOpen(false)}
            className="px-4 py-1.5 rounded-lg bg-slate-800 text-slate-300 font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
