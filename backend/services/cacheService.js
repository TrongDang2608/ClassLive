const { getRedisClient, isRedisReady } = require('../config/redis');

class CacheService {
  /**
   * Đọc dữ liệu từ Cache
   * @param {string} key 
   * @returns {Promise<any|null>}
   */
  async get(key) {
    if (!isRedisReady()) return null;
    try {
      const client = getRedisClient();
      const data = await client.get(key);
      if (!data) return null;
      try {
        return JSON.parse(data);
      } catch {
        return data;
      }
    } catch (err) {
      console.warn(`[CacheService.get] Lỗi khi đọc key "${key}":`, err.message);
      return null;
    }
  }

  /**
   * Lưu dữ liệu vào Cache kèm thời gian sống (TTL)
   * @param {string} key 
   * @param {any} value 
   * @param {number} ttlSeconds - Thời gian sống tính bằng giây (Mặc định: 3600s = 1 giờ)
   */
  async set(key, value, ttlSeconds = 3600) {
    if (!isRedisReady()) return false;
    try {
      const client = getRedisClient();
      const stringValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
      if (ttlSeconds > 0) {
        await client.set(key, stringValue, 'EX', ttlSeconds);
      } else {
        await client.set(key, stringValue);
      }
      return true;
    } catch (err) {
      console.warn(`[CacheService.set] Lỗi khi ghi key "${key}":`, err.message);
      return false;
    }
  }

  /**
   * Xóa 1 key cụ thể
   * @param {string} key 
   */
  async del(key) {
    if (!isRedisReady()) return false;
    try {
      const client = getRedisClient();
      await client.del(key);
      return true;
    } catch (err) {
      console.warn(`[CacheService.del] Lỗi khi xóa key "${key}":`, err.message);
      return false;
    }
  }

  /**
   * Xóa hàng loạt key theo pattern (Sử dụng SCAN non-blocking chuẩn production)
   * Ví dụ: delPattern('classlive:schools:*')
   * @param {string} pattern 
   */
  async delPattern(pattern) {
    if (!isRedisReady()) return false;
    try {
      const client = getRedisClient();
      let cursor = '0';
      do {
        // SCAN 100 keys mỗi lượt để không nghẽn Event Loop của Redis
        const [nextCursor, keys] = await client.scan(cursor, 'MATCH', pattern, 'COUNT', 100);
        cursor = nextCursor;
        if (keys && keys.length > 0) {
          await client.unlink(...keys); // UNLINK nhanh hơn DEL vì giải phóng bộ nhớ ngầm
        }
      } while (cursor !== '0');
      return true;
    } catch (err) {
      console.warn(`[CacheService.delPattern] Lỗi khi xóa pattern "${pattern}":`, err.message);
      return false;
    }
  }

  /**
   * Cache-Aside Pattern: Tự động tìm trong cache, nếu không có thì gọi fetchFn lấy data và cache lại
   * @param {string} key 
   * @param {number} ttlSeconds 
   * @param {Function} fetchFn - Hàm async lấy dữ liệu gốc từ Database
   */
  async remember(key, ttlSeconds, fetchFn) {
    // 1. Kiểm tra cache
    const cachedData = await this.get(key);
    if (cachedData !== null) {
      return cachedData;
    }

    // 2. Cache Miss: Gọi hàm truy vấn DB
    const freshData = await fetchFn();

    // 3. Lưu vào Cache nếu có dữ liệu hợp lệ
    if (freshData !== undefined && freshData !== null) {
      await this.set(key, freshData, ttlSeconds);
    }

    return freshData;
  }

  /**
   * Tăng biến đếm nguyên tử (Atomic Increment)
   * @param {string} key 
   * @returns {Promise<number|null>}
   */
  async incr(key) {
    if (!isRedisReady()) return null;
    try {
      const client = getRedisClient();
      return await client.incr(key);
    } catch (err) {
      console.warn(`[CacheService.incr] Lỗi key "${key}":`, err.message);
      return null;
    }
  }

  /**
   * Đặt thời gian hết hạn cho 1 key
   * @param {string} key 
   * @param {number} ttlSeconds 
   */
  async expire(key, ttlSeconds) {
    if (!isRedisReady()) return false;
    try {
      const client = getRedisClient();
      await client.expire(key, ttlSeconds);
      return true;
    } catch (err) {
      return false;
    }
  }

  /**
   * Kiểm tra key có tồn tại không
   * @param {string} key 
   * @returns {Promise<boolean>}
   */
  async exists(key) {
    if (!isRedisReady()) return false;
    try {
      const client = getRedisClient();
      const res = await client.exists(key);
      return res === 1;
    } catch {
      return false;
    }
  }
}

module.exports = new CacheService();
