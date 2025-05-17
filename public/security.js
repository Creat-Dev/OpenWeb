class SecurityManager {
    constructor() {
        this.failedAttempts = new Map();
        this.blockDuration = 15 * 60 * 1000; // 15 minutes
        this.maxAttempts = 5;
    }

    // Protection contre les attaques par force brute
    checkBruteForce(ip) {
        const now = Date.now();
        const attempts = this.failedAttempts.get(ip) || { count: 0, timestamp: now };

        if (attempts.count >= this.maxAttempts) {
            if (now - attempts.timestamp < this.blockDuration) {
                throw new Error('Trop de tentatives. Réessayez plus tard.');
            }
            this.failedAttempts.delete(ip);
        }

        return true;
    }

    // Validation des entrées
    sanitizeInput(input) {
        return input.replace(/[<>]/g, '').trim();
    }

    // Vérification des en-têtes de sécurité
    checkSecurityHeaders(req) {
        const requiredHeaders = {
            'X-Frame-Options': 'DENY',
            'X-XSS-Protection': '1; mode=block',
            'X-Content-Type-Options': 'nosniff',
            'Referrer-Policy': 'strict-origin-when-cross-origin',
            'Content-Security-Policy': "default-src 'self'"
        };

        for (const [header, value] of Object.entries(requiredHeaders)) {
            if (!req.headers[header.toLowerCase()]) {
                throw new Error(`En-tête de sécurité manquant: ${header}`);
            }
        }
    }
}

// Exporter l'instance
const securityManager = new SecurityManager();
export default securityManager;
