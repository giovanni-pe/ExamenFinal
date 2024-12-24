resource "aws_vpc" "privateNetwork" {
    cidr_block = "10.0.0.0/16"
    enable_dns_hostnames = true
    enable_dns_support = true
}

resource "aws_subnet" "public_a" {
    vpc_id = "${aws_vpc.privateNetwork.id}"
    cidr_block = "10.0.1.0/24"
    availability_zone = "${var.aws_region}a"
}

resource "aws_subnet" "public_b" {
    vpc_id = "${aws_vpc.privateNetwork.id}"
    cidr_block = "10.0.2.0/24"
    availability_zone = "${var.aws_region}b"
}

resource "aws_internet_gateway" "internet_gateway" {
    vpc_id = "${aws_vpc.privateNetwork.id}"
}

resource "aws_route" "internet_access" {
    route_table_id = "${aws_vpc.privateNetwork.main_route_table_id}"
    destination_cidr_block = "0.0.0.0/0"
    gateway_id = "${aws_internet_gateway.internet_gateway.id}"
}

# Create a security group to allow HTTP traffic to the ECS instances
resource "aws_security_group" "ecs_sg" {
  name = "ecs_sg_FIIS"
  vpc_id = "${aws_vpc.privateNetwork.id}"

  ingress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}