import { createReadStream, unlinkSync, writeFileSync } from 'fs'
import { tmpdir } from 'os'
import { join } from 'path'
import { OpenAI } from 'openai'

// OpenAI クライアントを初期化
const openai = new OpenAI({
  apiKey: useRuntimeConfig().openaiApiKey
})

export default defineEventHandler(async (event) => {
  if (event.node.req.method !== 'POST') {
    throw createError({
      statusCode: 405,
      statusMessage: 'Method not allowed'
    })
  }

  try {
    // マルチパートフォームデータを処理
    const form = await readMultipartFormData(event)

    if (!form || form.length === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'No file uploaded'
      })
    }

    const audioFile = form.find((item) => {
      return item.name === 'audio'
    })

    if (!audioFile || !audioFile.data) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Audio file is required'
      })
    }

    // 一時ファイルを作成
    const tempFileName = `audio_${Date.now()}.${audioFile.filename?.split('.').pop() || 'webm'}`
    const tempFilePath = join(tmpdir(), tempFileName)

    // ファイルを一時ディレクトリに保存
    writeFileSync(tempFilePath, audioFile.data)

    try {
      // OpenAI Whisper APIで音声を文字起こし
      const transcription = await openai.audio.transcriptions.create({
        file: createReadStream(tempFilePath),
        model: 'whisper-1',
        language: 'ja', // 日本語指定
        response_format: 'json'
      })

      // 一時ファイルを削除
      unlinkSync(tempFilePath)

      return {
        success: true,
        text: transcription.text,
        timestamp: new Date().toISOString()
      }
    } catch (transcriptionError) {
      // エラー時も一時ファイルを削除
      try {
        unlinkSync(tempFilePath)
      } catch (unlinkError) {
        console.error('Failed to delete temp file:', unlinkError)
      }

      console.error('Transcription error:', transcriptionError)
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to transcribe audio'
      })
    }
  } catch (error) {
    console.error('API error:', error)

    if (isObject(error) && 'statusCode' in error) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
})
