terraform {
  required_providers {
    digitalocean = {
      source  = "digitalocean/digitalocean"
      version = "~> 2.25"
    }
  }
}
provider "digitalocean" {
  token = var.do_token
}

# Create a VPC
resource "digitalocean_vpc" "fiis_vpc" {
  name   = "fiis-vpc"
  region = var.do_region
  ip_range = "10.0.0.0/16"
}

# Create two Droplets (equivalent to EC2 instances)
resource "digitalocean_droplet" "app_instance_1" {
  name              = "fiis-instance-1"
  region            = var.do_region
  size              = "s-1vcpu-1gb" # Equivalent to t2.micro
  image             = "docker-20-04" # Ubuntu with Docker pre-installed
  vpc_uuid          = digitalocean_vpc.fiis_vpc.id
  ipv6              = true
  private_networking = true
  tags              = ["nodejs-app"]

  user_data = <<-EOF
                #!/bin/bash
                sudo apt update -y
                sudo apt install -y git docker-compose
                git clone https://github.com/giovanni-pe/trabajofinal.git /home/nodeapp
                cd /home/nodeapp/obs
                sudo curl -L "https://github.com/docker/compose/releases/download/$(curl -s https://api.github.com/repos/docker/compose/releases/latest | grep tag_name | cut -d '"' -f 4)/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
                sudo chmod +x /usr/local/bin/docker-compose
                sudo ln -s /usr/local/bin/docker-compose /usr/bin/docker-compose
                docker-compose up -d
                EOF
}

resource "digitalocean_droplet" "app_instance_2" {
  name              = "fiis-instance-2"
  region            = var.do_region
  size              = "s-1vcpu-1gb"
  image             = "docker-20-04"
  vpc_uuid          = digitalocean_vpc.fiis_vpc.id
  ipv6              = true
  private_networking = true
  tags              = ["nodejs-app"]

  user_data = <<-EOF
                #!/bin/bash
                sudo apt update -y
                sudo apt install -y git docker-compose
                git clone https://github.com/giovanni-pe/trabajofinal.git /home/nodeapp
                cd /home/nodeapp/obs
                sudo curl -L "https://github.com/docker/compose/releases/download/$(curl -s https://api.github.com/repos/docker/compose/releases/latest | grep tag_name | cut -d '"' -f 4)/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
                sudo chmod +x /usr/local/bin/docker-compose
                sudo ln -s /usr/local/bin/docker-compose /usr/bin/docker-compose
                docker-compose up -d
                EOF
}

# Create a Load Balancer
resource "digitalocean_loadbalancer" "nodeapp_lb" {
  name   = "nodeapp-lb"
  region = var.do_region
  forwarding_rule {
    entry_port     = 80
    entry_protocol = "http"
    target_port    = 80
    target_protocol = "http"
  }
  healthcheck {
    port     = 80
    protocol = "http"
    path     = "/"
  }
  droplet_ids = [digitalocean_droplet.app_instance_1.id, digitalocean_droplet.app_instance_2.id]
  vpc_uuid    = digitalocean_vpc.fiis_vpc.id
}

# Create a Firewall
resource "digitalocean_firewall" "app_firewall" {
  name = "fiis-app-firewall"

  inbound_rule {
    protocol         = "tcp"
    port_range       = "80"
    source_addresses = ["0.0.0.0/0", "::/0"]
  }

  inbound_rule {
    protocol         = "tcp"
    port_range       = "22"
    source_addresses = ["0.0.0.0/0", "::/0"]
  }

  outbound_rule {
    protocol         = "tcp"
    port_range       = "all"
    destination_addresses = ["0.0.0.0/0", "::/0"]
  }

  droplet_ids = [digitalocean_droplet.app_instance_1.id, digitalocean_droplet.app_instance_2.id]
}
