<template>
  <div id="app">
    <!-- 头部 -->
    <header class="app-header">
      <h1>🎨 雅致PDF预览器 - Vue3演示</h1>
      <p>纯手工打造的跨框架PDF预览库</p>
    </header>

    <!-- 主要内容 -->
    <main class="app-main">
      <!-- 控制面板 -->
      <section class="control-panel">
        <div class="panel-group">
          <h3>📁 文件加载</h3>
          <div class="file-controls">
            <input
              type="file"
              accept=".pdf"
              @change="handleFileSelect"
              ref="fileInput"
              class="file-input"
            />
            <button @click="loadSamplePDF" class="btn btn-primary">
              加载示例PDF
            </button>
            <button @click="loadRemotePDF" class="btn btn-secondary">
              加载远程PDF
            </button>
          </div>
        </div>

        <div class="panel-group" v-if="documentInfo">
          <h3>📊 文档信息</h3>
          <div class="document-info">
            <div class="info-item">
              <span class="label">标题:</span>
              <span class="value">{{ documentInfo.title || '未知' }}</span>
            </div>
            <div class="info-item">
              <span class="label">作者:</span>
              <span class="value">{{ documentInfo.author || '未知' }}</span>
            </div>
            <div class="info-item">
              <span class="label">页数:</span>
              <span class="value">{{ documentInfo.pageCount }}</span>
            </div>
            <div class="info-item">
              <span class="label">版本:</span>
              <span class="value">{{ documentInfo.version }}</span>
            </div>
          </div>
        </div>

        <div class="panel-group">
          <h3>🎛️ 查看器控制</h3>
          <div class="viewer-controls">
            <div class="control-row">
              <button @click="goToFirstPage" class="btn btn-sm" :disabled="!canControl">
                首页
              </button>
              <button @click="goToLastPage" class="btn btn-sm" :disabled="!canControl">
                末页
              </button>
              <button @click="fitWidth" class="btn btn-sm" :disabled="!canControl">
                适应宽度
              </button>
              <button @click="fitHeight" class="btn btn-sm" :disabled="!canControl">
                适应高度
              </button>
            </div>
            <div class="control-row">
              <label>跳转到页面:</label>
              <input
                type="number"
                v-model.number="targetPage"
                :min="1"
                :max="pageCount"
                @keyup.enter="goToTargetPage"
                class="page-input"
                :disabled="!canControl"
              />
              <button @click="goToTargetPage" class="btn btn-sm" :disabled="!canControl">
                跳转
              </button>
            </div>
            <div class="control-row">
              <label>缩放比例:</label>
              <input
                type="range"
                v-model.number="scaleValue"
                :min="0.1"
                :max="3"
                :step="0.1"
                @input="handleScaleChange"
                class="scale-slider"
                :disabled="!canControl"
              />
              <span class="scale-display">{{ Math.round(scale * 100) }}%</span>
            </div>
          </div>
        </div>

        <div class="panel-group" v-if="stats">
          <h3>📈 性能统计</h3>
          <div class="stats-info">
            <div class="stat-item">
              <span class="label">缓存命中率:</span>
              <span class="value">{{ Math.round(stats.cache.hitRate * 100) }}%</span>
            </div>
            <div class="stat-item">
              <span class="label">缓存项数:</span>
              <span class="value">{{ stats.cache.itemCount }}</span>
            </div>
            <div class="stat-item">
              <span class="label">渲染时间:</span>
              <span class="value">{{ stats.render.renderTime }}ms</span>
            </div>
          </div>
        </div>
      </section>

      <!-- PDF查看器 -->
      <section class="viewer-section">
        <div class="viewer-container">
          <ElegantPDFViewer
            ref="pdfViewer"
            :src="pdfSrc"
            :width="'100%'"
            :height="viewerHeight"
            :show-toolbar="showToolbar"
            :show-status-bar="showStatusBar"
            :background-color="backgroundColor"
            :quality="quality"
            :enable-text-selection="enableTextSelection"
            :enable-annotations="enableAnnotations"
            @document-loaded="onDocumentLoaded"
            @page-changed="onPageChanged"
            @scale-changed="onScaleChanged"
            @rendered="onPageRendered"
            @error="onError"
          />
        </div>

        <!-- 查看器设置 -->
        <div class="viewer-settings">
          <h4>⚙️ 查看器设置</h4>
          <div class="settings-grid">
            <label class="setting-item">
              <input type="checkbox" v-model="showToolbar" />
              显示工具栏
            </label>
            <label class="setting-item">
              <input type="checkbox" v-model="showStatusBar" />
              显示状态栏
            </label>
            <label class="setting-item">
              <input type="checkbox" v-model="enableTextSelection" />
              启用文本选择
            </label>
            <label class="setting-item">
              <input type="checkbox" v-model="enableAnnotations" />
              启用注释
            </label>
          </div>
          <div class="setting-row">
            <label>背景颜色:</label>
            <input type="color" v-model="backgroundColor" class="color-input" />
          </div>
          <div class="setting-row">
            <label>渲染质量:</label>
            <select v-model.number="quality" class="quality-select">
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

    <!-- 消息提示 -->
    <div v-if="message" :class="['message', messageType]">
      {{ message }}
      <button @click="clearMessage" class="message-close">×</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue';
