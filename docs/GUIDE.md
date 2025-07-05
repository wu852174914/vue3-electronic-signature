# 使用指南

## 快速开始

### 1. 安装组件库

```bash
npm install vue3-electronic-signature
```

### 2. 在项目中引入

#### 全局注册（推荐）

```typescript
// main.ts
import { createApp } from 'vue'
import Vue3ElectronicSignature from 'vue3-electronic-signature'
import App from './App.vue'

const app = createApp(App)
app.use(Vue3ElectronicSignature)
app.mount('#app')
```

#### 按需引入

```vue
<script setup lang="ts">
import { ElectronicSignature } from 'vue3-electronic-signature'
</script>
```

### 3. 基础使用

```vue
<template>
  <ElectronicSignature
    :width="400"
    :height="200"
    placeholder="请在此处签名"
  />
</template>
```

## 常见使用场景

### 场景1：表单签名

在表单中集成电子签名功能：

```vue
<template>
  <form @submit="handleSubmit">
    <div class="form-group">
      <label>姓名：</label>
      <input v-model="form.name" type="text" required />
    </div>
    
    <div class="form-group">
      <label>电子签名：</label>
      <ElectronicSignature
        ref="signatureRef"
        :width="400"
        :height="150"
        stroke-color="#2196F3"
        placeholder="请在此处签名确认"
        @signature-end="onSignatureChange"
      />
      <p v-if="signatureRequired" class="error">请完成签名</p>
    </div>
    
    <button type="submit" :disabled="!isFormValid">提交</button>
  </form>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { SignatureMethods, SignatureData } from 'vue3-electronic-signature'

const signatureRef = ref<SignatureMethods>()
const form = ref({
  name: '',
  signature: ''
})
const signatureRequired = ref(false)

const isFormValid = computed(() => {
  return form.value.name && form.value.signature
})

const onSignatureChange = (data: SignatureData) => {
  if (!data.isEmpty) {
    form.value.signature = signatureRef.value?.save({ format: 'base64' }) || ''
    signatureRequired.value = false
  }
}

const handleSubmit = (event: Event) => {
  event.preventDefault()
  
  if (signatureRef.value?.isEmpty()) {
    signatureRequired.value = true
    return
  }
  
  // 提交表单数据
  console.log('提交表单:', form.value)
}
</script>
```

### 场景2：合同签署

在线合同签署功能：

```vue
<template>
  <div class="contract-container">
    <div class="contract-content">
      <h2>服务协议</h2>
      <div class="contract-text">
        <!-- 合同内容 -->
        <p>本协议由以下双方签署...</p>
      </div>
    </div>
    
    <div class="signature-section">
      <h3>电子签名</h3>
      <div class="signature-row">
        <div class="signature-item">
          <label>甲方签名：</label>
          <ElectronicSignature
            ref="partyARef"
            :width="300"
            :height="120"
            stroke-color="#FF5722"
            placeholder="甲方签名"
            @signature-end="onPartyASign"
          />
          <div class="signature-info">
            <span>签名时间：{{ partyASignTime }}</span>
          </div>
        </div>
        
        <div class="signature-item">
          <label>乙方签名：</label>
          <ElectronicSignature
            ref="partyBRef"
            :width="300"
            :height="120"
            stroke-color="#2196F3"
            placeholder="乙方签名"
            @signature-end="onPartyBSign"
          />
          <div class="signature-info">
            <span>签名时间：{{ partyBSignTime }}</span>
          </div>
        </div>
      </div>
      
      <div class="contract-actions">
        <button @click="clearAllSignatures">清除所有签名</button>
        <button @click="generateContract" :disabled="!allSigned">
          生成合同
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { SignatureMethods, SignatureData } from 'vue3-electronic-signature'

const partyARef = ref<SignatureMethods>()
const partyBRef = ref<SignatureMethods>()
const partyASignTime = ref('')
const partyBSignTime = ref('')

const allSigned = computed(() => {
  return partyASignTime.value && partyBSignTime.value
})

const onPartyASign = (data: SignatureData) => {
  if (!data.isEmpty) {
    partyASignTime.value = new Date().toLocaleString()
  }
}

const onPartyBSign = (data: SignatureData) => {
  if (!data.isEmpty) {
    partyBSignTime.value = new Date().toLocaleString()
  }
}

const clearAllSignatures = () => {
  partyARef.value?.clear()
  partyBRef.value?.clear()
  partyASignTime.value = ''
  partyBSignTime.value = ''
}

const generateContract = () => {
  const partyASignature = partyARef.value?.save({ format: 'png' })
  const partyBSignature = partyBRef.value?.save({ format: 'png' })
  
  // 生成包含签名的合同PDF
  console.log('生成合同', {
    partyASignature,
    partyBSignature,
    partyASignTime: partyASignTime.value,
    partyBSignTime: partyBSignTime.value
  })
}
</script>
```

