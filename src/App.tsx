import React, { useState, useCallback, useEffect, useRef } from 'react';
import { ChevronRight, MoreHorizontal, Search, ChevronsRight, Eye, EyeOff, AlignLeft, Filter, Grid3x3, Upload, Share2, Calendar, User, Users, Link, Circle, Plus, X, FileDown, FileUp } from 'lucide-react';
import DownSplitArrow from './icons/down-split-arrow.png';
import dots from './icons/dots.png';
import logo from './icons/logo.png';

type Data = {
  jobRequest: string;
  submitted: string;
  status: string;
  submitter: string;
  url: string;
  assigned: string;
  priority: string;
  dueDate: string;
  extract: string;
};

type CellPosition = {
  row: number;
  col: number;
};

const initialData: Data[] = [
  {
    jobRequest: 'Launch social media campaign for product X',
    submitted: '15-11-2024',
    status: 'In-process',
    submitter: 'Aisha Patel',
    url: 'www.aishapatel.com',
    assigned: 'Sophie Choudhury',
    priority: 'Medium',
    dueDate: '20-11-2024',
    extract: '6,200,000',
  },
  {
    jobRequest: 'Update press kit for company redesign',
    submitted: '28-10-2024',
    status: 'Need to start',
    submitter: 'Irfan Khan',
    url: 'www.irfankhanprojects.com',
    assigned: 'Tejas Pandey',
    priority: 'High',
    dueDate: '30-10-2024',
    extract: '3,500,000',
  },
  {
    jobRequest: 'Finalize user testing feedback for app launch',
    submitted: '05-12-2024',
    status: 'In-process',
    submitter: 'Mark Johnson',
    url: 'www.markjohnsonux.com',
    assigned: 'Rachel Lee',
    priority: 'Medium',
    dueDate: '10-12-2024',
    extract: '4,750,000',
  },
  {
    jobRequest: 'Design new features for the website',
    submitted: '10-01-2025',
    status: 'Complete',
    submitter: 'Emily Green',
    url: 'www.emilygreenstudio.com',
    assigned: 'Tom Wright',
    priority: 'Low',
    dueDate: '15-01-2025',
    extract: '5,900,000',
  },
  {
    jobRequest: 'Prepare financial report for Q4',
    submitted: '25-01-2025',
    status: 'Blocked',
    submitter: 'Jessica Brown',
    url: 'www.jessicabrownfinance.com',
    assigned: 'Kevin Smith',
    priority: 'Low',
    dueDate: '30-01-2025',
    extract: '2,800,000',
  },
];

const statusOptions = ['In-process', 'Need to start', 'Complete', 'Blocked'];
const priorityOptions = ['High', 'Medium', 'Low'];

const statusColors: Record<string, string> = {
  'In-process': 'bg-yellow-100 text-yellow-700 border-yellow-200',
  'Need to start': 'bg-blue-100 text-blue-700 border-blue-200',
  'Complete': 'bg-green-100 text-green-700 border-green-200',
  'Blocked': 'bg-red-100 text-red-700 border-red-200',
};

const priorityColors: Record<string, string> = {
  'Medium': 'text-yellow-600',
  'High': 'text-red-600',
  'Low': 'text-blue-600',
};

const columns = [
  { key: 'jobRequest', label: 'Job Request', icon: AlignLeft, width: 'w-[200px]' },
  { key: 'submitted', label: 'Submitted', icon: Calendar, width: 'w-[120px]' },
  { key: 'status', label: 'Status', icon: Circle, width: 'w-[120px]' },
  { key: 'submitter', label: 'Submitter', icon: User, width: 'w-[150px]' },
  { key: 'url', label: 'URL', icon: Link, width: 'w-[150px]' },
  { key: 'assigned', label: 'Assigned', icon: Users, width: 'w-[150px]' },
  { key: 'priority', label: 'Priority', icon: null, width: 'w-[100px]' },
  { key: 'dueDate', label: 'Due Date', icon: Calendar, width: 'w-[120px]' },
  { key: 'extract', label: 'Est. Value', icon: null, width: 'w-[120px]' },
];

