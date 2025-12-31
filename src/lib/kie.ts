const KIE_API_URL = process.env.KIE_API_URL || 'https://api.kie.ai/api/v1'
const KIE_API_KEY = process.env.KIE_API_KEY

export interface KieVideoGenerationRequest {
    prompt: string
    imageUrls: string[]
    aspectRatio?: 'landscape' | 'portrait' | 'square'
    nFrames?: '10' | '15'
    removeWatermark?: boolean
    callbackUrl?: string
}

export interface KieVideoGenerationResponse {
    code: number
    message: string
    data: {
        taskId: string
    }
}

export interface KieVideoStatusResponse {
    code: number
    message: string
    data: {
        taskId: string
        model: string
        state: 'waiting' | 'queuing' | 'generating' | 'success' | 'fail'
        param: string
        resultJson: string | null
        failCode: string
        failMsg: string
        costTime: number
        completeTime: number
        createTime: number
    }
}

export async function generateVideoWithKie(params: KieVideoGenerationRequest): Promise<KieVideoGenerationResponse> {
    if (!KIE_API_KEY) {
        throw new Error('KIE_API_KEY is not configured')
    }

    const response = await fetch(`${KIE_API_URL}/jobs/createTask`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${KIE_API_KEY}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            model: 'sora-2-image-to-video',
            callBackUrl: params.callbackUrl,
            input: {
                prompt: params.prompt,
                image_urls: params.imageUrls,
                aspect_ratio: params.aspectRatio || 'portrait',
                n_frames: params.nFrames || '15',
                remove_watermark: params.removeWatermark ?? true,
            },
        }),
    })

    if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Kie video generation failed: ${response.status} - ${errorText}`)
    }

    const result = await response.json()

    if (result.code !== 200) {
        throw new Error(`Kie API error: ${result.message}`)
    }

    return result
}

export async function checkKieVideoStatus(taskId: string): Promise<KieVideoStatusResponse> {
    if (!KIE_API_KEY) {
        throw new Error('KIE_API_KEY is not configured')
    }

    const response = await fetch(`${KIE_API_URL}/jobs/recordInfo?taskId=${taskId}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${KIE_API_KEY}`,
        },
    })

    if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Kie status check failed: ${response.status} - ${errorText}`)
    }

    return response.json()
}

export function parseKieResultJson(resultJson: string | null): { videoUrl: string | null } {
    if (!resultJson) {
        return { videoUrl: null }
    }

    try {
        const parsed = JSON.parse(resultJson)
        // resultUrls contains the video URLs
        const videoUrl = parsed.resultUrls?.[0] || null
        return { videoUrl }
    } catch {
        return { videoUrl: null }
    }
}

// Veo 3.1 Video Generation API
export interface Veo3VideoGenerationRequest {
    prompt: string
    imageUrls?: string[]
    model?: 'veo3_fast' | 'veo3_quality'
    watermark?: string
    callbackUrl?: string
    aspectRatio?: '16:9' | '9:16' | '1:1'
    seeds?: number
    enableFallback?: boolean
    enableTranslation?: boolean
    generationType?: 'TEXT_2_VIDEO' | 'REFERENCE_2_VIDEO' | 'FIRST_AND_LAST_FRAMES_2_VIDEO'
}

export interface Veo3VideoGenerationResponse {
    code: number
    msg: string
    data: {
        taskId: string
    }
}

export interface Veo3VideoStatusResponse {
    code: number
    msg: string
    data: {
        taskId: string
        paramJson: string
        completeTime: string
        response: {
            taskId: string
            resultUrls: string[]
            originUrls: string[]
            resolution: string
        }
        successFlag: number
        errorCode: string | null
        errorMessage: string
        createTime: string
    }
}

export async function generateVideoWithVeo3(params: Veo3VideoGenerationRequest): Promise<Veo3VideoGenerationResponse> {
    if (!KIE_API_KEY) {
        throw new Error('KIE_API_KEY is not configured')
    }

    const response = await fetch(`${KIE_API_URL}/veo/generate`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${KIE_API_KEY}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            prompt: params.prompt,
            imageUrls: params.imageUrls || [],
            model: params.model || 'veo3_fast',
            watermark: params.watermark || '',
            callBackUrl: params.callbackUrl,
            aspectRatio: params.aspectRatio || '9:16',
            seeds: params.seeds || Math.floor(Math.random() * (99999 - 10000 + 1)) + 10000,
            enableFallback: params.enableFallback ?? false,
            enableTranslation: params.enableTranslation ?? true,
            generationType: params.generationType || (params.imageUrls?.length ? 'REFERENCE_2_VIDEO' : 'TEXT_2_VIDEO'),
        }),
    })

    if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Veo3 video generation failed: ${response.status} - ${errorText}`)
    }

    const result = await response.json()

    if (result.code !== 200) {
        throw new Error(`Veo3 API error: ${result.msg}`)
    }

    return result
}

export async function checkVeo3VideoStatus(taskId: string): Promise<Veo3VideoStatusResponse> {
    if (!KIE_API_KEY) {
        throw new Error('KIE_API_KEY is not configured')
    }

    const response = await fetch(`${KIE_API_URL}/veo/record-info?taskId=${taskId}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${KIE_API_KEY}`,
        },
    })

    if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Veo3 status check failed: ${response.status} - ${errorText}`)
    }

    return response.json()
}

export function parseVeo3ResultJson(response: Veo3VideoStatusResponse['data']['response']): { videoUrl: string | null } {
    if (!response || !response.resultUrls || response.resultUrls.length === 0) {
        return { videoUrl: null }
    }

    return { videoUrl: response.resultUrls[0] }
}
