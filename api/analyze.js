export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'ANTHROPIC_API_KEY 未設定' });
  }

  const { prompt } = req.body || {};
  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ error: '缺少 prompt 參數' });
  }

  const model = process.env.ANTHROPIC_MODEL || 'claude-3-5-haiku-latest';

  try {
    const upstream = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model,
        max_tokens: 3500,
        temperature: 0.7,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      }),
    });

    const rawText = await upstream.text();
    let data = {};

    try {
      data = rawText ? JSON.parse(rawText) : {};
    } catch {
      return res.status(502).json({
        error: 'Anthropic 回傳內容不是 JSON',
        status: upstream.status,
        raw: rawText.slice(0, 1200),
        model,
      });
    }

    if (!upstream.ok) {
      return res.status(upstream.status).json({
        error: data.error?.message || data.error || 'Anthropic API 呼叫失敗',
        type: data.error?.type,
        model,
      });
    }

    const text = data.content?.find((item) => item.type === 'text')?.text || '';
    if (!text) {
      return res.status(502).json({
        error: 'Anthropic API 沒有回傳文字內容',
        model,
        raw: data,
      });
    }

    return res.status(200).json({ text, model });
  } catch (err) {
    return res.status(500).json({
      error: err.message || '伺服器錯誤',
      model,
    });
  }
}