const App: React.FC = () => {
  const [data, setData] = useState<Data[]>(initialData);
  const [selectedCell, setSelectedCell] = useState<CellPosition | null>(null);
  const [editingCell, setEditingCell] = useState<CellPosition | null>(null);
  const [editValue, setEditValue] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [hiddenColumns, setHiddenColumns] = useState<Set<string>>(new Set());
  const [sortConfig, setSortConfig] = useState<{key: string, direction: 'asc' | 'desc'} | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showColumnSelector, setShowColumnSelector] = useState(false);
  const [activeFilter, setActiveFilter] = useState('All orders');
  const [showImportModal, setShowImportModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [isToolbarExpanded, setIsToolbarExpanded] = useState(false);
  const tableRef = useRef<HTMLTableElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filters = ['All orders', 'Pending', 'Reviewed', 'Arrived'];

  // Import CSV functionality
  const handleImportCSV = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n');
      const headers = lines[0].split(',').map(h => h.trim());
      
      const importedData: Data[] = [];
      for (let i = 1; i < lines.length; i++) {
        if (lines[i].trim()) {
          const values = lines[i].split(',').map(v => v.trim());
          const row: any = {};
          headers.forEach((header, index) => {
            const columnKey = columns.find(col => col.label.toLowerCase() === header.toLowerCase())?.key;
            if (columnKey) {
              row[columnKey] = values[index] || '';
            }
          });
          if (Object.keys(row).length > 0) {
            importedData.push(row as Data);
          }
        }
      }
      
      setData(prevData => [...prevData, ...importedData]);
      setShowImportModal(false);
      console.log(`Imported ${importedData.length} rows`);
    };
    reader.readAsText(file);
  }, []);

  // Export CSV functionality
  const handleExportCSV = useCallback(() => {
    const headers = columns.map(col => col.label).join(',');
    const csvData = data.map(row => 
      columns.map(col => row[col.key as keyof Data]).join(',')
    ).join('\n');
    
    const csvContent = headers + '\n' + csvData;
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'spreadsheet_data.csv';
    a.click();
    URL.revokeObjectURL(url);
    setShowExportModal(false);
    console.log('Data exported to CSV');
  }, [data]);

  // Export JSON functionality
  const handleExportJSON = useCallback(() => {
    const jsonContent = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'spreadsheet_data.json';
    a.click();
    URL.revokeObjectURL(url);
    setShowExportModal(false);
    console.log('Data exported to JSON');
  }, [data]);

  const handleCellClick = useCallback((row: number, col: number) => {
    const isSameCell = selectedCell?.row === row && selectedCell?.col === col;
    
    setSelectedCell({ row, col });
    
    if (!isSameCell) {
      setEditingCell({ row, col });
      const columnKey = columns[col].key;
      const value = data[row] ? data[row][columnKey as keyof Data] : '';
      setEditValue(value);
    }
    
    console.log(`Cell clicked: Row ${row}, Col ${col}`);
  }, [data, selectedCell]);

  const handleCellEdit = useCallback((value: string) => {
    if (editingCell) {
      const { row, col } = editingCell;
      const columnKey = columns[col].key;
      const newData = [...data];
      
      // Add new row if editing beyond existing data
      while (newData.length <= row) {
        newData.push({
          jobRequest: '',
          submitted: '',
          status: 'Need to start',
          submitter: '',
          url: '',
          assigned: '',
          priority: 'Medium',
          dueDate: '',
          extract: '',
        });
      }
      
      (newData[row] as any)[columnKey] = value;
      setData(newData);
      console.log(`Cell updated: Row ${row}, Col ${col}, New Value: ${value}`);
      setEditingCell(null);
      setEditValue('');
    }
  }, [editingCell, data]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!selectedCell) return;

    const { row, col } = selectedCell;
    const maxRow = Math.max(data.length - 1, 20);
    const maxCol = columns.length - 1;

    switch (e.key) {
      case 'ArrowUp':
        e.preventDefault();
        setSelectedCell({ row: Math.max(0, row - 1), col });
        setEditingCell(null);
        break;
      case 'ArrowDown':
        e.preventDefault();
        setSelectedCell({ row: Math.min(maxRow, row + 1), col });
        setEditingCell(null);
        break;
      case 'ArrowLeft':
        e.preventDefault();
        setSelectedCell({ row, col: Math.max(0, col - 1) });
        setEditingCell(null);
        break;
      case 'ArrowRight':
        e.preventDefault();
        setSelectedCell({ row, col: Math.min(maxCol, col + 1) });
        setEditingCell(null);
        break;
      case 'Enter':
        e.preventDefault();
        if (editingCell) {
          handleCellEdit(editValue);
          setEditingCell(null);
        } else {
          setEditingCell(selectedCell);
          const columnKey = columns[selectedCell.col].key;
          const value = data[selectedCell.row] ? data[selectedCell.row][columnKey as keyof Data] : '';
          setEditValue(value);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setEditingCell(null);
        setEditValue('');
        break;
      case 'Delete':
        e.preventDefault();
        if (selectedCell && !editingCell) {
          const { row, col } = selectedCell;
          const columnKey = columns[col].key;
          const newData = [...data];
          if (newData[row]) {
            (newData[row] as any)[columnKey] = '';
            setData(newData);
          }
        }
        break;
    }
  }, [selectedCell, editingCell, editValue, data.length, handleCellEdit]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const handleSort = useCallback((key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
    
    const sortedData = [...data].sort((a, b) => {
      const aValue = a[key as keyof Data];
      const bValue = b[key as keyof Data];
      
      if (aValue < bValue) return direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return direction === 'asc' ? 1 : -1;
      return 0;
    });
    
    setData(sortedData);
    console.log(`Sorted by ${key} (${direction})`);
  }, [data, sortConfig]);

  const handleAddRow = useCallback(() => {
    const newRowData: Data = {
      jobRequest: '',
      submitted: new Date().toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }),
      status: 'Need to start',
      submitter: '',
      url: '',
      assigned: '',
      priority: 'Medium',
      dueDate: '',
      extract: '',
    };
    setData(prevData => [...prevData, newRowData]);
    setSelectedCell({ row: data.length, col: 0 });
    console.log('New row added');
  }, [data.length]);

  const toggleColumnVisibility = useCallback((columnKey: string) => {
    const newHiddenColumns = new Set(hiddenColumns);
    if (newHiddenColumns.has(columnKey)) {
      newHiddenColumns.delete(columnKey);
    } else {
      newHiddenColumns.add(columnKey);
    }
    setHiddenColumns(newHiddenColumns);
    console.log(`Column ${columnKey} ${newHiddenColumns.has(columnKey) ? 'hidden' : 'shown'}`);
  }, [hiddenColumns]);

  const handleToolbarAction = useCallback((action: string) => {
    setIsProcessing(true);
    console.log(`Toolbar action: ${action}`);
    
    switch (action) {
      case 'import':
        setShowImportModal(true);
        break;
      case 'export':
        setShowExportModal(true);
        break;
      case 'hide_fields':
        setShowColumnSelector(!showColumnSelector);
        break;
      default:
        break;
    }
    
    setTimeout(() => setIsProcessing(false), 500);
  }, [showColumnSelector]);

  const handleAIAction = useCallback((action: string) => {
    console.log(`AI action: ${action}`);
    setIsProcessing(true);
    setTimeout(() => setIsProcessing(false), 1000);
  }, []);

  const renderDropdown = useCallback((row: number, col: number, options: string[], currentValue: string): React.ReactNode => {
  return (
    <select
      value={currentValue}
      onChange={(e) => handleCellEdit(e.target.value)}
      onBlur={() => setEditingCell(null)}
      className="w-full h-full border-none outline-none bg-transparent text-sm"
      autoFocus
    >
      {options.map(option => (
        <option key={option} value={option}>{option}</option>
      ))}
    </select>
  );
}, [handleCellEdit]);

  const renderCell = useCallback((row: number, col: number, value: string | number): React.ReactNode => {
  const isSelected = selectedCell?.row === row && selectedCell?.col === col;
  const isEditing = editingCell?.row === row && editingCell?.col === col;
  const columnKey = columns[col].key;
  
  // Determine alignment based on column type
  let alignmentClass = 'text-left';
  if (['submitted', 'dueDate', 'extract'].includes(columnKey)) {
    alignmentClass = 'text-right';
  } else if (['status', 'priority'].includes(columnKey)) {
    alignmentClass = 'text-center';
  }
  
  let cellContent: React.ReactNode = value; // Change the type to React.ReactNode
  let cellClass = `px-3 py-2 text-xs border-r border-gray-200 relative cursor-cell whitespace-nowrap overflow-hidden text-ellipsis ${alignmentClass}`;

  if (columnKey === 'status') {
    if (isEditing) {
      cellContent = (
        <select
          value={value as string}
          onChange={(e) => handleCellEdit(e.target.value)}
          onBlur={() => setEditingCell(null)}
          className="w-full h-full border-none outline-none bg-transparent text-sm"
          autoFocus
        >
          {statusOptions.map(option => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      );
    } else if (value) {
      cellContent = (
        <div className="flex justify-center">
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${statusColors[value as string] || ''} whitespace-nowrap max-w-full overflow-hidden text-ellipsis`}>
            {value}
          </span>
        </div>
      );
    } else {
      cellContent = '';
    }
  } else if (columnKey === 'priority') {
    cellClass += ` font-medium ${priorityColors[value as string] || ''}`;
    if (isEditing) {
      cellContent = renderDropdown(row, col, priorityOptions, value as string);
    } else {
      cellContent = (
        <div className="flex justify-center">
          <span>{value}</span>
        </div>
      );
    }
  } else if (columnKey === 'url') {
    if (!isEditing) {
      cellContent = (
        <a 
          href={String(value)} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 cursor-pointer underline block max-w-full whitespace-nowrap overflow-hidden text-ellipsis"
        >
          {value}
        </a>
      );
    }
  }
    
    if (isSelected) {
      cellClass += ' ring-2 ring-blue-500 ring-inset bg-blue-50';
    }
    if (isEditing) {
      cellClass += ' bg-white ring-2 ring-blue-700';
    }
    
    if (isEditing && columnKey !== 'status' && columnKey !== 'priority') {
      return (
        <td key={`${row}-${col}`} className={cellClass}>
          <input
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={() => {
              handleCellEdit(editValue);
              setEditingCell(null);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleCellEdit(editValue);
                setEditingCell(null);
              } else if (e.key === 'Escape') {
                setEditingCell(null);
                setEditValue('');
              }
            }}
            className="w-full h-full border-none outline-none bg-transparent whitespace-nowrap"
            autoFocus
          />
        </td>
      );
    }
    
    return (
      <td
        key={`${row}-${col}`}
        className={cellClass}
        onClick={() => handleCellClick(row, col)}
        title={String(value)}
        style={{ maxWidth: columns[col].width.replace('w-', '').replace('[', '').replace(']', '') }}
      >
        {cellContent}
      </td>
    );
  }, [selectedCell, editingCell, editValue, handleCellClick, handleCellEdit, renderDropdown]);

  const visibleColumns = columns.filter(col => !hiddenColumns.has(col.key));

  return (
    <div className="min-h-screen bg-gray-50 relative" style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif" }}>
      {/* Top Navigation */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm">
            <img src={logo} alt="Logo" className="w-7 h-7" />
            <span className="text-gray-500">Workspace</span>
            <ChevronRight className="w-3 h-3 text-gray-400" />
            <span className="text-gray-500">Folder 2</span>
            <ChevronRight className="w-3 h-3 text-gray-400" />
            <span className="text-gray-900 font-medium">Spreadsheet 3</span>
            <MoreHorizontal className="w-4 h-4 text-gray-400 ml-1" />
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2 rounded"/>
              <input
                type="text"
                placeholder="Search within sheet"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-md bg-gray-50 w-64 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" style={{ borderRadius: '5px' }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white border-b border-gray-200 px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsToolbarExpanded(!isToolbarExpanded)}
              className="flex items-center gap-2 text-gray-700 text-sm hover:text-gray-900 transition-colors"
            >
              <span>Tool bar</span>
              <ChevronsRight className={`w-4 h-4 transition-transform duration-200 ${isToolbarExpanded ? 'rotate-90' : ''}`} />
            </button>
            
            <div className={`flex items-center gap-4 overflow-hidden transition-all duration-300 ${isToolbarExpanded ? 'max-w-screen' : 'max-w-0'}`}>
              <div className="relative">
                <button 
                  onClick={() => handleToolbarAction('hide_fields')}
                  className="flex items-center gap-2 text-gray-700 text-sm hover:text-gray-900 transition-colors whitespace-nowrap"
                >
                  <EyeOff className="w-4 h-4" />
                  <span>Hide fields</span>
                </button>
                {showColumnSelector && (
                  <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-md shadow-lg py-2 z-20 min-w-48">
                    {columns.map(column => (
                      <button
                        key={column.key}
                        onClick={() => toggleColumnVisibility(column.key)}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center gap-2"
                      >
                        {hiddenColumns.has(column.key) ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                        {column.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button 
                onClick={() => handleToolbarAction('sort')}
                className="flex items-center gap-2 text-gray-700 text-sm hover:text-gray-900 transition-colors whitespace-nowrap"
              >
                <AlignLeft className="w-4 h-4" />
                <span>Sort</span>
              </button>
              <button 
                onClick={() => handleToolbarAction('filter')}
                className="flex items-center gap-2 text-gray-700 text-sm hover:text-gray-900 transition-colors whitespace-nowrap"
              >
                <Filter className="w-4 h-4" />
                <span>Filter</span>
              </button>
              <button 
                onClick={() => handleToolbarAction('cell_view')}
                className="flex items-center gap-2 text-gray-700 text-sm hover:text-gray-900 transition-colors whitespace-nowrap"
              >
                <Grid3x3 className="w-4 h-4" />
                <span>Cell view</span>
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => handleToolbarAction('import')}
              className="flex items-center gap-2 px-3 py-2 text-gray-700 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors" style={{ borderRadius: '5px' }}
            >
              <FileUp className="w-4 h-4" />
              <span>Import</span>
            </button>
            <button 
              onClick={() => handleToolbarAction('export')}
              className="flex items-center gap-2 px-3 py-2 text-gray-700 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors" style={{ borderRadius: '5px' }}
            >
              <FileDown className="w-4 h-4" />
              <span>Export</span>
            </button>
            <button 
              onClick={() => handleToolbarAction('share')}
              className="flex items-center gap-2 px-3 py-2 text-gray-700 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors" style={{ borderRadius: '5px' }}
            >
              <Share2 className="w-4 h-4" />
              <span>Share</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {/* AI Action Buttons */}
          <div className="flex items-center justify-between border-b border-gray-200">
            <div className="flex items-center gap-2 bg-gray-200" style={{ width: '592px', marginLeft: '37px', height: '37px' }}>
              <div style={{ width: '180px', height: '12px', borderRadius: '10px' }} className="flex items-center justify-between bg-gray-100 py-4 m-2">
                <Circle className="w-4 h-4 text-blue-600 ml-1" />
                <span className="text-sm font-small text-gray-700 mr-1">Q3 Financial Overview</span>
              </div>
              {isProcessing && (
                <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
              )}
            </div>
            <div className="flex">
              <button
                onClick={() => handleAIAction('abc')}
                className="flex items-center gap-2 px-4 py-2 bg-green-50 rounded-md text-sm font-small hover:bg-green-100 transition-colors border border-green-200"
              >
                <img src={DownSplitArrow} alt="Down Split Arrow" className="w-5 h-5" />
                <span>ABC</span>
                <img src={dots} alt="Dots" className="w-3 h-3" />
              </button>

              <button
                onClick={() => handleAIAction('question')}
                className="flex ml-0.4 mr-0.4 items-center gap-2 px-4 py-2 bg-purple-200 rounded-md text-sm font-small hover:bg-purple-300 transition-colors border border-purple-200"
              >
                <img src={DownSplitArrow} alt="Down Split Arrow" className="w-5 h-5" />
                <span>Answer a question</span>
                <img src={dots} alt="Dots" className="w-3 h-3" />
              </button>

              <button
                onClick={() => handleAIAction('extract')}
                className="flex items-center gap-2 px-4 py-2 bg-red-100 border-red-200 rounded-md text-sm font-small hover:bg-red-200 transition-colors border border-red-200"
              >
                <img src={DownSplitArrow} alt="Down Split Arrow" className="w-5 h-5" />
                <span>Extract</span>
                <img src={dots} alt="Dots" className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-auto max-h-96" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            <table ref={tableRef} className="w-full border-collapse">
              <thead className="bg-gray-100 sticky top-0 z-10">
                <tr>
                  <th className="w-8 px-3 py-2 text-left text-xs font-small text-gray-500 border-r border-gray-200">
                    #
                  </th>
                  {visibleColumns.map((column) => (
                    <th
                      key={column.key}
                      className={`px-3 py-2 text-left text-xs font-small text-gray-500 border-r border-gray-200 ${column.width} cursor-pointer hover:bg-gray-100 transition-colors whitespace-nowrap overflow-hidden`}
                      onClick={() => handleSort(column.key)}
                      style={{ width: column.width.replace('w-', '').replace('[', '').replace(']', '') }}
                    >
                      <div className="flex items-center gap-2">
                        {column.icon && <column.icon className="w-3 h-3" />}
                        <span>{column.label}</span>
                        {sortConfig?.key === column.key && (
                          <span className="text-blue-600">
                            {sortConfig.direction === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: Math.max(data.length, 13) }, (_, rowIndex) => (
                  <tr key={rowIndex} className="hover:bg-gray-50 border-b border-gray-100">
                    <td className="w-8 px-3 py-2 text-xs text-gray-400 border-r border-gray-200">
                      {rowIndex + 1}
                    </td>
                    {visibleColumns.map((column, colIndex) => {
                      const value = data[rowIndex] ? data[rowIndex][column.key as keyof Data] : '';
                      return renderCell(rowIndex, colIndex, value);
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 fixed bottom-0 left-0 right-0 z-20">
        <div className="flex items-center gap-2">
          {filters.map(filter => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors relative ${
                activeFilter === filter
                  ? 'bg-gray-200 before:absolute before:top-0 before:left-0 before:right-0 before:h-0.5 before:bg-green-500 before:rounded-t-md'
                  : 'text-gray-700'
              }`}
            >
              {filter}
            </button>
          ))}
          {/* Add Button */}
          <button
            onClick={handleAddRow}
            className="w-8 h-8 text-black rounded-full shadow-lg flex items-center justify-center z-30 hover:bg-gray-300 transition-colors"
          >
            <Plus className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-90vw">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Import Data</h3>
              <button
                onClick={() => setShowImportModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-3">
                Select a CSV file to import. The file should have headers that match the column names.
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleImportCSV}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:text-gray-700 transition-colors"
              >
                <Upload className="w-5 h-5 mx-auto mb-2" />
                Click to select CSV file
              </button>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowImportModal(false)}
                className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-90vw">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Export Data</h3>
              <button
                onClick={() => setShowExportModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-3">
                Choose the format to export your data.
              </p>
              <div className="space-y-2">
                <button
                  onClick={handleExportCSV}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-left hover:bg-gray-50 transition-colors flex items-center gap-3"
                >
                  <FileDown className="w-5 h-5 text-green-600" />
                  <div>
                    <div className="font-medium">Export as CSV</div>
                    <div className="text-sm text-gray-500">Comma-separated values file</div>
                  </div>
                </button>
                <button
                  onClick={handleExportJSON}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-left hover:bg-gray-50 transition-colors flex items-center gap-3"
                >
                  <FileDown className="w-5 h-5 text-blue-600" />
                  <div>
                    <div className="font-medium">Export as JSON</div>
                    <div className="text-sm text-gray-500">JavaScript Object Notation file</div>
                  </div>
                </button>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowExportModal(false)}
                className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Click outside to close column selector */}
      {showColumnSelector && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => setShowColumnSelector(false)}
        />
      )}
    </div>
  );
};

export default App;