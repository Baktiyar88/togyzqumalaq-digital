/** OCR Model Registry — PRD Section 7.2 */

export interface OcrModelConfig {
  readonly id: string;
  readonly displayName: string;
  readonly provider: string;
  readonly endpoint: string;
  readonly apiKeyEnv: string;
  readonly temperature: number;
  readonly enabled: boolean;
}

const ocrModels: readonly OcrModelConfig[] = [
  {
    id: "deepseek-ocr",
    displayName: "DeepSeek OCR (Alem.Plus)",
    provider: "alem-plus",
    endpoint: process.env.DEEPSEEK_OCR_URL ?? "https://llm.alem.ai/v1/chat/completions",
    apiKeyEnv: "DEEPSEEK_OCR_API_KEY",
    temperature: 0,
    enabled: true,
  },
] as const;

export function getEnabledModels(): readonly OcrModelConfig[] {
  return ocrModels.filter((m) => m.enabled);
}

export function getModelById(id: string): OcrModelConfig | undefined {
  return ocrModels.find((m) => m.id === id);
}

export function getDefaultModel(): OcrModelConfig {
  const enabled = getEnabledModels();
  if (enabled.length === 0) {
    throw new Error("No OCR models are enabled in the config registry");
  }
  return enabled[0];
}
