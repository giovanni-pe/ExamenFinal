variable "bucket_name" {
  description = "Name of the S3 bucket for the frontend"
  type        = string
  default     = "S3Bucket"
}
variable "lambda_name" {
  description = "Name of the Lambda function"
  type        = string
  default     = "BackendLambdaFunction"
}
variable "secret_key" {
  description = "Sensitive key for the backend Lambda"
  type        = string
  sensitive   = true
  default     = ""
}

// AWS General
variable "aws_key_name" {
  type = string
  default = "value"
}
variable "aws_vpc_id" {
  type = string
  default = "value"
}
variable "aws_region" {
  type = string
  default = "value"
}
variable "aws_profile" {
  type = string
  default = "value"
}
variable "aws_account_id" {
  type = string
  default = "value"
}