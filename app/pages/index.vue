<script setup lang="ts">
import { onMounted, ref } from 'vue'
import CircleStopSvg from '@/assets/svg/circle-stop.svg'
import CircleSvg from '@/assets/svg/circle.svg'
import ClipboardSvg from '@/assets/svg/clipboard.svg'
import FileImportSvg from '@/assets/svg/file-import.svg'
import MainIconSvg from '@/assets/svg/main-icon.svg'
import MicrophoneSvg from '@/assets/svg/microphone.svg'
import TrashSvg from '@/assets/svg/trash.svg'

// 型定義
interface Transcript {
  text: string
  timestamp: string
}

// リアクティブデータ
const isSupported = ref(true)
const isRecording = ref(false)
const isProcessing = ref(false)
const isDragOver = ref(false)
const transcripts = ref<Transcript[]>([])

// MediaRecorder関連
let mediaRecorder: MediaRecorder | null = null
let audioChunks: Blob[] = []

// ファイル参照
const fileInput = ref<HTMLInputElement>()

// ページ初期化時にブラウザサポートチェック
onMounted(() => {
  isSupported.value = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)
})

// 録音開始
const startRecording = async (): Promise<void> => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        sampleRate: 16000
      }
    })

    audioChunks = []
    mediaRecorder = new MediaRecorder(stream, {
      mimeType: 'audio/webm;codecs=opus'
    })

    mediaRecorder.ondataavailable = (event): void => {
      if (event.data.size > 0) {
        audioChunks.push(event.data)
      }
    }

    mediaRecorder.onstop = async (): Promise<void> => {
      const audioBlob = new Blob(audioChunks, { type: 'audio/webm' })
      await transcribeAudio(audioBlob)

      // ストリームを停止
      stream.getTracks().forEach((track) => {
        return track.stop()
      })
    }

    mediaRecorder.start()
    isRecording.value = true
  } catch (error) {
    console.error('録音開始エラー:', error)
    alert('録音を開始できませんでした。マイクのアクセス許可を確認してください。')
  }
}

// 録音停止
const stopRecording = (): void => {
  if (mediaRecorder && isRecording.value) {
    mediaRecorder.stop()
    isRecording.value = false
    isProcessing.value = true
  }
}

// 音声文字起こし
const transcribeAudio = async (audioBlob: Blob): Promise<void> => {
  try {
    const formData = new FormData()
    formData.append('audio', audioBlob, 'recording.webm')

    const response = await $fetch<{ success: boolean; text: string; timestamp: string }>('/api/transcribe', {
      method: 'POST',
      body: formData
    })

    if (response.success && response.text.trim()) {
      transcripts.value.unshift({
        text: response.text,
        timestamp: response.timestamp
      })
    }
  } catch (error) {
    console.error('文字起こしエラー:', error)
    alert('文字起こし処理でエラーが発生しました。')
  } finally {
    isProcessing.value = false
  }
}

// ファイル選択処理
const handleFileSelect = (event: Event): void => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    processAudioFile(file)
  }
}

// ドラッグ&ドロップ処理
const handleDrop = (event: DragEvent): void => {
  event.preventDefault()
  isDragOver.value = false

  const files = event.dataTransfer?.files
  if (files && files.length > 0) {
    const file = files[0]
    if (file !== undefined && file.type.startsWith('audio/')) {
      processAudioFile(file)
    } else {
      alert('音声ファイルを選択してください。')
    }
  }
}

const handleDragOver = (event: DragEvent): void => {
  event.preventDefault()
  isDragOver.value = true
}

const handleDragLeave = (): void => {
  isDragOver.value = false
}

// 音声ファイル処理
const processAudioFile = async (file: File): Promise<void> => {
  if (file.size > 25 * 1024 * 1024) {
    alert('ファイルサイズが大きすぎます。25MB以下のファイルを選択してください。')
    return
  }

  isProcessing.value = true
  await transcribeAudio(file)
}

// 文字起こし結果をクリア
const clearTranscripts = (): void => {
  transcripts.value = []
}

// クリップボードにコピー
const copyToClipboard = async (): Promise<void> => {
  const text = transcripts.value
    .map((t) => {
      return `[${new Date(t.timestamp).toLocaleString('ja-JP')}]\n${t.text}`
    })
    .join('\n\n')

  try {
    await navigator.clipboard.writeText(text)
    alert('クリップボードにコピーしました！')
  } catch (error) {
    console.error('コピーエラー:', error)
    alert('コピーに失敗しました。')
  }
}

useHead({
  title: 'Audio Scribe - リアルタイム音声文字起こし'
})

useSeoMeta({
  description: 'MTGなどの音声をリアルタイムで文字起こしするサービス',
  keywords: '音声文字起こし,リアルタイム,Whisper,OpenAI,MTG,会議'
})
</script>