### 场景3：移动端签名

针对移动设备优化的签名体验：

```vue
<template>
  <div class="mobile-signature">
    <div class="signature-header">
      <h3>请在下方签名</h3>
      <p>请使用手指在屏幕上书写您的签名</p>
    </div>
    
    <ElectronicSignature
      ref="mobileSignatureRef"
      width="100%"
      :height="250"
      :stroke-width="4"
      :pressure-sensitive="true"
      :min-stroke-width="2"
      :max-stroke-width="8"
      stroke-color="#2196F3"
      background-color="#FAFAFA"
      border-style="2px solid #E0E0E0"
      border-radius="12px"
      placeholder="请用手指在此处签名"
      @signature-start="onMobileSignStart"
      @signature-end="onMobileSignEnd"
    />
    
    <div class="mobile-controls">
      <button class="btn-clear" @click="clearMobileSignature">
        <span class="icon">🗑️</span>
        清除
      </button>
      <button class="btn-save" @click="saveMobileSignature" :disabled="isEmpty">
        <span class="icon">💾</span>
        保存
      </button>
    </div>
    
    <div v-if="savedSignature" class="signature-preview">
      <h4>签名预览：</h4>
      <img :src="savedSignature" alt="签名预览" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { SignatureMethods, SignatureData } from 'vue3-electronic-signature'

const mobileSignatureRef = ref<SignatureMethods>()
const isEmpty = ref(true)
const savedSignature = ref('')

const onMobileSignStart = () => {
  // 防止页面滚动
  document.body.style.overflow = 'hidden'
}

const onMobileSignEnd = (data: SignatureData) => {
  isEmpty.value = data.isEmpty
  // 恢复页面滚动
  document.body.style.overflow = 'auto'
}

const clearMobileSignature = () => {
  mobileSignatureRef.value?.clear()
  isEmpty.value = true
  savedSignature.value = ''
}

const saveMobileSignature = () => {
  if (mobileSignatureRef.value && !isEmpty.value) {
    savedSignature.value = mobileSignatureRef.value.save({
      format: 'png',
      backgroundColor: '#ffffff'
    })
  }
}
</script>

<style scoped>
.mobile-signature {
  padding: 20px;
  max-width: 100%;
}

.signature-header {
  text-align: center;
  margin-bottom: 20px;
}

.mobile-controls {
  display: flex;
  gap: 15px;
  margin-top: 20px;
  justify-content: center;
}

.mobile-controls button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-clear {
  background: #F44336;
  color: white;
}

.btn-save {
  background: #4CAF50;
  color: white;
}

.btn-save:disabled {
  background: #CCCCCC;
  cursor: not-allowed;
}

.signature-preview {
  margin-top: 20px;
  text-align: center;
}

.signature-preview img {
  max-width: 100%;
  border: 1px solid #ddd;
  border-radius: 4px;
}

@media (max-width: 768px) {
  .mobile-signature {
    padding: 15px;
  }
  
  .mobile-controls button {
    flex: 1;
    justify-content: center;
  }
}
</style>
```

## 最佳实践

### 1. 性能优化

```vue
<script setup lang="ts">
// 使用 shallowRef 优化大型签名数据
import { shallowRef } from 'vue'

const signatureData = shallowRef<SignatureData | null>(null)

// 防抖保存
import { debounce } from 'lodash-es'

const debouncedSave = debounce((data: SignatureData) => {
  // 保存签名数据
  localStorage.setItem('signature', JSON.stringify(data))
}, 1000)

const onSignatureChange = (data: SignatureData) => {
  signatureData.value = data
  debouncedSave(data)
}
</script>
```

### 2. 错误处理

