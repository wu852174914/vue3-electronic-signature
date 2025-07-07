<template>
  <div id="app">
    <div class="container">
      <h1>Vue3 电子签名组件库演示</h1>
      
      <!-- 基础示例 -->
      <section class="demo-section">
        <h2>基础签名</h2>
        <p>最简单的签名组件使用方式</p>
        <ElectronicSignature
          ref="basicSignatureRef"
          :width="400"
          :height="200"
          placeholder="请在此处签名"
          @signature-start="onSignatureStart"
          @signature-end="onSignatureEnd"
        />
        <div class="demo-controls">
          <button @click="clearBasicSignature">清除</button>
          <button @click="saveBasicSignature">保存为PNG</button>
          <button @click="exportBasicSignatureSVG">导出SVG</button>
        </div>
      </section>

      <!-- 自定义样式示例 -->
      <section class="demo-section">
        <h2>自定义样式</h2>
        <p>自定义画笔颜色、粗细和背景</p>
        <div class="style-controls">
          <label>
            画笔颜色：
            <input v-model="customStyle.strokeColor" type="color" />
          </label>
          <label>
            画笔粗细：
            <input 
              v-model.number="customStyle.strokeWidth" 
              type="range" 
              min="1" 
              max="10" 
            />
            {{ customStyle.strokeWidth }}px
          </label>
          <label>
            背景颜色：
            <input v-model="customStyle.backgroundColor" type="color" />
          </label>
          <label>
            <input v-model="customStyle.smoothing" type="checkbox" />
            启用平滑绘制
          </label>
          <label>
            <input v-model="customStyle.pressureSensitive" type="checkbox" />
            启用压感效果
          </label>
        </div>
        <ElectronicSignature
          ref="customSignatureRef"
          :width="400"
          :height="200"
          :stroke-color="customStyle.strokeColor"
          :stroke-width="customStyle.strokeWidth"
          :background-color="customStyle.backgroundColor"
          :smoothing="customStyle.smoothing"
          :pressure-sensitive="customStyle.pressureSensitive"
          :min-stroke-width="1"
          :max-stroke-width="6"
          placeholder="自定义样式签名"
          show-toolbar
        />
      </section>

      <!-- 响应式示例 -->
      <section class="demo-section">
        <h2>响应式签名</h2>
        <p>支持百分比宽度，自适应容器大小</p>
        <div class="responsive-container" :style="{ width: responsiveWidth + 'px' }">
          <ElectronicSignature
            ref="responsiveSignatureRef"
            width="100%"
            :height="150"
            stroke-color="#2196F3"
            :stroke-width="3"
            placeholder="响应式签名区域"
            border-style="2px dashed #2196F3"
            border-radius="8px"
          />
        </div>
        <div class="demo-controls">
          <label>
            容器宽度：
            <input 
              v-model.number="responsiveWidth" 
              type="range" 
              min="300" 
              max="600" 
            />
            {{ responsiveWidth }}px
          </label>
        </div>
      </section>

      <!-- 数据操作示例 -->
      <section class="demo-section">
        <h2>数据操作</h2>
        <p>获取、设置和操作签名数据</p>
        <ElectronicSignature
          ref="dataSignatureRef"
          :width="400"
          :height="200"
          stroke-color="#4CAF50"
          placeholder="数据操作演示"
          show-toolbar
        />
        <div class="demo-controls">
          <button @click="getSignatureData">获取签名数据</button>
          <button @click="loadSampleSignature">加载示例签名</button>
          <button @click="copySignature">复制到剪贴板</button>
        </div>
        <div v-if="signatureDataInfo" class="data-info">
          <h4>签名信息：</h4>
          <p>路径数量：{{ signatureDataInfo.pathCount }}</p>
          <p>点数量：{{ signatureDataInfo.pointCount }}</p>
          <p>画布尺寸：{{ signatureDataInfo.canvasSize }}</p>
          <p>是否为空：{{ signatureDataInfo.isEmpty ? '是' : '否' }}</p>
          <p>创建时间：{{ signatureDataInfo.timestamp }}</p>
        </div>
      </section>

      <!-- 签名回放功能 -->
      <section class="demo-section">
        <h2>🎬 签名回放功能</h2>
        <p>录制和回放签名过程，支持播放控制和速度调节</p>

        <!-- 录制区域 -->
        <div class="replay-demo-container">
          <div class="recording-area">
            <h4>📝 录制签名</h4>
            <ElectronicSignature
              ref="recordingSignatureRef"
              :width="400"
              :height="200"
              stroke-color="#E91E63"
              :stroke-width="3"
              placeholder="请在此处签名以录制回放数据"
              show-toolbar
              @signature-start="onRecordingStart"
              @signature-end="onRecordingEnd"
              @signature-clear="onRecordingClear"
            />
            <div class="demo-controls">
              <button @click="clearRecording">清除录制</button>
              <button @click="generateReplayData" :disabled="!hasRecordingData">生成回放数据</button>
            </div>
            <div v-if="recordingInfo" class="recording-info">
              <p><strong>录制状态:</strong> {{ recordingStatus }}</p>
              <p><strong>笔画数量:</strong> {{ recordingInfo.pathCount }}</p>
              <p><strong>总点数:</strong> {{ recordingInfo.totalPoints }}</p>
            </div>
          </div>

          <!-- 回放区域 -->
          <div class="playback-area">
            <h4>🎬 回放签名</h4>
            <ElectronicSignature
              ref="playbackSignatureRef"
              :width="400"
              :height="200"
              :replay-mode="replayMode"
              :replay-data="replayData"
              :replay-options="replayOptions"
              @replay-start="onReplayStart"
              @replay-progress="onReplayProgress"
              @replay-pause="onReplayPause"
              @replay-resume="onReplayResume"
              @replay-stop="onReplayStop"
              @replay-complete="onReplayComplete"
              @replay-path-start="onReplayPathStart"
              @replay-path-end="onReplayPathEnd"
              @replay-speed-change="onReplaySpeedChange"
            />

            <!-- 自定义回放控制 -->
            <div class="custom-replay-controls">
              <div class="control-buttons">
                <button
                  @click="startReplay"
                  :disabled="!replayData || replayState === 'playing'"
                  class="btn-play"
                >
                  ▶️ 播放
                </button>
                <button
                  @click="pauseReplay"
                  :disabled="replayState !== 'playing'"
                  class="btn-pause"
                >
                  ⏸️ 暂停
                </button>
                <button
                  @click="stopReplay"
                  :disabled="replayState === 'idle'"
                  class="btn-stop"
                >
                  ⏹️ 停止
                </button>
                <button
                  @click="toggleReplayMode"
                  class="btn-mode"
                >
                  {{ replayMode ? '退出回放模式' : '进入回放模式' }}
                </button>
              </div>

              <div class="replay-settings">
                <label>
                  回放速度：
                  <select v-model="selectedSpeed" @change="changeReplaySpeed">
                    <option value="0.5">0.5x</option>
                    <option value="1">1x</option>
                    <option value="1.5">1.5x</option>
                    <option value="2">2x</option>
                  </select>
                </label>
                <label>
                  <input v-model="replayOptions.loop" type="checkbox" />
                  循环播放
                </label>
                <label>
                  <input v-model="replayOptions.showControls" type="checkbox" />
                  显示内置控制条
                </label>
              </div>
            </div>

            <!-- 回放信息面板 -->
            <div v-if="replayData" class="replay-info-panel">
              <div class="replay-status">
                <h5>📊 回放状态</h5>
                <p><strong>状态:</strong> {{ replayState }}</p>
                <p><strong>进度:</strong> {{ Math.round(replayProgress * 100) }}%</p>
                <p><strong>当前时间:</strong> {{ formatTime(currentTime) }}</p>
                <p><strong>总时长:</strong> {{ formatTime(totalDuration) }}</p>
                <p><strong>当前笔画:</strong> {{ currentPathIndex + 1 }} / {{ replayData.paths.length }}</p>
              </div>

              <div class="signature-metadata">
                <h5>📈 签名分析</h5>
                <p><strong>设备类型:</strong> {{ replayData.metadata.deviceType }}</p>
                <p><strong>平均速度:</strong> {{ Math.round(replayData.metadata.averageSpeed) }} 像素/秒</p>
                <p><strong>总距离:</strong> {{ Math.round(replayData.metadata.totalDistance) }} 像素</p>
                <p><strong>平均停顿:</strong> {{ replayData.metadata.averagePauseTime }} 毫秒</p>
                <p><strong>笔画数量:</strong> {{ replayData.paths.length }}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 导出预览 -->
      <section class="demo-section">
        <h2>导出预览</h2>
        <div v-if="exportedImages.length > 0" class="export-preview">
          <div 
            v-for="(image, index) in exportedImages" 
            :key="index"
            class="export-item"
          >
            <h4>{{ image.name }}</h4>
            <img :src="image.data" :alt="image.name" />
            <a :href="image.data" :download="image.filename">下载</a>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, nextTick } from 'vue'
