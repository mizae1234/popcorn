const PHAYA_API_URL = process.env.PHAYA_API_URL || 'https://api.phaya.io/api/v1'
const PHAYA_API_KEY = process.env.PHAYA_API_KEY
import { improvePromptWithN8n } from './n8n'

export interface VideoGenerationRequest {
    prompt: string
    imageUrls: string[]
    aspectRatio?: 'landscape' | 'portrait' | 'square'
    nFrames?: '10' | '15'
    removeWatermark?: boolean
}

export interface VideoGenerationResponse {
    job_id: string
    task_id: string
    status: string
    message: string
    credits_used: number
}

export interface VideoStatusResponse {
    job_id: string
    task_id: string
    status: 'processing' | 'completed' | 'failed'
    video_url?: string
    message: string
}

export async function generateVideo(params: VideoGenerationRequest): Promise<VideoGenerationResponse> {
    if (!PHAYA_API_KEY) {
        throw new Error('PHAYA_API_KEY is not configured')
    }

    const response = await fetch(`${PHAYA_API_URL}/sora2-video/create`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${PHAYA_API_KEY}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            prompt: params.prompt,
            image_urls: params.imageUrls,
            aspect_ratio: params.aspectRatio || 'portrait',
            n_frames: params.nFrames || '10',
            remove_watermark: params.removeWatermark ?? true,
        }),
    })

    if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Video generation failed: ${response.status} - ${errorText}`)
    }

    return response.json()
}

export async function checkVideoStatus(jobId: string): Promise<VideoStatusResponse> {
    if (!PHAYA_API_KEY) {
        throw new Error('PHAYA_API_KEY is not configured')
    }

    const response = await fetch(`${PHAYA_API_URL}/sora2-video/status/${jobId}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${PHAYA_API_KEY}`,
        },
    })

    if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Status check failed: ${response.status} - ${errorText}`)
    }

    return response.json()
}



