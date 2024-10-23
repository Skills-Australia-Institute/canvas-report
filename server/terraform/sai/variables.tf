variable "aws_region" {
  description = "AWS region for all resources."
  type        = string
  default     = "ap-southeast-2"
}

variable "stage_name" {
  description = "Deployment stage name."
  type        = string
  default     = "prod"
}

variable "canvas_base_url" {
  description = "Canvas API base url."
  type        = string
}

variable "canvas_page_size" {
  description = "Page size while fetching from Canvas API."
  type        = string
}

variable "canvas_access_token" {
  description = "Canvas admin account's access token."
  type        = string
}

variable "web_url" {
  description = "Url of web client."
  type        = string
}

variable "supabase_base_url" {
  description = "Supabase project url."
  type        = string
}

variable "supabase_public_anon_key" {
  description = "Supabase public anon key."
  type        = string
}

variable "supabase_jwt_secret" {
  description = "Supabase jwt secret used for access token validation."
  type        = string
}