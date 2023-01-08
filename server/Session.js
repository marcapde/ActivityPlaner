// each session contains the username of the user and the time at which it expires
class Session {
    constructor(sessionId, username, expiresAt) {
        this.username = username
        this.expiresAt = expiresAt
        this.id = sessionId
    }
		// we'll use this method later to determine if the session has expired
    isExpired() {
        this.expiresAt < (new Date())
    }
}
