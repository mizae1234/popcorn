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
