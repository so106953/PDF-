import React, { useState } from 'react';
import { Trash2, Calendar, GripVertical, ArrowUp, ArrowDown, LayoutGrid, List, Plus, AlertCircle, RefreshCw, CalendarDays, Edit2, Check } from 'lucide-react';
import { InvoiceFile } from '../types';
import { formatBytes } from '../mockData';

interface QueueListProps {
  files: InvoiceFile[];
  setFiles: React.Dispatch<React.SetStateAction<InvoiceFile[]>>;
  onStartMerge: () => void;
  onClearQueue: () => void;
  onGoBack: () => void;
  onTriggerUpload: () => void;
}

export default function QueueList({
  files,
  setFiles,
  onStartMerge,
  onClearQueue,
  onGoBack,
  onTriggerUpload
}: QueueListProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [autoSortByDate, setAutoSortByDate] = useState(false);
  const [editingFileId, setEditingFileId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [editingDate, setEditingDate] = useState('');

  // Handle reordering
  const moveItem = (index: number, direction: 'up' | 'down') => {
    if (autoSortByDate) {
      alert('已开启按日期自动排序，请关闭自动排序后再手动调整顺序。');
      return;
    }
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= files.length) return;

    const updatedFiles = [...files];
    const temp = updatedFiles[index];
    updatedFiles[index] = updatedFiles[newIndex];
    updatedFiles[newIndex] = temp;
    setFiles(updatedFiles);
  };

  const deleteItem = (id: string) => {
    setFiles(files.filter(f => f.id !== id));
  };

  // Toggle Auto date sorting
  const handleToggleAutoSort = () => {
    const nextVal = !autoSortByDate;
    setAutoSortByDate(nextVal);
    if (nextVal) {
      // Sort files by date ascending
      const sorted = [...files].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      setFiles(sorted);
    }
  };

  // Start in-place editing
  const startEditing = (file: InvoiceFile) => {
    setEditingFileId(file.id);
    setEditingName(file.name);
    setEditingDate(file.date);
  };

  // Save changes
  const saveEditing = (id: string) => {
    setFiles(files.map(f => {
      if (f.id === id) {
        return {
          ...f,
          name: editingName,
          date: editingDate
        };
      }
      return f;
    }));
    setEditingFileId(null);
  };

  return (
    <div className="space-y-6">
      
      {/* Header Info Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-on-surface">待合并发票</h1>
          <p className="text-sm text-on-surface-variant mt-1">
            共检测到 <span className="font-bold text-primary">{files.length}</span> 份文件，您可以自由调整合并顺序。
          </p>
        </div>

        {/* Toolbar widgets */}
        <div className="flex flex-wrap items-center gap-3 bg-surface-container-low p-1.5 rounded-xl border border-outline-variant/40 w-full md:w-auto">
          {/* Auto date sort toggle */}
          <div className="flex items-center gap-2 px-3 py-1 bg-surface-container rounded-lg border border-outline-variant/30 text-xs text-on-surface">
            <span className="font-medium">按日期自动排序</span>
            <button
              onClick={handleToggleAutoSort}
              className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                autoSortByDate ? 'bg-primary' : 'bg-outline-variant'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-4.5 w-4.5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                  autoSortByDate ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="h-5 w-px bg-outline-variant hidden sm:block" />

          {/* Grid vs List layout buttons */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'grid'
                  ? 'bg-primary-container text-on-primary-container'
                  : 'text-on-surface-variant hover:bg-surface-container'
              }`}
              title="网格视图"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'list'
                  ? 'bg-primary-container text-on-primary-container'
                  : 'text-on-surface-variant hover:bg-surface-container'
              }`}
              title="列表视图"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          <div className="h-5 w-px bg-outline-variant" />

          {/* Quick empty queue */}
          <button
            onClick={onClearQueue}
            className="text-xs text-error font-semibold hover:underline px-2 py-1 flex items-center gap-1"
          >
            <Trash2 className="w-3.5 h-3.5" />
            清空
          </button>
        </div>
      </div>

      {/* Grid of cards / List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {files.map((file, index) => {
            const isEditing = editingFileId === file.id;

            return (
              <div
                key={file.id}
                className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group relative"
              >
                {/* Reordering mini pills on hover */}
                <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white/95 border border-outline-variant/40 p-1 rounded-lg shadow-sm z-20">
                  <button
                    disabled={index === 0 || autoSortByDate}
                    onClick={() => moveItem(index, 'up')}
                    className="p-1 rounded hover:bg-surface-container text-on-surface disabled:opacity-30 disabled:hover:bg-transparent"
                    title="移上"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    disabled={index === files.length - 1 || autoSortByDate}
                    onClick={() => moveItem(index, 'down')}
                    className="p-1 rounded hover:bg-surface-container text-on-surface disabled:opacity-30 disabled:hover:bg-transparent"
                    title="移下"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                  <div className="h-4 w-px bg-outline-variant" />
                  <button
                    onClick={() => deleteItem(file.id)}
                    className="p-1 rounded hover:bg-error-container/20 text-error"
                    title="删除发票"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Thumbnail */}
                  <div className="relative aspect-video bg-surface-container rounded-lg overflow-hidden border border-outline-variant/30 flex items-center justify-center">
                    <img
                      src={file.previewUrl}
                      alt={file.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // Fallback image in case of errors
                        e.currentTarget.src = 'https://lh3.googleusercontent.com/aida-public/AB6AXuAwFzcy0VZ5-hJTVBFOEfDNRBm8AJKIMfo3DygYCz9-vRWWnUatVSOnR82M-JKgxWwBMJ-lytpR-WwMjchCSC_W_O9lA1c3D05Oh5fQOWNYj_n9CbF5tPrsV6scDG4zRB9wMOjcGvm7dwdU3gtmaSPmRsRMrJlF1qejM2BIMb1DVsETKjJUcls4ZOozfjxij0u80mhZlKfKiCRZI_dojkU7ABLOmrUOPoQtvReZFO-w7ToaI18kH46i9k9D0PRHZenWx9uUqSnKcnc';
                      }}
                    />
                    <span className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/55 backdrop-blur-sm text-white text-[10px] font-mono rounded-full uppercase">
                      {file.type}
                    </span>
                    <span className="absolute bottom-2 right-2 px-2 py-0.5 bg-primary-container/90 text-on-primary-container text-[10px] font-bold rounded-md">
                      P. {index + 1}
                    </span>
                  </div>

                  {/* Inline metadata editors */}
                  {isEditing ? (
                    <div className="space-y-2 p-2 bg-surface-container-low rounded-lg border border-outline-variant/45">
                      <div>
                        <label className="text-[10px] font-bold text-outline uppercase">发票名称</label>
                        <input
                          type="text"
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          className="w-full text-xs p-1.5 border border-outline rounded bg-white mt-0.5 font-sans"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-outline uppercase">开票日期 (智能提取)</label>
                        <input
                          type="date"
                          value={editingDate}
                          onChange={(e) => setEditingDate(e.target.value)}
                          className="w-full text-xs p-1.5 border border-outline rounded bg-white mt-0.5 font-mono"
                        />
                      </div>
                      <div className="flex justify-end gap-1.5 pt-1">
                        <button
                          onClick={() => setEditingFileId(null)}
                          className="px-2.5 py-1 text-[11px] font-semibold text-on-surface hover:bg-surface-container-high rounded"
                        >
                          取消
                        </button>
                        <button
                          onClick={() => saveEditing(file.id)}
                          className="px-2.5 py-1 text-[11px] font-bold text-white bg-primary rounded flex items-center gap-0.5"
                        >
                          <Check className="w-3 h-3" />
                          保存
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-sans font-bold text-sm text-on-surface line-clamp-1 flex-1 leading-tight" title={file.name}>
                          {file.name}
                        </h3>
                        <button
                          onClick={() => startEditing(file)}
                          className="text-on-surface-variant hover:text-primary p-0.5"
                          title="修改发票信息"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-on-surface-variant font-mono">
                        <span className="flex items-center gap-1 text-primary">
                          <CalendarDays className="w-3.5 h-3.5 shrink-0 text-outline" />
                          {file.date}
                        </span>
                        <span>•</span>
                        <span>{formatBytes(file.size)}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Small indicator */}
                {!isEditing && (
                  <div className="mt-4 pt-3 border-t border-outline-variant/30 flex items-center justify-between text-[11px] text-outline">
                    <span className="font-mono">ID: #{file.id}</span>
                    <span className="bg-surface-container-low px-1.5 py-0.5 rounded font-medium text-on-surface-variant">
                      {file.isReal ? '真实上传' : '示例样张'}
                    </span>
                  </div>
                )}
              </div>
            );
          })}

          {/* Continue adding files card */}
          <div
            onClick={onTriggerUpload}
            className="border-2 border-dashed border-outline-variant/70 rounded-2xl p-6 flex flex-col items-center justify-center min-h-[220px] hover:border-primary hover:bg-surface-container-low transition-all cursor-pointer group"
          >
            <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <Plus className="w-6 h-6 text-outline" />
            </div>
            <p className="font-sans font-bold text-sm text-on-surface">继续添加发票</p>
            <p className="text-xs text-on-surface-variant mt-1">追加更多 PDF 或图片</p>
          </div>
        </div>
      ) : (
        /* List view mode */
        <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl overflow-hidden divide-y divide-outline-variant/40 shadow-sm">
          {files.map((file, index) => {
            const isEditing = editingFileId === file.id;

            return (
              <div
                key={file.id}
                className="p-4 hover:bg-surface-container-low/50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="w-5 flex-shrink-0 flex flex-col items-center justify-center gap-0.5 text-outline">
                    <GripVertical className="w-4 h-4 cursor-grab" />
                    <span className="text-[10px] font-bold font-mono">{index + 1}</span>
                  </div>

                  <div className="w-16 h-12 bg-surface-container rounded border border-outline-variant/30 overflow-hidden shrink-0">
                    <img src={file.previewUrl} className="w-full h-full object-cover" alt="" />
                  </div>

                  {isEditing ? (
                    <div className="flex-1 flex flex-wrap gap-2 items-center">
                      <input
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        className="text-xs p-1 border border-outline rounded bg-white min-w-[150px] flex-1 font-sans"
                      />
                      <input
                        type="date"
                        value={editingDate}
                        onChange={(e) => setEditingDate(e.target.value)}
                        className="text-xs p-1 border border-outline rounded bg-white font-mono"
                      />
                      <button
                        onClick={() => saveEditing(file.id)}
                        className="bg-primary text-white p-1 rounded hover:opacity-90"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="min-w-0 flex-1">
                      <p className="font-sans font-bold text-sm text-on-surface truncate">
                        {file.name}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-on-surface-variant mt-1 font-mono">
                        <span className="text-primary font-medium">{file.date}</span>
                        <span>•</span>
                        <span>{formatBytes(file.size)}</span>
                        <span>•</span>
                        <span className="uppercase text-[10px] bg-surface-container px-1 py-0.2 rounded font-semibold text-outline-variant">
                          {file.type}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                  {!isEditing && (
                    <button
                      onClick={() => startEditing(file)}
                      className="p-1.5 hover:bg-surface-container rounded-lg text-on-surface-variant hover:text-primary transition-colors"
                      title="编辑发票信息"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                  
                  <div className="h-6 w-px bg-outline-variant/40" />

                  <button
                    disabled={index === 0 || autoSortByDate}
                    onClick={() => moveItem(index, 'up')}
                    className="p-1.5 hover:bg-surface-container rounded-lg text-on-surface disabled:opacity-20"
                    title="上移"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button
                    disabled={index === files.length - 1 || autoSortByDate}
                    onClick={() => moveItem(index, 'down')}
                    className="p-1.5 hover:bg-surface-container rounded-lg text-on-surface disabled:opacity-20"
                    title="下移"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>

                  <div className="h-6 w-px bg-outline-variant/40" />

                  <button
                    onClick={() => deleteItem(file.id)}
                    className="p-1.5 hover:bg-error-container/25 rounded-lg text-error"
                    title="删除发票"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Warning message if list is very large */}
      {files.length > 8 && (
        <div className="bg-primary-container/10 border border-primary-container/30 p-3 rounded-xl flex items-start gap-2.5">
          <AlertCircle className="w-4.5 h-4.5 text-primary shrink-0 mt-0.5" />
          <p className="text-xs text-on-primary-container">
            提示：合并较多文件（超过8张）时可能需要较长的规范化时间，我们的云端引擎将会对图像格式自动执行无损尺寸压缩，保障最终合并的 PDF 符合 A4 高清报销标准。
          </p>
        </div>
      )}

      {/* Spacer to prevent bottom bar overlap */}
      <div className="h-28" />

      {/* Bottom Fixed Action Bar */}
      <footer className="fixed bottom-0 left-0 w-full z-40 bg-surface border-t border-outline-variant py-4 px-6 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* Badge indicator */}
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2.5 overflow-hidden">
              {files.slice(0, 3).map((f, i) => (
                <div
                  key={f.id}
                  className="inline-block h-8 w-8 rounded-full bg-primary text-white border-2 border-surface flex items-center justify-center text-[9px] font-bold uppercase shadow-sm"
                >
                  {f.type}
                </div>
              ))}
              {files.length > 3 && (
                <div className="inline-block h-8 w-8 rounded-full bg-primary-container text-on-primary-container border-2 border-surface flex items-center justify-center text-[10px] font-extrabold shadow-sm">
                  +{files.length - 3}
                </div>
              )}
            </div>

            <div className="text-left">
              <p className="text-sm font-bold text-on-surface">
                已选择 <span className="text-primary text-base font-extrabold">{files.length}</span> 份文件进行合并
              </p>
              <p className="text-xs text-on-surface-variant font-mono">
                预估合并后体积: ~{(files.reduce((acc, f) => acc + f.size, 0) / 1024 / 1024 * 0.75).toFixed(1)} MB (已智能无损压缩)
              </p>
            </div>
          </div>

          {/* Cancel & Start merge actions */}
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={onGoBack}
              className="flex-1 sm:flex-none h-11 px-6 bg-white hover:bg-surface-container-high text-on-surface border border-outline rounded-xl font-semibold active:scale-95 transition-all text-sm"
            >
              取消
            </button>
            <button
              onClick={onStartMerge}
              disabled={files.length === 0}
              className="flex-1 sm:flex-none h-11 px-8 bg-primary-container text-on-primary-container hover:brightness-95 disabled:opacity-50 disabled:hover:brightness-100 font-extrabold rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-all text-sm shadow-sm"
            >
              开始合并
            </button>
          </div>

        </div>
      </footer>

    </div>
  );
}