import { ElegantPDFViewer } from '@elegant-pdf/vue3';

// ==================== 响应式数据 ====================

const pdfViewer = ref(null);
const fileInput = ref(null);
const pdfSrc = ref(null);
const documentInfo = ref(null);
const currentPage = ref(1);
const pageCount = ref(0);
const scale = ref(1.0);
const scaleValue = ref(1.0);
const targetPage = ref(1);
const stats = ref(null);
const message = ref('');
const messageType = ref('info');

// 查看器设置
const showToolbar = ref(true);
const showStatusBar = ref(true);
const backgroundColor = ref('#ffffff');
const quality = ref(3);
const enableTextSelection = ref(true);
const enableAnnotations = ref(true);
const viewerHeight = ref(600);

// ==================== 计算属性 ====================

const canControl = computed(() => {
  return pdfSrc.value && documentInfo.value;
});

// ==================== 方法定义 ====================

/**
 * 处理文件选择
 */
const handleFileSelect = (event) => {
  const file = event.target.files[0];
  if (file && file.type === 'application/pdf') {
    pdfSrc.value = file;
    showMessage('文件选择成功，正在加载...', 'success');
  } else {
    showMessage('请选择有效的PDF文件', 'error');
  }
};

/**
 * 加载示例PDF
 */
const loadSamplePDF = () => {
  // 这里使用一个公开的PDF文件作为示例
  pdfSrc.value = 'https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf';
  showMessage('正在加载示例PDF...', 'info');
};

/**
 * 加载远程PDF
 */
const loadRemotePDF = () => {
  const url = prompt('请输入PDF文件的URL:');
  if (url) {
    pdfSrc.value = url;
    showMessage('正在加载远程PDF...', 'info');
  }
};

/**
 * 跳转到首页
 */
const goToFirstPage = () => {
  pdfViewer.value?.goToPage(1);
};

/**
 * 跳转到末页
 */
const goToLastPage = () => {
  if (pageCount.value > 0) {
    pdfViewer.value?.goToPage(pageCount.value);
  }
};

/**
 * 跳转到目标页面
 */
const goToTargetPage = () => {
  if (targetPage.value >= 1 && targetPage.value <= pageCount.value) {
    pdfViewer.value?.goToPage(targetPage.value);
  } else {
    showMessage(`页面编号必须在 1-${pageCount.value} 之间`, 'error');
  }
};

/**
 * 适应宽度
 */
const fitWidth = () => {
  pdfViewer.value?.fitWidth();
};

/**
 * 适应高度
 */
const fitHeight = () => {
  pdfViewer.value?.fitHeight();
};

/**
 * 处理缩放变化
 */
const handleScaleChange = () => {
  pdfViewer.value?.setScale(scaleValue.value);
};

/**
 * 显示消息
 */
const showMessage = (text, type = 'info') => {
  message.value = text;
  messageType.value = type;
  
  // 自动清除消息
  setTimeout(() => {
    clearMessage();
  }, 5000);
};

/**
 * 清除消息
 */
const clearMessage = () => {
  message.value = '';
  messageType.value = 'info';
};

/**
 * 更新统计信息
 */
const updateStats = () => {
  if (pdfViewer.value) {
    stats.value = pdfViewer.value.getStats();
  }
};

// ==================== 事件处理 ====================

/**
 * 文档加载完成
 */
const onDocumentLoaded = (info) => {
  documentInfo.value = info;
  pageCount.value = info.pageCount;
  targetPage.value = 1;
  showMessage(`文档加载成功！共 ${info.pageCount} 页`, 'success');
  updateStats();
};

/**
 * 页面变化
 */
const onPageChanged = (page) => {
  currentPage.value = page;
  targetPage.value = page;
  updateStats();
};

/**
 * 缩放变化
 */
const onScaleChanged = (newScale) => {
  scale.value = newScale;
  scaleValue.value = newScale;
  updateStats();
};

