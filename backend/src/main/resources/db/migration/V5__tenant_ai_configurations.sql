-- V5: Multi-tenant per-organization AI provider keys and custom brand voice
ALTER TABLE organizations 
ADD COLUMN IF NOT EXISTS gemini_api_key TEXT,
ADD COLUMN IF NOT EXISTS claude_api_key TEXT,
ADD COLUMN IF NOT EXISTS openai_api_key TEXT,
ADD COLUMN IF NOT EXISTS preferred_ai_provider VARCHAR(32) DEFAULT 'GEMINI',
ADD COLUMN IF NOT EXISTS brand_voice_prompt TEXT;
