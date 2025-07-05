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