<template>
  <div class="container">
    <header class="card">
      <h1 style="font-size: 2rem; font-weight: 700; margin-bottom: 0.5rem; color: #1e293b">
        <MainIconSvg style="width: 40px; height: 40px" />
        Audio Scribe
      </h1>
      <p style="color: #64748b; font-size: 1.1rem">リアルタイム音声文字起こしサービス</p>
    </header>

    <!-- 録音コントロール -->
    <div class="card">
      <h2 style="margin-bottom: 1rem; color: #334155">リアルタイム録音</h2>

      <div class="audio-controls">
        <button
          v-if="!isRecording"
          :disabled="!isSupported || isProcessing"
          class="button button-primary"
          @click="startRecording"
        >
          <MicrophoneSvg class="icon" />
          録音開始
        </button>

        <button v-if="isRecording" class="button button-danger" @click="stopRecording">
          <CircleStopSvg class="icon" style="color: #fff" />
          録音停止
        </button>

        <div
          class="status-indicator"
          :class="{
            'status-idle': !isRecording && !isProcessing,
            'status-recording': isRecording,
            'status-processing': isProcessing
          }"
        >
          <span v-if="!isRecording && !isProcessing">待機中</span>
          <span v-if="isRecording" class="status-text">
            <CircleSvg class="icon" style="color: #dc2626" />
            録音中
          </span>
          <span v-if="isProcessing" class="status-text">
            <div class="loading-dots"></div>
            処理中...
          </span>
        </div>
      </div>

      <div v-if="!isSupported" style="color: #dc2626; margin-top: 1rem">
        ⚠️ お使いのブラウザは音声録音をサポートしていません
      </div>
    </div>

    <!-- ファイルアップロード -->
    <div class="card">
      <h2 style="margin-bottom: 1rem; color: #334155">ファイルアップロード</h2>

      <div
        class="file-upload"
        :class="{ 'drag-over': isDragOver }"
        @drop="handleDrop"
        @dragover="handleDragOver"
        @dragleave="handleDragLeave"
        @click="fileInput?.click()"
      >
        <div style="font-size: 3rem; margin-bottom: 1rem">
          <FileImportSvg style="width: 48px; height: 48px; color: #3b82f6" />
        </div>
        <p style="margin-bottom: 0.5rem; font-weight: 600">音声ファイルをドラッグ＆ドロップまたはクリックして選択</p>
        <p style="color: #64748b; font-size: 0.9rem">対応形式: MP3, WAV, M4A, WEBM (最大25MB)</p>
      </div>

      <input ref="fileInput" type="file" accept="audio/*" class="hidden" @change="handleFileSelect" />
    </div>

    <!-- 文字起こし結果 -->
    <div class="card">
      <h2 style="margin-bottom: 1rem; color: #334155">文字起こし結果</h2>

      <div class="transcript-container">
        <div v-if="transcripts.length === 0" style="color: #94a3b8; text-align: center; padding: 2rem">
          文字起こし結果がここに表示されます
        </div>

        <div v-for="(transcript, index) in transcripts" :key="index" style="margin-bottom: 1rem">
          <div style="color: #64748b; font-size: 0.8rem; margin-bottom: 0.25rem">
            {{ new Date(transcript.timestamp).toLocaleString('ja-JP') }}
          </div>
          <div style="color: #1e293b; font-size: 1rem; line-height: 1.5">
            {{ transcript.text }}
          </div>
          <hr
            v-if="index < transcripts.length - 1"
            style="margin: 1rem 0; border: none; border-top: 1px solid #e2e8f0"
          />
        </div>
      </div>

      <div v-if="transcripts.length > 0" style="margin-top: 1rem">
        <button class="button" style="background-color: #64748b; color: white" @click="clearTranscripts">
          <TrashSvg class="icon" />
          クリア
        </button>
        <button
          class="button"
          style="background-color: #059669; color: white; margin-left: 0.5rem"
          @click="copyToClipboard"
        >
          <ClipboardSvg class="icon" />
          コピー
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@mixin button-base {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border: none;
  border-radius: var(--small-radius);
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}

@mixin status-indicator {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;

  @media (max-width: 768px) {
    padding: 12px;
  }
}

.card {
  background: var(--color-white);
  border-radius: var(--border-radius);
  box-shadow: var(--card-shadow);
  padding: 24px;
  margin-bottom: 24px;
}

.button {
  @include button-base;

  &-primary {
    background-color: var(--primary-color);
    color: var(--color-white);

    &:hover {
      background-color: var(--primary-hover);
    }
  }

  &-danger {
    background-color: var(--danger-color);
    color: var(--color-white);

    &:hover {
      background-color: var(--danger-hover);
    }
  }
}

.transcript-container {
  min-height: 300px;
  background-color: var(--secondary-bg);
  border-radius: var(--small-radius);
  padding: 16px;
  font-family: 'Monaco', 'Consolas', monospace;
  line-height: 1.6;
  max-height: 400px;
  overflow-y: auto;
}

.audio-controls {
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
}

.status-indicator {
  @include status-indicator;
}

.status {
  &-idle {
    background-color: var(--secondary-bg);
    color: var(--secondary-text);
  }

  &-recording {
    background-color: var(--status-recording-bg);
    color: var(--status-recording-text);
  }

  &-processing {
    background-color: var(--status-processing-bg);
    color: var(--status-processing-text);
  }

  &-text {
    display: inline-flex;
    align-items: center;
    gap: 8px;
  }
}

.loading-dots {
  display: inline-flex;
  gap: 8px;
  align-items: center;
  width: 16px;
  height: 16px;
  border: 2px solid var(--border-light);
  border-top: 2px solid var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.file-upload {
  border: 2px dashed var(--border-dashed);
  border-radius: var(--small-radius);
  padding: 40px 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: var(--primary-color);
    background-color: var(--bg-color);
  }

  &.drag-over {
    border-color: var(--primary-color);
    background-color: var(--primary-light);
  }
}

.icon {
  width: 24px;
  height: 24px;
  fill: currentColor;
}

.hidden {
  display: none;
}

@media (max-width: 768px) {
  .button {
    justify-content: center;
  }
}
</style>
