-- ==============================================================================
-- OMNIAGENT / NOVASPHERE AI — V2 ENTERPRISE EXTENSION MIGRATION
-- Multi-Agent Registry, Email, Document Intelligence, RAG Knowledge, Business Assistant
-- ==============================================================================

-- 1. EMAIL ACCOUNTS
CREATE TABLE IF NOT EXISTS email_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    provider VARCHAR(50) NOT NULL, -- GMAIL, OUTLOOK, IMAP
    email_address VARCHAR(255) NOT NULL,
    account_name VARCHAR(255) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    sync_status VARCHAR(50) NOT NULL DEFAULT 'SYNCED',
    last_synced_at TIMESTAMPTZ,
    version BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMPTZ,
    CONSTRAINT uq_org_email_address UNIQUE(organization_id, email_address)
);

-- 2. EMAILS (INBOUND & OUTBOUND)
CREATE TABLE IF NOT EXISTS emails (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    email_account_id UUID NOT NULL REFERENCES email_accounts(id) ON DELETE CASCADE,
    external_message_id VARCHAR(255),
    thread_id VARCHAR(255),
    sender_email VARCHAR(255) NOT NULL,
    sender_name VARCHAR(255),
    recipient_email VARCHAR(255) NOT NULL,
    subject TEXT NOT NULL,
    body_snippet TEXT,
    body_html TEXT,
    category VARCHAR(50) NOT NULL DEFAULT 'GENERAL', -- URGENT, LEAD, SUPPORT, NEWSLETTER, GENERAL
    direction VARCHAR(20) NOT NULL DEFAULT 'INBOUND', -- INBOUND, OUTBOUND
    status VARCHAR(50) NOT NULL DEFAULT 'UNREAD', -- UNREAD, READ, ARCHIVED, SPAM
    ai_summary TEXT,
    ai_draft_reply TEXT,
    received_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    version BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_emails_org_status ON emails(organization_id, status);
CREATE INDEX IF NOT EXISTS idx_emails_account_received ON emails(email_account_id, received_at DESC);

-- 3. DOCUMENTS (DOCUMENT INTELLIGENCE)
CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    uploaded_by_user_id UUID REFERENCES users(id),
    file_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(100) NOT NULL, -- PDF, DOCX, XLSX, PPTX, CSV, TXT
    file_size_bytes BIGINT NOT NULL,
    storage_url TEXT NOT NULL,
    scan_status VARCHAR(50) NOT NULL DEFAULT 'CLEAN', -- CLEAN, QUARANTINED, SCANNING
    prompt_injection_score NUMERIC(4,3) DEFAULT 0.000,
    extracted_text TEXT,
    ai_summary TEXT,
    version BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_documents_org_type ON documents(organization_id, file_type);

-- 4. DOCUMENT CHUNKS (FOR RAG VECTOR RETRIEVAL)
CREATE TABLE IF NOT EXISTS document_chunks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    chunk_index INTEGER NOT NULL,
    chunk_text TEXT NOT NULL,
    token_count INTEGER NOT NULL DEFAULT 0,
    embedding_vector JSONB,
    version BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_chunks_document ON document_chunks(document_id, chunk_index);

-- 5. KNOWLEDGE BASES
CREATE TABLE IF NOT EXISTS knowledge_bases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    scope VARCHAR(50) NOT NULL DEFAULT 'ORGANIZATION', -- PERSONAL, ORGANIZATION, TEAM
    is_active BOOLEAN NOT NULL DEFAULT true,
    version BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMPTZ
);

-- 6. KNOWLEDGE ARTICLES
CREATE TABLE IF NOT EXISTS knowledge_articles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    knowledge_base_id UUID NOT NULL REFERENCES knowledge_bases(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    source_citation VARCHAR(255),
    tags TEXT[],
    is_verified BOOLEAN NOT NULL DEFAULT true,
    version BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMPTZ
);

-- 7. BUSINESS PLANS & MARKET INTELLIGENCE
CREATE TABLE IF NOT EXISTS business_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    plan_type VARCHAR(50) NOT NULL, -- BUSINESS_PLAN, MARKET_RESEARCH, COMPETITOR_ANALYSIS, PROPOSAL
    target_industry VARCHAR(255),
    content_json JSONB NOT NULL DEFAULT '{}',
    status VARCHAR(50) NOT NULL DEFAULT 'DRAFT',
    version BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMPTZ
);

-- 8. AGENT DEFINITIONS (18 SPECIALIZED AGENTS REGISTRY)
CREATE TABLE IF NOT EXISTS agent_definitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    agent_code VARCHAR(100) NOT NULL,
    name VARCHAR(255) NOT NULL,
    domain VARCHAR(100) NOT NULL,
    system_prompt TEXT NOT NULL,
    allowed_tools JSONB NOT NULL DEFAULT '[]',
    is_enabled BOOLEAN NOT NULL DEFAULT true,
    executions_count INTEGER NOT NULL DEFAULT 0,
    version BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMPTZ,
    CONSTRAINT uq_org_agent_code UNIQUE(organization_id, agent_code)
);