import { ElectronicSignature } from '../src'
import type {
  SignatureData,
  SignatureMethods,
  SignatureReplay,
  ReplayOptions,
  ReplayState,
  SignaturePath
} from '../src'

// 组件引用
const basicSignatureRef = ref<SignatureMethods>()
const customSignatureRef = ref<SignatureMethods>()
const responsiveSignatureRef = ref<SignatureMethods>()
const dataSignatureRef = ref<SignatureMethods>()
const recordingSignatureRef = ref<SignatureMethods>()
const playbackSignatureRef = ref<SignatureMethods>()

// 自定义样式配置
const customStyle = reactive({
  strokeColor: '#FF5722',
  strokeWidth: 3,
  backgroundColor: '#FFFEF7',
  smoothing: true,
  pressureSensitive: false
})

// 响应式宽度
const responsiveWidth = ref(400)

// 签名数据信息
const signatureDataInfo = ref<{
  pathCount: number
  pointCount: number
  canvasSize: string
  isEmpty: boolean
  timestamp: string
} | null>(null)

// 导出的图片
const exportedImages = ref<Array<{
  name: string
  data: string
  filename: string
}>>([])

// 回放功能相关状态
const replayMode = ref(false)
const replayData = ref<SignatureReplay | null>(null)
const replayState = ref<ReplayState>('idle')
const replayProgress = ref(0)
const currentTime = ref(0)
const totalDuration = ref(0)
const currentPathIndex = ref(-1)
const selectedSpeed = ref(1)

