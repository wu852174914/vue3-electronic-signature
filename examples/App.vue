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
import { ref, reactive } from 'vue'
import { ElectronicSignature } from '../src'
import type { SignatureData, SignatureMethods } from '../src'

// 组件引用
const basicSignatureRef = ref<SignatureMethods>()
const customSignatureRef = ref<SignatureMethods>()
const responsiveSignatureRef = ref<SignatureMethods>()
const dataSignatureRef = ref<SignatureMethods>()

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
</style>