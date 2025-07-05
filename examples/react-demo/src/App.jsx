/**
 * 雅致PDF预览器 - React演示应用
 * 
 * 本文件展示了如何在React项目中使用雅致PDF预览器
 * 包含完整的功能演示和最佳实践
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { ElegantPDFViewer, usePDFViewer } from '@elegant-pdf/react';
import './App.css';

function App() {
  // ==================== 状态管理 ====================
  
  const [pdfSrc, setPdfSrc] = useState(null);
  const [documentInfo, setDocumentInfo] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageCount, setPageCount] = useState(0);
  const [scale, setScale] = useState(1.0);
  const [targetPage, setTargetPage] = useState(1);
  const [stats, setStats] = useState(null);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('info');
  
  // 查看器设置
  const [showToolbar, setShowToolbar] = useState(true);
  const [showStatusBar, setShowStatusBar] = useState(true);
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [quality, setQuality] = useState(3);
  const [enableTextSelection, setEnableTextSelection] = useState(true);
  const [enableAnnotations, setEnableAnnotations] = useState(true);
  
  // Refs
  const pdfViewerRef = useRef(null);
  const fileInputRef = useRef(null);
  
  // ==================== 工具函数 ====================
  
  /**
   * 显示消息提示
   */
  const showMessage = useCallback((text, type = 'info') => {
    setMessage(text);
    setMessageType(type);
    
    // 自动清除消息
    setTimeout(() => {
      setMessage('');
    }, 5000);
  }, []);
  
  /**
   * 更新统计信息
   */
  const updateStats = useCallback(() => {
    if (pdfViewerRef.current) {
      const newStats = pdfViewerRef.current.getStats();
      setStats(newStats);
    }
  }, []);
  
  // ==================== 文件处理 ====================
  
  /**
   * 处理文件选择
   */
  const handleFileSelect = useCallback((event) => {
    const file = event.target.files[0];
    if (file && file.type === 'application/pdf') {
      setPdfSrc(file);
      showMessage('文件选择成功，正在加载...', 'success');
    } else {
      showMessage('请选择有效的PDF文件', 'error');
    }
  }, [showMessage]);
  
  /**
   * 加载示例PDF
   */
  const loadSamplePDF = useCallback(() => {
    setPdfSrc('https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf');
    showMessage('正在加载示例PDF...', 'info');
  }, [showMessage]);
  
  /**
   * 加载远程PDF
   */
  const loadRemotePDF = useCallback(() => {
    const url = prompt('请输入PDF文件的URL:');
    if (url) {
      setPdfSrc(url);
      showMessage('正在加载远程PDF...', 'info');
    }
  }, [showMessage]);
  
  // ==================== 查看器控制 ====================
  
  /**
   * 跳转到首页
   */
  const goToFirstPage = useCallback(() => {
    pdfViewerRef.current?.goToPage(1);
  }, []);
  
  /**
   * 跳转到末页
   */
  const goToLastPage = useCallback(() => {
    if (pageCount > 0) {
      pdfViewerRef.current?.goToPage(pageCount);
    }
  }, [pageCount]);
  
  /**
   * 跳转到目标页面
   */
  const goToTargetPage = useCallback(() => {
    if (targetPage >= 1 && targetPage <= pageCount) {
      pdfViewerRef.current?.goToPage(targetPage);
    } else {
      showMessage(`页面编号必须在 1-${pageCount} 之间`, 'error');
    }
  }, [targetPage, pageCount, showMessage]);
  
  /**
   * 适应宽度
   */
  const fitWidth = useCallback(() => {
    pdfViewerRef.current?.fitWidth();
  }, []);
  
  /**
   * 适应高度
   */
  const fitHeight = useCallback(() => {
    pdfViewerRef.current?.fitHeight();
  }, []);
  
  /**
   * 处理缩放变化
   */
  const handleScaleChange = useCallback((event) => {
    const newScale = parseFloat(event.target.value);
    pdfViewerRef.current?.setScale(newScale);
  }, []);
  
  // ==================== 事件处理 ====================
  
  /**
   * 文档加载完成
   */
  const handleDocumentLoaded = useCallback((info) => {
    setDocumentInfo(info);
    setPageCount(info.pageCount);
    setTargetPage(1);
    showMessage(`文档加载成功！共 ${info.pageCount} 页`, 'success');
    updateStats();
  }, [showMessage, updateStats]);
  
  /**
   * 页面变化
   */
  const handlePageChanged = useCallback((page) => {
    setCurrentPage(page);
    setTargetPage(page);
    updateStats();
  }, [updateStats]);
  
  /**
   * 缩放变化
   */
  const handleScaleChanged = useCallback((newScale) => {
    setScale(newScale);
    updateStats();
  }, [updateStats]);
  
  /**
   * 页面渲染完成
   */
  const handlePageRendered = useCallback((page) => {
    updateStats();
  }, [updateStats]);
  
  /**
   * 错误处理
   */
  const handleError = useCallback((error) => {
    console.error('PDF错误:', error);
    showMessage(`加载失败: ${error.message}`, 'error');
  }, [showMessage]);
  
  // ==================== 生命周期 ====================
  
  useEffect(() => {
    // 显示欢迎消息
    showMessage('欢迎使用雅致PDF预览器！请选择或加载PDF文件开始预览。', 'info');
  }, [showMessage]);
  
  // ==================== 计算属性 ====================
  
  const canControl = pdfSrc && documentInfo;
  
  // ==================== 渲染 ====================
  
  return (
    <div className="app">
      {/* 头部 */}
      <header className="app-header">
        <h1>🎨 雅致PDF预览器 - React演示</h1>
        <p>纯手工打造的跨框架PDF预览库</p>
      </header>

      {/* 主要内容 */}
      <main className="app-main">
        {/* 控制面板 */}
        <section className="control-panel">
          {/* 文件加载 */}
          <div className="panel-group">
            <h3>📁 文件加载</h3>
            <div className="file-controls">
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileSelect}
                ref={fileInputRef}
                className="file-input"
              />
              <button onClick={loadSamplePDF} className="btn btn-primary">
                加载示例PDF
              </button>
              <button onClick={loadRemotePDF} className="btn btn-secondary">
                加载远程PDF
              </button>
            </div>
          </div>

          {/* 文档信息 */}
          {documentInfo && (
            <div className="panel-group">
              <h3>📊 文档信息</h3>
              <div className="document-info">
                <div className="info-item">
                  <span className="label">标题:</span>
                  <span className="value">{documentInfo.title || '未知'}</span>
                </div>
                <div className="info-item">
                  <span className="label">作者:</span>
                  <span className="value">{documentInfo.author || '未知'}</span>
                </div>
                <div className="info-item">
                  <span className="label">页数:</span>
                  <span className="value">{documentInfo.pageCount}</span>
                </div>
                <div className="info-item">
                  <span className="label">版本:</span>
                  <span className="value">{documentInfo.version}</span>
                </div>
              </div>
            </div>
          )}

          {/* 查看器控制 */}
          <div className="panel-group">
            <h3>🎛️ 查看器控制</h3>
            <div className="viewer-controls">
              <div className="control-row">
                <button onClick={goToFirstPage} className="btn btn-sm" disabled={!canControl}>
                  首页
                </button>
                <button onClick={goToLastPage} className="btn btn-sm" disabled={!canControl}>
                  末页
                </button>
                <button onClick={fitWidth} className="btn btn-sm" disabled={!canControl}>
                  适应宽度
                </button>
                <button onClick={fitHeight} className="btn btn-sm" disabled={!canControl}>
                  适应高度
                </button>
              </div>
              <div className="control-row">
                <label>跳转到页面:</label>
                <input
                  type="number"
                  value={targetPage}
                  onChange={(e) => setTargetPage(parseInt(e.target.value) || 1)}
                  min="1"
                  max={pageCount}
                  onKeyPress={(e) => e.key === 'Enter' && goToTargetPage()}
                  className="page-input"
                  disabled={!canControl}
                />
                <button onClick={goToTargetPage} className="btn btn-sm" disabled={!canControl}>
                  跳转
                </button>
              </div>
              <div className="control-row">
                <label>缩放比例:</label>
                <input
                  type="range"
                  value={scale}
                  onChange={handleScaleChange}
                  min="0.1"
                  max="3"
                  step="0.1"
                  className="scale-slider"
                  disabled={!canControl}
                />
                <span className="scale-display">{Math.round(scale * 100)}%</span>
              </div>
            </div>
          </div>

          {/* 性能统计 */}
          {stats && (
            <div className="panel-group">
              <h3>📈 性能统计</h3>
              <div className="stats-info">
                <div className="stat-item">
                  <span className="label">缓存命中率:</span>
                  <span className="value">{Math.round(stats.cache.hitRate * 100)}%</span>
                </div>
                <div className="stat-item">
                  <span className="label">缓存项数:</span>
                  <span className="value">{stats.cache.itemCount}</span>
                </div>
                <div className="stat-item">
                  <span className="label">渲染时间:</span>
                  <span className="value">{stats.render.renderTime}ms</span>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* PDF查看器 */}
        <section className="viewer-section">
          <div className="viewer-container">
            <ElegantPDFViewer
              ref={pdfViewerRef}
              src={pdfSrc}
              width="100%"
              height={600}
              showToolbar={showToolbar}
              showStatusBar={showStatusBar}
              backgroundColor={backgroundColor}
              quality={quality}
              enableTextSelection={enableTextSelection}
              enableAnnotations={enableAnnotations}
              onDocumentLoaded={handleDocumentLoaded}
              onPageChanged={handlePageChanged}
              onScaleChanged={handleScaleChanged}
              onRendered={handlePageRendered}
              onError={handleError}
            />
          </div>

          {/* 查看器设置 */}
          <div className="viewer-settings">
            <h4>⚙️ 查看器设置</h4>
            <div className="settings-grid">
              <label className="setting-item">
                <input
                  type="checkbox"
                  checked={showToolbar}
                  onChange={(e) => setShowToolbar(e.target.checked)}
                />
                显示工具栏
              </label>
              <label className="setting-item">
                <input
                  type="checkbox"
                  checked={showStatusBar}
                  onChange={(e) => setShowStatusBar(e.target.checked)}
                />
                显示状态栏
              </label>
              <label className="setting-item">
                <input
                  type="checkbox"
                  checked={enableTextSelection}
                  onChange={(e) => setEnableTextSelection(e.target.checked)}
                />
                启用文本选择
              </label>
              <label className="setting-item">
                <input
                  type="checkbox"
                  checked={enableAnnotations}
                  onChange={(e) => setEnableAnnotations(e.target.checked)}
                />
                启用注释
              </label>
            </div>
            <div className="setting-row">
              <label>背景颜色:</label>
              <input
                type="color"
                value={backgroundColor}
                onChange={(e) => setBackgroundColor(e.target.value)}
                className="color-input"
              />
            </div>
            <div className="setting-row">
              <label>渲染质量:</label>
              <select
                value={quality}
                onChange={(e) => setQuality(parseInt(e.target.value))}
                className="quality-select"
              >
                <option value="1">低质量</option>
                <option value="2">较低质量</option>
                <option value="3">中等质量</option>
                <option value="4">较高质量</option>
                <option value="5">高质量</option>
              </select>
            </div>
          </div>
        </section>
      </main>

      {/* 消息提示 */}
      {message && (
        <div className={`message ${messageType}`}>
          {message}
          <button onClick={() => setMessage('')} className="message-close">
            ×
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
