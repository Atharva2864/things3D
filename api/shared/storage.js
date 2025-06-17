// Shared in-memory storage for testing
// In production, this would be replaced with Azure Table Storage

class InMemoryStorage {
    constructor() {
        this.users = new Map();
        this.sessions = new Map();
    }

    // User management
    userExists(email) {
        return this.users.has(email);
    }

    createUser(email, passwordHash) {
        const user = {
            email: email,
            passwordHash: passwordHash,
            createdAt: new Date().toISOString()
        };
        this.users.set(email, user);
        return user;
    }

    getUser(email) {
        return this.users.get(email);
    }

    getAllUsers() {
        return Array.from(this.users.values());
    }

    // Session management
    createSession(email, token) {
        const session = {
            email: email,
            token: token,
            createdAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
        };
        this.sessions.set(token, session);
        return session;
    }

    getSession(token) {
        const session = this.sessions.get(token);
        if (!session) return null;
        
        // Check if session is expired
        if (new Date() > new Date(session.expiresAt)) {
            this.sessions.delete(token);
            return null;
        }
        
        return session;
    }

    deleteSession(token) {
        return this.sessions.delete(token);
    }
}

// Export a singleton instance
module.exports = new InMemoryStorage();
