import bcrypt from "bcrypt";
import crypto from "crypto";

/**
 * ArmorClaw Security Gateway Module
 * Strictly enforces zero-knowledge architecture.
 */

// Basic fast regex to replace common deterministic PII before embeddings
// In a full prod system, this would use a localized NLP model like Presidio
export function scrubPII(text: string): string {
    let scrubbed = text;
    // Replace emails
    scrubbed = scrubbed.replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '[REDACTED_EMAIL]');
    // Replace US phone numbers
    scrubbed = scrubbed.replace(/\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g, '[REDACTED_PHONE]');
    // Replace potential Social Security Numbers
    scrubbed = scrubbed.replace(/\b\d{3}-\d{2}-\d{4}\b/g, '[REDACTED_SSN]');
    // Clean up random excessive names (basic proxy)
    
    return scrubbed;
}

export async function hashIPMetadata(ip: string): Promise<string> {
   if (!ip) return "UNKNOWN_IP_HASH";
   const saltRounds = 10;
   const hash = await bcrypt.hash(ip, saltRounds);
   return hash;
}

// Ensure the abstract never hits cloud storage in plain text if being logged
export function encryptAbstractStorage(text: string): { iv: string, encryptedData: string } {
    const algorithm = 'aes-256-cbc';
    const rawKey = process.env.ENCRYPTION_KEY || "aether_fallback_encryption_key_32!"; // Must be 32 bytes
    const key = crypto.scryptSync(rawKey, 'salt', 32);
    const iv = crypto.randomBytes(16);
    
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    return { iv: iv.toString('hex'), encryptedData: encrypted };
}
