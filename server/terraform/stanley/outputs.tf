output "base_url" {
  description = "API Gateway base url."
  value       = aws_api_gateway_deployment.deployment.invoke_url
}

output "test_url" {
  description = "API Gateway test url."
  value       = "${aws_api_gateway_deployment.deployment.invoke_url}/hello"
}