// 录制相关状态
const recordingStatus = ref('等待录制')
const hasRecordingData = ref(false)
const recordingInfo = ref<{
  pathCount: number
  totalPoints: number
} | null>(null)

// 回放选项配置
const replayOptions = reactive<ReplayOptions>({
  speed: 1,
  loop: false,
  showControls: true,
  autoPlay: false
})

// 事件处理
const onSignatureStart = () => {
  console.log('开始签名')
}

const onSignatureEnd = (data: SignatureData) => {
  console.log('签名结束', data)
}

// 基础操作
const clearBasicSignature = () => {
  basicSignatureRef.value?.clear()
}

const saveBasicSignature = () => {
  if (!basicSignatureRef.value) return
  
  const imageData = basicSignatureRef.value.save({ format: 'png' })
  exportedImages.value.push({
    name: '基础签名 - PNG',
    data: imageData,
    filename: 'basic-signature.png'
  })
}

const exportBasicSignatureSVG = () => {
  if (!basicSignatureRef.value) return
  
  const svgData = basicSignatureRef.value.save({ format: 'svg' })
  const blob = new Blob([svgData], { type: 'image/svg+xml' })
  const url = URL.createObjectURL(blob)
  
  exportedImages.value.push({
    name: '基础签名 - SVG',
    data: url,
    filename: 'basic-signature.svg'
  })
}

// 数据操作
const getSignatureData = () => {
  if (!dataSignatureRef.value) return
  
  const data = dataSignatureRef.value.getSignatureData()
  const pointCount = data.paths.reduce((total, path) => total + path.points.length, 0)
  
  signatureDataInfo.value = {
    pathCount: data.paths.length,
    pointCount,
    canvasSize: `${data.canvasSize.width} × ${data.canvasSize.height}`,
    isEmpty: data.isEmpty,
    timestamp: new Date(data.timestamp).toLocaleString()
  }
}

const loadSampleSignature = () => {
  // 这里可以加载一个示例签名数据
  console.log('加载示例签名')
}

