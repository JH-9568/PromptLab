// 프로필

export interface ProfileSettings {
  userid: string;
  display_name: string;
  profile_image_url: string | null;
  bio: string;
  email: string;  
}

export interface UpdateProfileRequest {
  userid?: string;
  display_name?: string;
  profile_image_url?: string | null;
  bio?: string;
}

export interface UpdateProfileResponse {
  updated: boolean;
}

// 프라이버시

export interface PrivacySettings {
  is_profile_public: boolean;
  show_email: boolean;
  show_activity_status: boolean;
  default_prompt_visibility: 'public' | 'private' | 'unlisted';
}

export interface UpdatePrivacyRequest {
  is_profile_public?: boolean;
  show_email?: boolean;
  show_activity_status?: boolean;
  default_prompt_visibility?: 'public' | 'private' | 'unlisted';
}

export interface UpdatePrivacyResponse {
  updated: boolean;
}

// 환경

export interface EnvironmentSettings {
  theme: 'dark' | 'light' | 'system';
  language: string;
  timezone: string;
}

export interface UpdateEnvironmentRequest {
  theme?: 'dark' | 'light' | 'system';
  language?: string;
  timezone?: string;
}

export interface UpdateEnvironmentResponse {
  updated: boolean;
}

// 이메일 변경

export interface EmailChangeRequest {
  new_email: string;
}

export interface EmailChangeRequestResponse {
  sent: boolean;
}

export interface EmailChangeConfirmRequest {
  token: string;
}

export interface EmailChangeConfirmResponse {
  changed: boolean;
}

// 세션 관리

export interface Session {
  id: string;
  ip: string;
  ua: string;
  last_active_at: string;
  this_device: boolean;
}

export interface SessionsResponse {
  items: Session[];
}

// 데이터 내보내기

export interface DataExportRequest {
  include: ('profile' | 'prompts' | 'versions' | 'playground_history' | 'activity')[];
}

export interface DataExportResponse {
  job_id: string;
  status: 'queued' | 'running' | 'ready' | 'failed' | 'expired';
}

export interface DataExportJob {
  job_id: string;
  status: 'queued' | 'running' | 'ready' | 'failed' | 'expired';
  file_url?: string;
  expires_at?: string;
}

// 에러 코드

export type SettingsErrorCode =
  | 'USERID_TAKEN'
  | 'INVALID_FIELD'
  | 'EMAIL_TAKEN'
  | 'INVALID_EMAIL'
  | 'TOO_MANY_REQUESTS'
  | 'INVALID_TOKEN'
  | 'TOKEN_EXPIRED'
  | 'SESSION_NOT_FOUND'
  | 'REAUTH_REQUIRED'
  | 'PENDING_EXPORT'
  | 'LOCKED'
  | 'EXPORT_NOT_FOUND'
  | 'EXPORT_IN_PROGRESS';
