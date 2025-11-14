const pool = require('../../shared/db');

const userService = {
  // (기존)
  getUserByEmailWithPassword: async (email) => { /* ... (이전과 동일) ... */ 
    try {
      const [rows] = await pool.query('SELECT * FROM user WHERE email = ?', [email]);
      return rows[0];
    } catch (error) { throw new Error('Error finding user by email'); }
  },
  
  // [신규] userid 중복 검사
  getUserByUserid: async (userid) => {
    try {
      const [rows] = await pool.query('SELECT id FROM user WHERE userid = ?', [userid]);
      return rows[0];
    } catch (error) {
      throw new Error('Error finding user by userid');
    }
  },

  // [수정] 'GET /me' (프로필) 조회용 (PDF 스펙에 맞게 필드 선택)
  getUserByIdForProfile: async (id) => {
    try {
      const [rows] = await pool.query(
        'SELECT id, email, userid, display_name, profile_image_url, bio, theme, language, timezone, default_prompt_visibility, is_profile_public, show_email FROM user WHERE id = ?',
        [id]
      );
      return rows[0];
    } catch (error) {
      throw new Error('Error finding user for profile');
    }
  },
  
  // (기존)
  getUserByIdWithRefreshToken: async (id) => { /* ... (이전과 동일) ... */ 
    try {
      const [rows] = await pool.query('SELECT id, email, refresh_token FROM user WHERE id = ?', [id]);
      return rows[0];
    } catch (error) { throw new Error('Error finding user by id'); }
  },

  // [수정] 회원가입 (userid, display_name 추가)
  createUser: async ({ email, hashedPassword, userid, displayName }) => {
    try {
      const [result] = await pool.query(
        'INSERT INTO user (email, password, userid, display_name, login_type) VALUES (?, ?, ?, ?, ?)',
        [email, hashedPassword, userid, displayName, 'local'] 
      );
      // PDF 스펙 응답에 필요한 필드만 조회
      const [rows] = await pool.query(
        'SELECT id, email, userid, display_name FROM user WHERE id = ?',
        [result.insertId]
      );
      return rows[0];
    } catch (error) {
      throw new Error('Error creating user');
    }
  },
  
  // (기존)
  updateRefreshToken: async (userId, refreshToken) => { /* ... (이전과 동일) ... */ 
    try {
      await pool.query('UPDATE user SET refresh_token = ? WHERE id = ?', [refreshToken, userId]);
    } catch (error) { throw new Error('Error updating refresh token'); }
  },
  
  // (기존)
  updatePassword: async (userId, hashedPassword) => { /* ... (이전과 동일) ... */ 
    try {
      await pool.query('UPDATE user SET password = ? WHERE id = ?', [hashedPassword, userId]);
    } catch (error) { throw new Error('Error updating password'); }
  },

  // --- (기존) OAuth 함수들 (수정 없음) ---
  createOauthUser: async ({ email, displayName, profileImageUrl, loginType }) => { /* ... (이전과 동일) ... */ },
  getOauthAccount: async (provider, providerUserId) => { /* ... (이전과 동일) ... */ },
  createOauthAccount: async ({ userId, provider, providerUserId, accessToken, refreshToken }) => { /* ... (이전과 동일) ... */ },
  deleteOauthAccount: async (userId, provider) => { /* ... (이전과 동일) ... */ },
  
  // [수정] getUserByEmail (Oauth용)
  getUserByEmail: async (email) => {
    try {
      const [rows] = await pool.query(
        'SELECT id, email, display_name, login_type, profile_image_url FROM user WHERE email = ?',
        [email]
      );
      return rows[0];
    } catch (error) {
      throw new Error('Error finding user by email');
    }
  },
};

module.exports = userService;