const copySignature = async () => {
  if (!dataSignatureRef.value) return

  try {
    const imageData = dataSignatureRef.value.save({ format: 'png' })
    await navigator.clipboard.writeText(imageData)
    alert('签名已复制到剪贴板')
  } catch (error) {
    console.error('复制失败:', error)
    alert('复制失败，请手动保存')
  }
}

// 录制相关事件处理
const onRecordingStart = () => {
  recordingStatus.value = '正在录制'
  console.log('开始录制签名')
}

const onRecordingEnd = (data: SignatureData) => {
  recordingStatus.value = '录制完成'
  hasRecordingData.value = !data.isEmpty

  if (!data.isEmpty) {
    const totalPoints = data.paths.reduce((sum, path) => sum + path.points.length, 0)
    recordingInfo.value = {
      pathCount: data.paths.length,
      totalPoints
    }
  }

  console.log('录制结束', data)
}

const onRecordingClear = () => {
  recordingStatus.value = '等待录制'
  hasRecordingData.value = false
  recordingInfo.value = null
  replayData.value = null
  console.log('清除录制')
}

const clearRecording = () => {
  recordingSignatureRef.value?.clear()
}

const generateReplayData = () => {
  console.log('开始生成回放数据...')

  if (!recordingSignatureRef.value) {
    console.error('录制组件引用为空')
    return
  }

  const signatureData = recordingSignatureRef.value.getSignatureData()
  console.log('获取到签名数据:', signatureData)

  if (!signatureData.isEmpty) {
    console.log('签名数据不为空，开始生成回放数据')
    replayData.value = recordingSignatureRef.value.getReplayData()
    console.log('生成回放数据完成:', replayData.value)
    console.log('回放数据是否为null:', replayData.value === null)
  } else {
    console.warn('签名数据为空，无法生成回放数据')
  }
}

// 回放控制函数
const startReplay = () => {
  console.log('startReplay被调用')
  console.log('playbackSignatureRef.value:', !!playbackSignatureRef.value)
  console.log('replayData.value:', replayData.value)
  console.log('当前回放模式:', replayMode.value)

  if (!playbackSignatureRef.value) {
    console.error('回放组件引用为空')
    return
  }

  if (!replayData.value) {
    console.error('回放数据为空')
    return
  }

  console.log('开始回放，数据:', replayData.value)
  console.log('回放选项:', replayOptions)

  // 确保回放模式已启用
  if (!replayMode.value) {
    console.log('启用回放模式')
    replayMode.value = true
  }

  // 等待一下确保数据已经传递
  nextTick(() => {
    console.log('nextTick后调用播放')
    playbackSignatureRef.value?.play()
  })
}

const pauseReplay = () => {
  playbackSignatureRef.value?.pause()
}

const stopReplay = () => {
  playbackSignatureRef.value?.stop()
}

const toggleReplayMode = () => {
  replayMode.value = !replayMode.value
  console.log('切换回放模式:', replayMode.value)

  if (!replayMode.value) {
    // 退出回放模式时停止播放
    playbackSignatureRef.value?.stop()
  }
}

const changeReplaySpeed = () => {
  playbackSignatureRef.value?.setSpeed(selectedSpeed.value)
}

// 回放事件处理
const onReplayStart = () => {
  replayState.value = 'playing'
  console.log('回放开始')
}

const onReplayProgress = (progress: number, time: number) => {
  replayProgress.value = progress
  currentTime.value = time
  if (playbackSignatureRef.value) {
    totalDuration.value = playbackSignatureRef.value.getTotalDuration()
  }
}

const onReplayPause = () => {
  replayState.value = 'paused'
  console.log('回放暂停')
}

const onReplayResume = () => {
  replayState.value = 'playing'
  console.log('回放恢复')
}

const onReplayStop = () => {
  replayState.value = 'stopped'
  currentTime.value = 0
  replayProgress.value = 0
  console.log('回放停止')
}

const onReplayComplete = () => {
  replayState.value = 'completed'
  console.log('回放完成')
}

const onReplayPathStart = (pathIndex: number, path: SignaturePath) => {
  currentPathIndex.value = pathIndex
  console.log(`开始绘制第 ${pathIndex + 1} 笔画`, path)
}

const onReplayPathEnd = (pathIndex: number, path: SignaturePath) => {
  console.log(`完成绘制第 ${pathIndex + 1} 笔画`, path)
}

