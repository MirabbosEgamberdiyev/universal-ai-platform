package com.omniagent.modules.documents.domain;

import com.omniagent.common.domain.TenantEntity;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "documents")
public class Document extends TenantEntity {

    @Column(name = "uploaded_by_user_id")
    private UUID uploadedByUserId;

    @Column(name = "file_name", nullable = false)
    private String fileName;

    @Column(name = "file_type", nullable = false)
    private String fileType; // PDF, DOCX, XLSX, PPTX, CSV, TXT

    @Column(name = "file_size_bytes", nullable = false)
    private Long fileSizeBytes = 0L;

    @Column(name = "storage_url", nullable = false)
    private String storageUrl;

    @Column(name = "scan_status", nullable = false)
    private String scanStatus = "CLEAN"; // CLEAN, QUARANTINED, SCANNING

    @Column(name = "prompt_injection_score", precision = 4, scale = 3)
    private BigDecimal promptInjectionScore = BigDecimal.ZERO;

    @Column(name = "extracted_text", columnDefinition = "TEXT")
    private String extractedText;

    @Column(name = "ai_summary", columnDefinition = "TEXT")
    private String aiSummary;

    public UUID getUploadedByUserId() {
        return uploadedByUserId;
    }

    public void setUploadedByUserId(UUID uploadedByUserId) {
        this.uploadedByUserId = uploadedByUserId;
    }

    public String getFileName() {
        return fileName;
    }

    public void setFileName(String fileName) {
        this.fileName = fileName;
    }

    public String getFileType() {
        return fileType;
    }

    public void setFileType(String fileType) {
        this.fileType = fileType;
    }

    public Long getFileSizeBytes() {
        return fileSizeBytes;
    }

    public void setFileSizeBytes(Long fileSizeBytes) {
        this.fileSizeBytes = fileSizeBytes;
    }

    public String getStorageUrl() {
        return storageUrl;
    }

    public void setStorageUrl(String storageUrl) {
        this.storageUrl = storageUrl;
    }

    public String getScanStatus() {
        return scanStatus;
    }

    public void setScanStatus(String scanStatus) {
        this.scanStatus = scanStatus;
    }

    public BigDecimal getPromptInjectionScore() {
        return promptInjectionScore;
    }

    public void setPromptInjectionScore(BigDecimal promptInjectionScore) {
        this.promptInjectionScore = promptInjectionScore;
    }

    public String getExtractedText() {
        return extractedText;
    }

    public void setExtractedText(String extractedText) {
        this.extractedText = extractedText;
    }

    public String getAiSummary() {
        return aiSummary;
    }

    public void setAiSummary(String aiSummary) {
        this.aiSummary = aiSummary;
    }
}