```vue
<script setup lang="ts">
const handleSignatureError = (error: Error) => {
  console.error('签名操作失败:', error)
  // 显示用户友好的错误信息
  ElMessage.error('签名操作失败，请重试')
}

const saveSignatureWithErrorHandling = async () => {
  try {
    const signature = signatureRef.value?.save({ format: 'png' })
    if (!signature) {
      throw new Error('签名数据为空')
    }
    // 处理保存逻辑
  } catch (error) {
    handleSignatureError(error as Error)
  }
}
</script>
```

### 3. 数据持久化

```vue
<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'

// 自动保存到本地存储
const autoSave = (data: SignatureData) => {
  if (!data.isEmpty) {
    localStorage.setItem('draft-signature', JSON.stringify(data))
  }
}

// 从本地存储恢复
const restoreFromStorage = () => {
  const saved = localStorage.getItem('draft-signature')
  if (saved && signatureRef.value) {
    try {
      const data = JSON.parse(saved)
      signatureRef.value.setSignatureData(data)
    } catch (error) {
      console.error('恢复签名失败:', error)
    }
  }
}

onMounted(() => {
  restoreFromStorage()
})

onUnmounted(() => {
  // 清理临时数据
  localStorage.removeItem('draft-signature')
})
</script>
```

## 🎬 签名回放功能

### 什么是签名回放？

签名回放功能允许您录制签名过程并以动画形式重新播放，这对于以下场景非常有用：

- **签名验证**: 审查签名的真实性和完整性
- **教学演示**: 展示正确的签名方式
- **用户体验**: 为用户提供签名过程的可视化反馈
- **法律证据**: 保存签名过程作为法律证据

### 基础回放使用

#### 1. 录制签名并生成回放数据

```vue
<template>
  <div class="signature-demo">
    <!-- 录制区域 -->
    <div class="recording-section">
      <h3>📝 请在此处签名</h3>
      <ElectronicSignature
        ref="recordingRef"
        :width="400"
        :height="200"
        stroke-color="#2196F3"
        :stroke-width="3"
        placeholder="请在此处签名"
        show-toolbar
        @signature-end="onSignatureEnd"
        @signature-clear="onSignatureClear"
      />
      <button @click="generateReplay" :disabled="!hasSignature">
        生成回放数据
      </button>
    </div>

    <!-- 回放区域 -->
    <div class="playback-section" v-if="replayData">
      <h3>🎬 签名回放</h3>
      <ElectronicSignature
        ref="playbackRef"
        :width="400"
        :height="200"
        :replay-mode="true"
        :replay-data="replayData"
        :replay-options="replayOptions"
        @replay-complete="onReplayComplete"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import type {
  SignatureMethods,
  SignatureData,
  SignatureReplay
} from 'vue3-electronic-signature'

const recordingRef = ref<SignatureMethods>()
const playbackRef = ref<SignatureMethods>()
const hasSignature = ref(false)
const replayData = ref<SignatureReplay | null>(null)

const replayOptions = reactive({
  speed: 1,
  loop: false,
  showControls: true,
  autoPlay: true
})

const onSignatureEnd = (data: SignatureData) => {
  hasSignature.value = !data.isEmpty
}

const onSignatureClear = () => {
  hasSignature.value = false
  replayData.value = null
}

const generateReplay = () => {
  if (recordingRef.value) {
    replayData.value = recordingRef.value.getReplayData()
  }
}

const onReplayComplete = () => {
  console.log('回放完成')
}
</script>
```

#### 2. 手动控制回放

