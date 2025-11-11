export interface Profile {
  id: string
  email: string
  full_name?: string | null
  bio?: string | null
  avatar_url?: string | null
  phone?: string | null
  location?: string | null
  created_at: string
  updated_at: string
}

export interface UpdateProfileInput {
  full_name?: string | null
  bio?: string | null
  phone?: string | null
  location?: string | null
}

export interface AvatarUploadResponse {
  avatar_url: string
  path: string
}
