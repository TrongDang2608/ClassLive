class RefreshToken {
  constructor(id, data) {
    this.id = id;
    this.userId = data.userId;
    this.token = data.token || id;
    this.expiresAt = data.expiresAt;
    this.createdAt = data.createdAt || Date.now();
  }

  isExpired() {
    return Date.now() > this.expiresAt;
  }

  toFirestore() {
    return {
      userId: this.userId,
      token: this.token,
      expiresAt: this.expiresAt,
      createdAt: this.createdAt
    };
  }
}

module.exports = RefreshToken;
