# 八字命理大師

## Vercel 環境變數

請在 Vercel Project Settings -> Environment Variables 新增：

```txt
ANTHROPIC_API_KEY=你的 Anthropic API Key
ANTHROPIC_MODEL=claude-3-5-haiku-latest
```

`ANTHROPIC_MODEL` 可省略，程式會自動使用 `claude-3-5-haiku-latest`。

新增或修改環境變數後，請到 Deployments 重新 Redeploy。
