import { OpenRouter } from "@openrouter/sdk"

const openrouter = new OpenRouter({
    apiKey: process.env.OPENROUTER_API_KEY!,
})

export interface CaptionInput {
    productName: string
    productDescription: string
    productFeatures?: string[]
    targetAudience?: string
    videoStyle?: string
}

export interface CaptionResult {
    caption: string
    hashtags: string[]
}

export async function generateCaption(input: CaptionInput): Promise<CaptionResult> {
    const prompt = `คุณเป็นผู้เชี่ยวชาญการเขียน Caption และ Hashtags สำหรับ TikTok ในภาษาไทย

ข้อมูลสินค้า:
- ชื่อสินค้า: ${input.productName}
- รายละเอียด: ${input.productDescription}
${input.productFeatures?.length ? `- จุดเด่น: ${input.productFeatures.join(', ')}` : ''}
${input.targetAudience ? `- กลุ่มเป้าหมาย: ${input.targetAudience}` : ''}
${input.videoStyle ? `- สไตล์วิดีโอ: ${input.videoStyle}` : ''}

กรุณาสร้าง Caption และ Hashtags สำหรับโพสวิดีโอ TikTok โดย:
1. Caption ควรสั้น กระชับ น่าสนใจ ใช้ภาษาทันสมัย (ไม่เกิน 150 ตัวอักษร)
2. ใส่ Emoji ให้ดึงดูด
3. สร้าง Hashtags ที่เกี่ยวข้อง 5-8 อัน (ภาษาไทยและอังกฤษ)

ตอบในรูปแบบ JSON:
{
  "caption": "...",
  "hashtags": ["#...", "#...", ...]
}`

    try {
        const stream = await openrouter.chat.send({
            model: "openai/gpt-5.2",
            messages: [
                {
                    role: "user",
                    content: prompt,
                }
            ],
            stream: true,
            streamOptions: {
                includeUsage: true
            }
        })

        let response = ""
        for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content
            if (content) {
                response += content
            }
        }

        // Parse JSON response
        const jsonMatch = response.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0])
            return {
                caption: parsed.caption || "",
                hashtags: parsed.hashtags || [],
            }
        }

        // Fallback if JSON parsing fails
        return {
            caption: response.slice(0, 150),
            hashtags: ["#TikTok", "#ขายของออนไลน์", "#สินค้าดี"],
        }
    } catch (error) {
        console.error("OpenRouter caption generation error:", error)
        // Return default caption on error
        return {
            caption: `✨ ${input.productName} - ${input.productDescription.slice(0, 50)}...`,
            hashtags: ["#TikTok", "#สินค้าดี", "#ขายของออนไลน์", "#รีวิว"],
        }
    }
}

export async function generateCaptionSimple(
    productName: string,
    productDescription: string
): Promise<string> {
    const result = await generateCaption({
        productName,
        productDescription,
    })

    return `${result.caption}\n\n${result.hashtags.join(' ')}`
}