/**
 * 页面渲染完成
 */
const onPageRendered = (page) => {
  updateStats();
};

/**
 * 错误处理
 */
const onError = (error) => {
  console.error('PDF错误:', error);
  showMessage(`加载失败: ${error.message}`, 'error');
};

// ==================== 生命周期 ====================

onMounted(async () => {
  await nextTick();
  
  // 计算查看器高度
  const updateViewerHeight = () => {
    const windowHeight = window.innerHeight;
    const headerHeight = 120;
    const controlsHeight = 100;
    viewerHeight.value = Math.max(400, windowHeight - headerHeight - controlsHeight);
  };
  
  updateViewerHeight();
  window.addEventListener('resize', updateViewerHeight);
  
  // 显示欢迎消息
  showMessage('欢迎使用雅致PDF预览器！请选择或加载PDF文件开始预览。', 'info');
});
</script>

<style scoped>
/* 全局样式 */
#app {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

/* 头部样式 */
.app-header {
  text-align: center;
  padding: 20px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  color: white;
  margin-bottom: 20px;
}

.app-header h1 {
  margin: 0 0 10px 0;
  font-size: 2.5em;
  font-weight: 300;
}

.app-header p {
  margin: 0;
  font-size: 1.2em;
  opacity: 0.9;
}

/* 主要内容 */
.app-main {
  display: flex;
  gap: 20px;
  padding: 0 20px 20px;
  max-width: 1400px;
  margin: 0 auto;
}

/* 控制面板 */
.control-panel {
  width: 350px;
  background: white;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  height: fit-content;
}

.panel-group {
  margin-bottom: 25px;
}

.panel-group:last-child {
  margin-bottom: 0;
}

.panel-group h3 {
  margin: 0 0 15px 0;
  color: #333;
  font-size: 1.1em;
  border-bottom: 2px solid #667eea;
  padding-bottom: 5px;
}

/* 文件控制 */
.file-controls {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.file-input {
  padding: 8px;
  border: 2px dashed #ddd;
  border-radius: 5px;
  background: #fafafa;
}

/* 按钮样式 */
.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s ease;
  outline: none;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-secondary {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
}

.btn-sm {
  padding: 6px 12px;
  font-size: 12px;
}

.btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

/* 文档信息 */
.document-info,
.stats-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.info-item,
.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px;
  background: #f8f9fa;
  border-radius: 5px;
}

.label {
  font-weight: 500;
  color: #666;
}

.value {
  font-weight: 600;
  color: #333;
}

/* 查看器控制 */
.viewer-controls {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.control-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.page-input {
  width: 60px;
  padding: 4px 8px;
  border: 1px solid #ddd;
  border-radius: 3px;
  text-align: center;
}

.scale-slider {
  flex: 1;
  min-width: 100px;
}

.scale-display {
  min-width: 50px;
  text-align: center;
  font-weight: 500;
  color: #667eea;
}

/* 查看器区域 */
.viewer-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.viewer-container {
  background: white;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

/* 查看器设置 */
.viewer-settings {
  background: white;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.viewer-settings h4 {
  margin: 0 0 15px 0;
  color: #333;
}

.settings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 10px;
  margin-bottom: 15px;
}

.setting-item {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 5px;
  border-radius: 3px;
  transition: background-color 0.2s;
}

.setting-item:hover {
  background: #f0f0f0;
}

.setting-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.color-input {
  width: 50px;
  height: 30px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.quality-select {
  padding: 5px 10px;
  border: 1px solid #ddd;
  border-radius: 3px;
  background: white;
}

/* 消息提示 */
.message {
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 15px 20px;
  border-radius: 5px;
  color: white;
  font-weight: 500;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  z-index: 1000;
  display: flex;
  align-items: center;
  gap: 10px;
  max-width: 400px;
}

.message.info {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.message.success {
  background: linear-gradient(135deg, #56ab2f 0%, #a8e6cf 100%);
}

.message.error {
  background: linear-gradient(135deg, #ff416c 0%, #ff4b2b 100%);
}

.message-close {
  background: none;
  border: none;
  color: white;
  font-size: 18px;
  cursor: pointer;
  padding: 0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .app-main {
    flex-direction: column;
  }
  
  .control-panel {
    width: 100%;
  }
}

@media (max-width: 768px) {
  .app-header h1 {
    font-size: 2em;
  }
  
  .app-header p {
    font-size: 1em;
  }
  
  .control-panel {
    padding: 15px;
  }
  
  .settings-grid {
    grid-template-columns: 1fr;
  }
}
</style>
