variable "do_token" {
  description = "DigitalOcean API Token"
  type        = string
}

variable "do_region" {
  description = "Region for DigitalOcean resources"
  type        = string
  default     = "nyc3"
}
