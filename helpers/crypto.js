const crypto = require('crypto');

const algorithm = 'aes-256-cbc';
const ivSize = 16;


function getKey() {
    const encryptionKey = process.env.ENCRYPTION_KEY;
    const keyBuffer = Buffer.from(encryptionKey, 'hex');
    return keyBuffer;
}

function encrypt(text) {
    if (!text) return text;
    try {
        const key = getKey();
        const iv = crypto.randomBytes(ivSize);
        const cipher = crypto.createCipheriv(algorithm, key, iv);
        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        return iv.toString('hex') + ':' + encrypted;
    } catch (err) {
        console.error("Encryption error:", err.message);
        return text;
    }
}

function decrypt(text) {
    if (!text || !text.includes(':')) return text;
    try {
        const key = getKey();
        const parts = text.split(':');
        const iv = Buffer.from(parts.shift(), 'hex');
        const encryptedText = Buffer.from(parts.join(':'), 'hex');
        const decipher = crypto.createDecipheriv(algorithm, key, iv);
        let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    } catch (e) {
        console.error("Decryption error:", e.message);
        return "[Nečitljiva poruka]";
    }
}

module.exports = { encrypt, decrypt };