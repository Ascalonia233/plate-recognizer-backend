// api/recognize.js
const OpenAI = require('openai');

// 从环境变量读取百炼 API Key
const client = new OpenAI({
  apiKey: process.env.DASHSCOPE_API_KEY,
  baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
});

// 通过精准提示词引导模型输出结构化JSON
const SYSTEM_PROMPT = `你是一个专业的车牌识别系统。请识别用户上传图片中的车牌信息，并严格按照以下JSON格式输出，不要包含任何额外的解释或Markdown标记：
{
  "success": true,
  "plate": "识别到的车牌号码，如果没有识别到则返回空字符串",
  "color": "车牌底色，如蓝色、黄色、绿色、白色、黑色，无法判断则返回空字符串",
  "type": "车牌类型，如普通小型汽车、新能源车、大型汽车等，无法判断则返回空字符串"
}`;

module.exports = async (req, res) => {
  // 设置 CORS 头，允许前端跨域调用
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: '仅支持 POST 请求' });
  }

  try {
    const { imageBase64 } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ success: false, error: '缺少图片数据' });
    }

    // 构建图片的 Data URL
    const imageUrl = `data:image/jpeg;base64,${imageBase64}`;

    const completion = await client.chat.completions.create({
      model: 'qwen3-vl-plus', // 使用百炼视觉模型
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        {
          role: 'user',
          content: [{ type: 'image_url', image_url: { url: imageUrl } }],
        },
      ],
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) throw new Error('模型返回为空');

    // 清理可能存在的 Markdown 代码块标记后解析JSON
    const result = JSON.parse(content.replace(/```json\n?|```/g, '').trim());
    return res.status(200).json(result);

  } catch (error) {
    console.error('百炼 API 调用失败:', error);
    return res.status(500).json({
      success: false,
      error: '识别服务暂时不可用，请稍后重试',
      detail: error.message
    });
  }
};