```vue
<template>
  <div class="manual-control-demo">
    <ElectronicSignature
      ref="signatureRef"
      :width="500"
      :height="250"
      :replay-mode="replayMode"
      :replay-data="replayData"
      :replay-options="{ showControls: false, autoPlay: false }"
      @replay-progress="onProgress"
      @replay-path-start="onPathStart"
    />

    <!-- 自定义控制面板 -->
    <div class="control-panel">
      <div class="playback-controls">
        <button @click="play" :disabled="!canPlay">▶️ 播放</button>
        <button @click="pause" :disabled="!canPause">⏸️ 暂停</button>
        <button @click="stop" :disabled="!canStop">⏹️ 停止</button>
      </div>

      <div class="speed-control">
        <label>播放速度：</label>
        <select v-model="selectedSpeed" @change="changeSpeed">
          <option value="0.5">0.5x</option>
          <option value="1">1x</option>
          <option value="1.5">1.5x</option>
          <option value="2">2x</option>
        </select>
      </div>

      <div class="progress-info">
        <p>进度: {{ Math.round(progress * 100) }}%</p>
        <p>当前笔画: {{ currentPath + 1 }} / {{ totalPaths }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { SignatureMethods, SignaturePath } from 'vue3-electronic-signature'

const signatureRef = ref<SignatureMethods>()
const replayMode = ref(true)
const progress = ref(0)
const currentPath = ref(0)
const selectedSpeed = ref(1)
const replayState = ref<'idle' | 'playing' | 'paused' | 'stopped'>('idle')

// 计算属性
const canPlay = computed(() => replayState.value !== 'playing')
const canPause = computed(() => replayState.value === 'playing')
const canStop = computed(() => replayState.value !== 'idle')
const totalPaths = computed(() => replayData.value?.paths.length || 0)

// 控制方法
const play = () => {
  signatureRef.value?.play()
  replayState.value = 'playing'
}

const pause = () => {
  signatureRef.value?.pause()
  replayState.value = 'paused'
}

const stop = () => {
  signatureRef.value?.stop()
  replayState.value = 'stopped'
  progress.value = 0
  currentPath.value = 0
}

const changeSpeed = () => {
  signatureRef.value?.setSpeed(selectedSpeed.value)
}

// 事件处理
const onProgress = (progressValue: number) => {
  progress.value = progressValue
}

const onPathStart = (pathIndex: number, path: SignaturePath) => {
  currentPath.value = pathIndex
}
</script>
```

### 高级回放功能

#### 1. 回放数据分析

```vue
<script setup lang="ts">
import type { SignatureReplay } from 'vue3-electronic-signature'

const analyzeSignature = (replayData: SignatureReplay) => {
  const { metadata, paths, totalDuration } = replayData

  console.log('📊 签名分析报告:')
  console.log(`设备类型: ${metadata.deviceType}`)
  console.log(`平均速度: ${Math.round(metadata.averageSpeed)} 像素/秒`)
  console.log(`总距离: ${Math.round(metadata.totalDistance)} 像素`)
  console.log(`笔画数量: ${paths.length}`)
  console.log(`总时长: ${totalDuration} 毫秒`)
  console.log(`平均停顿: ${metadata.averagePauseTime} 毫秒`)

  // 分析每个笔画
  paths.forEach((path, index) => {
    const pathDuration = path.duration || 0
    const pathDistance = calculatePathDistance(path.points)
    const pathSpeed = pathDuration > 0 ? pathDistance / (pathDuration / 1000) : 0

    console.log(`笔画 ${index + 1}:`)
    console.log(`  - 点数: ${path.points.length}`)
    console.log(`  - 时长: ${pathDuration}ms`)
    console.log(`  - 距离: ${Math.round(pathDistance)}px`)
    console.log(`  - 速度: ${Math.round(pathSpeed)}px/s`)
  })
}

const calculatePathDistance = (points: SignaturePoint[]): number => {
  let distance = 0
  for (let i = 1; i < points.length; i++) {
    const dx = points[i].x - points[i - 1].x
    const dy = points[i].y - points[i - 1].y
    distance += Math.sqrt(dx * dx + dy * dy)
  }
  return distance
}
</script>
```

#### 2. 回放数据的保存和加载