export async function createVideoPrompt(product: {
    name: string
    features: string
    concept: string
    targetAudience: string
    imageUrls?: string[]
}): Promise<string> {
    /*const conceptDescriptions: Record<string, string> = {
        'unboxing': 'สร้างภาพการ unboxing สินค้าอย่างตื่นเต้น มือค่อยๆ เปิดกล่อง แสดงสินค้าอย่างน่าสนใจ',
        'lifestyle': 'สร้างภาพการใช้งานสินค้าในชีวิตประจำวัน แสดงให้เห็นความสะดวกสบายและประโยชน์',
        'closeup': 'สร้างภาพ close-up ของสินค้า หมุนช้าๆ แสดงรายละเอียดและคุณภาพ',
        'before_after': 'สร้างภาพเปรียบเทียบก่อน-หลัง แสดงผลลัพธ์ที่น่าทึ่งจากการใช้สินค้า',
        'demo': 'สร้างภาพสาธิตวิธีใช้สินค้าอย่างง่ายดาย ขั้นตอนชัดเจน',
    }

    const audienceContext: Record<string, string> = {
        'gen_z': 'สำหรับกลุ่มวัยรุ่น Gen Z ที่ชอบความสนุกและเทรนด์ใหม่',
        'millennials': 'สำหรับคนรุ่นมิลเลนเนียลที่ใส่ใจคุณภาพและความคุ้มค่า',
        'parents': 'สำหรับพ่อแม่ที่ต้องการสินค้าดีๆ ให้ครอบครัว',
        'professionals': 'สำหรับคนทำงานที่ต้องการความสะดวกและมืออาชีพ',
        'beauty': 'สำหรับสายบิวตี้ที่ชอบดูแลตัวเองและความสวยงาม',
    }

    const conceptDesc = conceptDescriptions[product.concept] || product.concept
    const audienceDesc = audienceContext[product.targetAudience] || product.targetAudience

    const basicPrompt = `${conceptDesc}. สินค้า: ${product.name}. ${product.features}. ${audienceDesc}. สไตล์: โมเดิร์น สีสันสดใส เหมาะสำหรับ TikTok.`
*/

    const conceptDescriptions: Record<string, string> = {
        unboxing: "สร้างฉากการแกะกล่องสินค้าแบบตื่นเต้น ดึงดูดสายตา",
        lifestyle: "สร้างฉากการใช้งานสินค้าจริงในชีวิตประจำวัน แสดงความสะดวกสบายและประโยชน์",
        closeup: "สร้างช็อตใกล้เพื่อโชว์รายละเอียดสินค้า หมุนช้า ๆ เน้นวัสดุ ความพรีเมียม",
        before_after: "สร้างฉากเปรียบเทียบก่อนและหลังการใช้งาน แสดงผลลัพธ์ที่ชัดเจน",
        demo: "สร้างฉากสาธิตวิธีใช้สินค้าอย่างง่าย เข้าใจเร็ว"
    };

    const audienceContext: Record<string, string> = {
        gen_z: "เหมาะกับผู้ชมกลุ่มวัยรุ่น Gen Z สนุก ทันสมัย",
        millennials: "เหมาะกับคนรุ่นมิลเลนเนียลที่ชอบคุณภาพและความคุ้มค่า",
        parents: "เหมาะกับพ่อแม่ที่ใส่ใจความปลอดภัยและคุณภาพของลูกน้อย",
        professionals: "เหมาะกับคนทำงานที่ต้องการความสะดวกและดูเป็นมืออาชีพ",
        beauty: "เหมาะสำหรับกลุ่มที่รักความงามและดูแลตัวเอง"
    };

    const conceptDesc = conceptDescriptions[product.concept] || `นำเสนอสินค้าในคอนเซปต์: ${product.concept}`;
    const audienceDesc = audienceContext[product.targetAudience] || `เหมาะกับกลุ่มเป้าหมาย: ${product.targetAudience}`;

    //const basicPrompt = `${conceptDesc}. สินค้า: ${product.name}. ${product.features}. ${audienceDesc}. สไตล์: โมเดิร์น สีสันสดใส เหมาะสำหรับ TikTok.`
    const basicPrompt = `
    สร้างวิดีโอสินค้าในรูปแบบ 9:16 ความยาวประมาณ "8" วินาที 
    แนว TikTok/Reels/Shorts ด้วยภาพสวยงามสมจริง พร้อมดึงดูดความสนใจตั้งแต่ช่วงต้น
    รายละเอียดวิดีโอ:
    - ${conceptDesc}
    - สินค้า: ${product.name}
    - จุดเด่นสินค้า: ${product.features}
    - กลุ่มเป้าหมาย: ${audienceDesc}
    - โทนงาน: โมเดิร์น สดใส ดูเข้าถึงง่าย
    - การเคลื่อนกล้อง: ลื่นไหล น่าสนใจ
    - Reference image ถ้ามีให้ใช้ภาพนี้ประกอบ:
    ${product.imageUrls || product.imageUrls?.[0] || ""}
    รูปแบบผลลัพธ์:
    - วิดีโอคุณภาพสูง 1080x1920
    - ความยาว 8 วินาที
    - พร้อมใช้งานสำหรับ TikTok/Reels/Shorts
    📌 กฎสำคัญ:
    1.ห้ามใช้คำหยาบคายหรือภาษาที่ไม่เหมาะสม
    2.ห้ามมีเนื้อหาไม่สุภาพหรือผิดศีลธรรม
    3.ให้ตอบและสร้างเนื้อหาทั้งหมดเป็น **ภาษาไทยเท่านั้น**
    4.พูดอย่างสุภาพและเป็นมิตร
    5.ห้ามเนื้อหา 18+
    6.ห้ามใส่ subtitle ภาษาไทย ในวิดีโอ
    7.ถ้า AI ต้องบรรยาย ให้ใช้เฉพาะ Voice/Scene description เท่านั้น ห้ามขึ้นตัวหนังสือ 
    8.สร้าง Script และ Shot Outline เป็นภาษาไทยอย่างเป็นธรรมชาติ
    `.trim();
    console.log('Generated basic prompt:', basicPrompt)
    /*
        try {
            console.log('Attempting to improve prompt with n8n...')
            const improvedPrompt = await improvePromptWithN8n(basicPrompt, product, product.imageUrls)
            if (improvedPrompt) {
                console.log('Using improved prompt from n8n')
                return improvedPrompt
            }
            console.log('n8n did not return an improved prompt, falling back to basic')
        } catch (error) {
            console.warn('Failed to improve prompt with n8n, using basic prompt', error)
        }
    */


    return basicPrompt
}
