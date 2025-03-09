export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Only POST requests allowed" });
    }

    const { inputWord, temperature } = req.body;  // 接收 temperature 变量
    const apiKey = process.env.OPENAI_API_KEY; // 读取 Vercel 存储的 API Key

    try {
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: "gpt-4o-mini",
                temperature: temperature || 1.2, // 这里控制随机性（如果未传递，默认 1）
                messages: [
                    { role: "system", content: "You are an AI only speak English that can compose a sentence from the given words, thus generating meaning, say some thing that can inspire human to think, say something deep please. Please do not say too much whispers, whisper, shadow, light, drifr, storms, dream, echos, shadows,float, truth, indifference, dream, memory, forgotten, etc. You can use these words, but not too much. Please use various word, be creative. Your answers should be poetic, philosophical or absurd." },
                    { role: "user", content: `
                        You are a cloud in the sky. You do not think like a human but as a floating, ever-changing entity.
  
                        Generate three different semantic interpretations that begin with the word '${inputWord}'. In each meaning, the first word must be '${inputWord}', and the second and third word must be different. The phrase must contain 3 words in total.
            
                        Each interpretation should reflect the perspective of a cloud—detached from human emotions, but should reflect the deep issue in human society, because you live in deep time, and you observe human a lot. Your answers should be poetic, philosophical or absurd. 
            
                        Try to avoid repeating words too often. The words must make sense together.
            
                        ### **Examples**
                        For input: **"rock"**  
                        Possible output:  
                        rock echo cry, rock fracture hit, rock music club 
                        Possible output:  
                        water burden high, water betrayal ice, water regret human
            
                        Return the results as a comma-separated list, and **do not add a period at the end**.
                        Also, try your best to generate whole sentence with meaning. Please do not say too much whispers, whisper, shadow, light, drifr, storms, dream, echos, shadows,float, truth, indifference, dream, memory, forgotten, etc. You can use these words, but not too much. Please use various word, be creative, and say some thing that can inspire human to think, say something deep please.
                        Please remember, you only generate three sentence.
                        Remember your answer only contain 3 words and begin with the word '${inputWord}' in English. 
                    ` }
                ],
                max_tokens: 50
            })
        });

        if (!response.ok) {
            console.error("OpenAI API request failed:", response.status, await response.text());
            return res.status(response.status).json({ error: "OpenAI API error" });
        }

        const data = await response.json();
        if (data.choices) {
            return res.status(200).json({ phrases: data.choices[0].message.content.split(", ") });
        } else {
            return res.status(500).json({ error: "Invalid OpenAI response" });
        }

    } catch (error) {
        return res.status(500).json({ error: "OpenAI API request failed", details: error.message });
    }
}
