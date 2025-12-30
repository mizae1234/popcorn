
export async function improvePromptWithN8n(
    currentPrompt: string,
    productContext: any,
    imageUrls: string[] = []
): Promise<string | null> {
    const N8N_WEBHOOK_URL = process.env.N8N_PROMPT_WEBHOOK_URL

    console.log('--- n8n Integration Debug ---')
    console.log('Webhook URL configured:', !!N8N_WEBHOOK_URL)

    if (!N8N_WEBHOOK_URL) {
        console.warn('N8N_PROMPT_WEBHOOK_URL is not configured')
        return null
    }

    try {
        console.log('Calling n8n with prompt:', currentPrompt.substring(0, 50) + '...')
        console.log('Including image URLs:', imageUrls)

        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 60000) // 60s timeout

        const response = await fetch(N8N_WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                original_prompt: currentPrompt,
                product: productContext,
                image_urls: imageUrls,
            }),
            signal: controller.signal,
        })

        clearTimeout(timeoutId)

        if (!response.ok) {
            console.error(`n8n webhook failed: ${response.status} ${response.statusText}`)
            const errorText = await response.text()
            console.error('Error response body:', errorText)
            return null
        }

        const data = await response.json()
        console.log('n8n response received:', data)

        // Handle various n8n response formats
        let improved = null

        if (Array.isArray(data) && data.length > 0) {
            const firstItem = data[0]
            // Handle [{ output: { improved_prompt: ... } }] or [{ json: ... }] or [{ body: ... }]
            improved = firstItem.prompt ||
                firstItem.improved_prompt ||
                firstItem.body?.prompt ||
                firstItem.body?.improved_prompt ||
                firstItem.json?.prompt ||
                firstItem.json?.improved_prompt ||
                firstItem.output?.prompt ||
                firstItem.output?.improved_prompt
        } else if (data) {
            // Handle direct object { improved_prompt: ... }
            improved = data.prompt || data.improved_prompt
        }

        if (improved) {
            console.log('Successfully got improved prompt')
            return improved
        }

        console.warn('n8n returned success but no prompt field found in:', data)
        return null

    } catch (error) {
        console.error('Error calling n8n webhook:', error)
        return null
    } finally {
        console.log('--- End n8n Debug ---')
    }
}