```vue
<script setup lang="ts">
import type { SignatureReplay } from 'vue3-electronic-signature'

// 保存回放数据到本地存储
const saveReplayData = (replayData: SignatureReplay, name: string) => {
  const savedReplays = JSON.parse(localStorage.getItem('signature-replays') || '{}')
  savedReplays[name] = {
    data: replayData,
    savedAt: new Date().toISOString(),
    metadata: {
      pathCount: replayData.paths.length,
      duration: replayData.totalDuration,
      deviceType: replayData.metadata.deviceType
    }
  }
  localStorage.setItem('signature-replays', JSON.stringify(savedReplays))
}

// 从本地存储加载回放数据
const loadReplayData = (name: string): SignatureReplay | null => {
  const savedReplays = JSON.parse(localStorage.getItem('signature-replays') || '{}')
  return savedReplays[name]?.data || null
}

// 获取所有保存的回放数据列表
const getSavedReplays = () => {
  const savedReplays = JSON.parse(localStorage.getItem('signature-replays') || '{}')
  return Object.keys(savedReplays).map(name => ({
    name,
    ...savedReplays[name].metadata,
    savedAt: savedReplays[name].savedAt
  }))
}

// 导出回放数据为JSON文件
const exportReplayData = (replayData: SignatureReplay, filename: string) => {
  const dataStr = JSON.stringify(replayData, null, 2)
  const blob = new Blob([dataStr], { type: 'application/json' })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = `${filename}.json`
  link.click()

  URL.revokeObjectURL(url)
}

// 从JSON文件导入回放数据
const importReplayData = (file: File): Promise<SignatureReplay> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const replayData = JSON.parse(e.target?.result as string)
        resolve(replayData)
      } catch (error) {
        reject(new Error('无效的回放数据文件'))
      }
    }
    reader.onerror = () => reject(new Error('文件读取失败'))
    reader.readAsText(file)
  })
}
</script>
```

#### 3. 回放事件的详细处理

```vue
<script setup lang="ts">
import type { SignaturePath } from 'vue3-electronic-signature'

// 详细的回放事件处理
const onReplayStart = () => {
  console.log('🎬 回放开始')
  // 可以在这里显示加载动画或提示
}

const onReplayProgress = (progress: number, currentTime: number) => {
  // 更新进度条
  progressValue.value = progress
  currentTimeValue.value = currentTime

  // 可以在这里触发其他UI更新
  if (progress === 0.5) {
    console.log('回放已完成50%')
  }
}

const onReplayPathStart = (pathIndex: number, path: SignaturePath) => {
  console.log(`开始绘制第 ${pathIndex + 1} 笔画`)

  // 可以在这里高亮显示当前笔画信息
  currentPathInfo.value = {
    index: pathIndex,
    pointCount: path.points.length,
    color: path.strokeColor,
    width: path.strokeWidth
  }
}

const onReplayPathEnd = (pathIndex: number, path: SignaturePath) => {
  console.log(`完成绘制第 ${pathIndex + 1} 笔画`)

  // 可以在这里显示笔画完成的反馈
  showPathCompleteAnimation(pathIndex)
}

const onReplayComplete = () => {
  console.log('✅ 回放完成')

  // 回放完成后的处理
  if (replayOptions.loop) {
    console.log('准备循环播放')
  } else {
    // 显示回放完成的提示
    showCompletionMessage()
  }
}

const onReplaySpeedChange = (speed: number) => {
  console.log(`回放速度改变为: ${speed}x`)
  speedIndicator.value = speed
}

// 辅助函数
const showPathCompleteAnimation = (pathIndex: number) => {
  // 实现笔画完成的动画效果
}

const showCompletionMessage = () => {
  // 显示回放完成的消息
}
</script>
```

### 最佳实践

#### 1. 性能优化

```typescript
// 对于长时间的签名，可以设置合适的回放选项
const optimizedReplayOptions = {
  speed: 2, // 加快回放速度
  showControls: true, // 允许用户控制
  startTime: 1000, // 跳过开始的空白时间
  endTime: totalDuration - 500 // 跳过结束的空白时间
}
```

#### 2. 错误处理

```typescript
const handleReplayError = (error: Error) => {
  console.error('回放出错:', error)

  // 重置回放状态
  replayMode.value = false

  // 显示错误提示
  showErrorMessage('回放失败，请检查数据格式')
}
```

#### 3. 用户体验优化

```vue
<template>
  <div class="replay-container">
    <!-- 加载状态 -->
    <div v-if="isLoading" class="loading">
      正在准备回放...
    </div>

    <!-- 回放组件 -->
    <ElectronicSignature
      v-else
      :replay-mode="true"
      :replay-data="replayData"
      @replay-start="isLoading = false"
    />

    <!-- 进度提示 -->
    <div class="progress-tip" v-if="showProgressTip">
      当前正在绘制第 {{ currentPath + 1 }} 笔画
    </div>
  </div>
</template>
```

通过这些功能，您可以创建丰富的签名回放体验，满足各种业务需求。