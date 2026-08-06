class Otp {
  constructor(id, data) {
    this.id = id;
    this.identifier = data.identifier; // SĐT hoặc Email
    this.code = data.code;
    this.expiresAt = data.expiresAt;
  }

  isExpired() {
    return Date.now() > this.expiresAt;
  }
}

module.exports = Otp;
