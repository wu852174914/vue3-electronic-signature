/**
 * 电子签名组件测试
 * 这是一个基础的测试文件，用于验证组件的核心功能
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import ElectronicSignature from '../src/components/ElectronicSignature.vue'
import type { SignatureData } from '../src/types'

describe('ElectronicSignature', () => {
  let wrapper: any

  beforeEach(() => {
    wrapper = mount(ElectronicSignature, {
      props: {
        width: 400,
        height: 200
      }
    })
  })

  it('应该正确渲染组件', () => {
    expect(wrapper.exists()).toBe(true)
    expect(wrapper.find('canvas').exists()).toBe(true)
  })

  it('应该设置正确的画布尺寸', () => {
    const canvas = wrapper.find('canvas')
    expect(canvas.attributes('width')).toBe('400')
    expect(canvas.attributes('height')).toBe('200')
  })

  it('应该显示占位符文本', () => {
    const placeholder = wrapper.find('.signature-placeholder')
    expect(placeholder.exists()).toBe(true)
    expect(placeholder.text()).toBe('请在此处签名')
  })

  it('应该支持自定义占位符', async () => {
    await wrapper.setProps({ placeholder: '自定义占位符' })
    const placeholder = wrapper.find('.signature-placeholder')
    expect(placeholder.text()).toBe('自定义占位符')
  })

  it('应该在禁用状态下不响应事件', async () => {
    await wrapper.setProps({ disabled: true })
    const canvas = wrapper.find('canvas')
    expect(canvas.attributes('style')).toContain('cursor: not-allowed')
  })

  it('应该显示工具栏', async () => {
    await wrapper.setProps({ showToolbar: true })
    const toolbar = wrapper.find('.signature-toolbar')
    expect(toolbar.exists()).toBe(true)
    
    const buttons = toolbar.findAll('button')
    expect(buttons).toHaveLength(3) // 清除、撤销、重做
  })

  it('应该触发签名开始事件', async () => {
    const canvas = wrapper.find('canvas')
    await canvas.trigger('mousedown', { clientX: 100, clientY: 100 })
    
    expect(wrapper.emitted('signature-start')).toBeTruthy()
  })

  it('应该正确处理样式属性', async () => {
    await wrapper.setProps({
      strokeColor: '#FF0000',
      strokeWidth: 5,
      backgroundColor: '#FFFFFF'
    })

    // 验证属性是否正确传递
    expect(wrapper.vm.strokeColor).toBe('#FF0000')
    expect(wrapper.vm.strokeWidth).toBe(5)
    expect(wrapper.vm.backgroundColor).toBe('#FFFFFF')
  })
})

// 工具函数测试
describe('Signature Utils', () => {
  it('应该正确计算两点间距离', () => {
    const { getDistance } = require('../src/utils/signature')
    
    const point1 = { x: 0, y: 0, time: 0 }
    const point2 = { x: 3, y: 4, time: 100 }
    
    expect(getDistance(point1, point2)).toBe(5)
  })

  it('应该正确判断签名是否为空', () => {
    const { isSignatureEmpty, createEmptySignatureData } = require('../src/utils/signature')
    
    const emptyData = createEmptySignatureData(400, 200)
    expect(isSignatureEmpty(emptyData)).toBe(true)
    
    const nonEmptyData = {
      ...emptyData,
      paths: [{
        points: [{ x: 10, y: 10, time: Date.now() }],
        strokeColor: '#000',
        strokeWidth: 2
      }]
    }
    expect(isSignatureEmpty(nonEmptyData)).toBe(false)
  })

  it('应该正确克隆签名数据', () => {
    const { cloneSignatureData, createEmptySignatureData } = require('../src/utils/signature')
    
    const originalData = createEmptySignatureData(400, 200)
    originalData.paths.push({
      points: [{ x: 10, y: 10, time: Date.now() }],
      strokeColor: '#000',
      strokeWidth: 2
    })
    
    const clonedData = cloneSignatureData(originalData)
    
    expect(clonedData).toEqual(originalData)
    expect(clonedData).not.toBe(originalData) // 确保是深拷贝
  })
})

// 画布工具测试
describe('Canvas Utils', () => {
  let canvas: HTMLCanvasElement

  beforeEach(() => {
    canvas = document.createElement('canvas')
    canvas.width = 400
    canvas.height = 200
  })

  it('应该正确获取设备像素比', () => {
    const { getDevicePixelRatio } = require('../src/utils/canvas')
    
    const ratio = getDevicePixelRatio()
    expect(typeof ratio).toBe('number')
    expect(ratio).toBeGreaterThan(0)
  })

  it('应该正确计算签名边界', () => {
    const { getSignatureBounds } = require('../src/utils/canvas')
    
    const signatureData: SignatureData = {
      paths: [{
        points: [
          { x: 10, y: 20, time: 0 },
          { x: 50, y: 80, time: 100 },
          { x: 30, y: 40, time: 200 }
        ],
        strokeColor: '#000',
        strokeWidth: 2
      }],
      canvasSize: { width: 400, height: 200 },
      timestamp: Date.now(),
      isEmpty: false
    }
    
    const bounds = getSignatureBounds(signatureData)
    
    expect(bounds.minX).toBe(10)
    expect(bounds.minY).toBe(20)
    expect(bounds.maxX).toBe(50)
    expect(bounds.maxY).toBe(80)
    expect(bounds.width).toBe(40)
    expect(bounds.height).toBe(60)
  })
})

// 导出功能测试
describe('Export Functions', () => {
  it('应该正确生成SVG格式', () => {
    const { signatureToSVG } = require('../src/utils/signature')
    
    const signatureData: SignatureData = {
      paths: [{
        points: [
          { x: 10, y: 10, time: 0 },
          { x: 20, y: 20, time: 100 }
        ],
        strokeColor: '#000000',
        strokeWidth: 2
      }],
      canvasSize: { width: 400, height: 200 },
      timestamp: Date.now(),
      isEmpty: false
    }
    
    const svg = signatureToSVG(signatureData)
    
    expect(svg).toContain('<svg')
    expect(svg).toContain('width="400"')
    expect(svg).toContain('height="200"')
    expect(svg).toContain('<path')
    expect(svg).toContain('stroke="#000000"')
    expect(svg).toContain('stroke-width="2"')
  })
})

// 性能测试
describe('Performance Tests', () => {
  it('应该能处理大量签名点', () => {
    const { drawSmoothPath } = require('../src/utils/signature')
    
    // 创建大量点数据
    const points = Array.from({ length: 1000 }, (_, i) => ({
      x: Math.random() * 400,
      y: Math.random() * 200,
      time: i
    }))
    
    const canvas = document.createElement('canvas')
    canvas.width = 400
    canvas.height = 200
    const ctx = canvas.getContext('2d')!
    
    const drawOptions = {
      strokeColor: '#000',
      strokeWidth: 2,
      smoothing: true,
      pressure: { enabled: false, min: 1, max: 4 }
    }
    
    const startTime = performance.now()
    drawSmoothPath(ctx, points, drawOptions)
    const endTime = performance.now()
    
    // 绘制1000个点应该在合理时间内完成（小于100ms）
    expect(endTime - startTime).toBeLessThan(100)
  })
})