const onReplaySpeedChange = (speed: number) => {
  selectedSpeed.value = speed
  console.log('回放速度改变:', speed)
}

// 工具函数
const formatTime = (milliseconds: number): string => {
  const seconds = Math.floor(milliseconds / 1000)
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60

  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}
</script>

<style scoped>
.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

h1 {
  text-align: center;
  color: #333;
  margin-bottom: 40px;
}

.demo-section {
  margin-bottom: 40px;
  padding: 20px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background: #fafafa;
}

.demo-section h2 {
  margin-top: 0;
  color: #2196F3;
}

.demo-section p {
  color: #666;
  margin-bottom: 20px;
}

.demo-controls {
  margin-top: 15px;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.demo-controls button {
  padding: 8px 16px;
  border: 1px solid #2196F3;
  background: #2196F3;
  color: white;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.2s;
}

.demo-controls button:hover {
  background: #1976D2;
}

.style-controls {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
  margin-bottom: 20px;
  padding: 15px;
  background: white;
  border-radius: 4px;
}

.style-controls label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.responsive-container {
  transition: width 0.3s ease;
  border: 2px dashed #ddd;
  padding: 10px;
  border-radius: 8px;
}

.data-info {
  margin-top: 15px;
  padding: 15px;
  background: white;
  border-radius: 4px;
  border-left: 4px solid #4CAF50;
}

.data-info h4 {
  margin-top: 0;
  color: #4CAF50;
}

.data-info p {
  margin: 5px 0;
  font-size: 14px;
}

.export-preview {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.export-item {
  text-align: center;
  padding: 15px;
  background: white;
  border-radius: 4px;
  border: 1px solid #ddd;
}

.export-item h4 {
  margin-top: 0;
  color: #333;
}

.export-item img {
  max-width: 100%;
  height: auto;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-bottom: 10px;
}

.export-item a {
  display: inline-block;
  padding: 6px 12px;
  background: #2196F3;
  color: white;
  text-decoration: none;
  border-radius: 4px;
  font-size: 12px;
}

.export-item a:hover {
  background: #1976D2;
}

/* 回放功能样式 */
.replay-demo-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
  margin-top: 20px;
}

@media (max-width: 768px) {
  .replay-demo-container {
    grid-template-columns: 1fr;
  }
}

.recording-area,
.playback-area {
  padding: 20px;
  background: white;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
}

.recording-area h4,
.playback-area h4 {
  margin-top: 0;
  margin-bottom: 15px;
  color: #333;
  font-size: 16px;
}

.recording-info {
  margin-top: 15px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 4px;
  border-left: 4px solid #E91E63;
}

.recording-info p {
  margin: 4px 0;
  font-size: 14px;
}

.custom-replay-controls {
  margin-top: 15px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 6px;
}

.control-buttons {
  display: flex;
  gap: 8px;
  margin-bottom: 15px;
  flex-wrap: wrap;
}

.control-buttons button {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.control-buttons button:hover:not(:disabled) {
  background: #f5f5f5;
  border-color: #999;
}

.control-buttons button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-play {
  background: #4CAF50 !important;
  color: white !important;
  border-color: #4CAF50 !important;
}

.btn-pause {
  background: #FF9800 !important;
  color: white !important;
  border-color: #FF9800 !important;
}

.btn-stop {
  background: #F44336 !important;
  color: white !important;
  border-color: #F44336 !important;
}

.btn-mode {
  background: #2196F3 !important;
  color: white !important;
  border-color: #2196F3 !important;
}

.replay-settings {
  display: flex;
  gap: 15px;
  align-items: center;
  flex-wrap: wrap;
}

.replay-settings label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: #666;
}

.replay-settings select {
  padding: 4px 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
}

.replay-info-panel {
  margin-top: 15px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

@media (max-width: 600px) {
  .replay-info-panel {
    grid-template-columns: 1fr;
  }
}

.replay-status,
.signature-metadata {
  padding: 12px;
  background: white;
  border-radius: 4px;
  border: 1px solid #e0e0e0;
}

.replay-status h5,
.signature-metadata h5 {
  margin-top: 0;
  margin-bottom: 10px;
  color: #333;
  font-size: 14px;
}

.replay-status p,
.signature-metadata p {
  margin: 4px 0;
  font-size: 13px;
  color: #666;
}
</style>