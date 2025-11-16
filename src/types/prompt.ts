export type PromptVisibility = 'public' | 'unlisted' | 'private' | string;

export interface PromptModelSetting {
  id?: number;
  prompt_version_id: number;
  ai_model_id: number;
  temperature?: number | null;
  max_token?: number | null;
  top_p?: number | null;
  frequency_penalty?: number | null;
  presence_penalty?: number | null;
}

export interface PromptModelSettingPayload {
  ai_model_id: number;
  temperature?: number;
  max_token?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
}

export type PromptModelSettingPatch = Partial<PromptModelSettingPayload>;

export interface PromptSummary {
  id: number;
  name: string;
  description: string | null;
  visibility: PromptVisibility;
  tags: string[];
  latest_version: PromptVersionSummary | null;
}

export interface PromptListResponse {
  items: PromptSummary[];
}

export interface PromptListQuery {
  owner?: 'me';
  visibility?: PromptVisibility;
  q?: string;
  page?: number;
  limit?: number;
}

export type PromptDetail = PromptSummary;

export interface PromptVersionSummary {
  id: number;
  version_number: number;
}

export interface PromptVersion extends PromptVersionSummary {
  is_draft?: 0 | 1 | boolean;
  commit_message?: string;
  category_id?: number | null;
  created_at?: string;
  model_setting?: PromptModelSetting | null;
  content?: string;
  revision?: number;
  created_by?: number;
  category_code?: string | null;
  category_name?: string | null;
}

export interface PromptVersionListResponse {
  items: PromptVersion[];
}

export interface PromptVersionListQuery {
  includeDraft?: boolean;
}

export interface PromptCreatePayload {
  name: string;
  description?: string;
  visibility?: PromptVisibility;
  tags?: string[];
  content: string;
  commit_message: string;
  category_code?: string;
  is_draft?: boolean;
  model_setting: PromptModelSettingPayload;
}

export interface PromptCreateResponse {
  id: number;
  owner_id: number;
  latest_version_id: number | null;
}

export interface PromptUpdatePayload {
  name?: string;
  description?: string | null;
  visibility?: PromptVisibility;
  tags?: string[];
}

export interface PromptUpdateResponse {
  id: number;
  name: string;
  visibility: PromptVisibility;
}

export interface PromptVersionCreatePayload {
  content: string;
  commit_message: string;
  category_code?: string;
  is_draft?: boolean;
  model_setting?: PromptModelSettingPayload;
}

export interface PromptVersionUpdatePayload {
  commit_message?: string;
  is_draft?: boolean;
  category_code?: string;
}

export interface PromptTagsResponse {
  items: string[];
}

export interface PromptCategory {
  id: number;
  code: string;
  name_en?: string;
  name_kr?: string;
}

export interface PromptCategoriesResponse {
  items: PromptCategory[];
}

export interface PromptModelSettingUpdateResponse {
  updated: boolean;
}
