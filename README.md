# Cybersecurity: Attack, Understand & Defend

A hands-on cybersecurity learning repository focused on understanding how vulnerabilities work, reproducing security issues in controlled environments, applying mitigations, and validating that the defenses work.

> **Attack → Understand → Defend → Retest**

This repository is designed for developers, engineers, and learners who want to understand cybersecurity through practical experiments rather than theory alone.

---

## Objective

The goal of this repository is to study cybersecurity from an engineering perspective.

Each lab follows a simple workflow:

```text
Create a Controlled Lab
        ↓
Reproduce the Vulnerability
        ↓
Observe the Attack Behavior
        ↓
Understand the Root Cause
        ↓
Apply a Mitigation
        ↓
Retest the Same Scenario
        ↓
Validate the Defense
```

The focus is not simply on running security tools or copying exploit commands.

The objective is to understand:

* How the vulnerability works
* Why the vulnerable behavior occurs
* What an attacker could potentially abuse
* How developers can mitigate the issue
* How to validate that the mitigation is effective

---

## Lab Philosophy

All demonstrations in this repository are designed for:

* Local environments
* Self-hosted systems
* Intentionally vulnerable applications
* Personal devices
* Controlled networks
* Authorized security testing environments

Whenever possible, demonstrations use simulated pages, local services, dummy data, and isolated environments.

Example:

```text
Attacker Simulation
        ↓
Intentionally Vulnerable Lab
        ↓
Observe Security Impact
        ↓
Apply Security Control
        ↓
Run the Same Test Again
```

The same attack scenario is tested before and after mitigation.

---

## Ethical Use

> [!WARNING]
> This repository is intended for educational, defensive security, and authorized security research purposes only.

Do not use the techniques demonstrated in this repository against systems, networks, applications, devices, or accounts that you do not own or have explicit permission to test.

The labs may demonstrate security weaknesses and attack concepts to help developers and engineers understand how to build more secure systems.

You are responsible for ensuring that your use of the material complies with applicable laws, policies, and authorization requirements.

---

## Cybersecurity Labs

| EP   | Security Topic                    | Category                | Status         |
| ---- | --------------------------------- | ----------------------- | -------------- |
| EP01 | Reverse Tabnabbing                | Web Security            | 🚧 In Progress |
| EP02 | Cross-Site Scripting (XSS)        | Web Security            | 📌 Planned     |
| EP03 | Cross-Site Request Forgery (CSRF) | Web Security            | 📌 Planned     |
| EP04 | SQL Injection                     | Application Security    | 📌 Planned     |
| EP05 | Broken Access Control / IDOR      | API Security            | 📌 Planned     |
| EP06 | Path Traversal                    | Application Security    | 📌 Planned     |
| EP07 | Command Injection                 | System Security         | 📌 Planned     |
| EP08 | Insecure File Upload              | Web Security            | 📌 Planned     |
| EP09 | Session & Cookie Security         | Web Security            | 📌 Planned     |
| EP10 | JWT Security Mistakes             | API Security            | 📌 Planned     |
| EP11 | CORS Misconfiguration             | Web / API Security      | 📌 Planned     |
| EP12 | API Rate Limiting                 | API Security            | 📌 Planned     |
| EP13 | MQTT Security                     | IoT Security            | 📌 Planned     |
| EP14 | Modbus TCP Security               | Industrial IoT Security | 📌 Planned     |
| EP15 | IoT Device Security               | Embedded / IoT Security | 📌 Planned     |

The roadmap may evolve as new labs and security topics are added.

---

## Repository Structure

```text
cybersecurity-attack-understand-defend/
│
├── 01-reverse-tabnabbing/
│   ├── README.md
│   └── demo/
│
├── 02-cross-site-scripting/
│   ├── README.md
│   └── demo/
│
├── 03-cross-site-request-forgery/
│   ├── README.md
│   └── demo/
│
├── 04-sql-injection/
│   ├── README.md
│   └── demo/
│
├── 13-mqtt-security/
│   ├── README.md
│   └── lab/
│
├── 14-modbus-tcp-security/
│   ├── README.md
│   └── lab/
│
└── README.md
```

Each lab may contain:

```text
README.md
demo/
lab/
src/
config/
docs/
```

The exact structure depends on the technology and security topic being demonstrated.

---

## Lab Methodology

Each cybersecurity lab generally follows five stages.

### 1. Vulnerable

Create or configure an intentionally vulnerable environment.

```text
Vulnerable Application
        ↓
Security Weakness Exists
```

### 2. Attack

Reproduce the security behavior inside the controlled lab.

```text
Security Test
        ↓
Trigger Vulnerable Behavior
```

### 3. Understand

Analyze the technical root cause.

Examples include:

* Browser security behavior
* Authentication logic
* Authorization logic
* Input handling
* Protocol design
* Network exposure
* Device configuration
* Software architecture

### 4. Defend

Apply an appropriate security control or mitigation.

```text
Vulnerability
        ↓
Security Control
        ↓
Mitigated System
```

### 5. Retest

Repeat the original test.

```text
Original Security Test
        ↓
Mitigated System
        ↓
Attack Path Blocked
```

A mitigation should not simply be assumed to work.

It should be validated.

---

## Web Security

Web security labs explore vulnerabilities and browser security mechanisms such as:

* Reverse Tabnabbing
* Cross-Site Scripting
* Cross-Site Request Forgery
* Content Security Policy
* Cookie Security
* Session Management
* CORS
* Authentication
* Authorization
* File Upload Security

Example attack surface:

```text
Browser
   │
   ▼
Frontend
   │
   ▼
Web API
   │
   ▼
Application Logic
   │
   ▼
Database
```

Each layer introduces different security considerations.

---

## 🔌 IoT Security

IoT systems combine hardware, firmware, networks, protocols, and backend infrastructure.

```text
Sensor
   │
   ▼
Microcontroller
   │
   ▼
Network
   │
   ▼
Gateway
   │
   ▼
MQTT Broker
   │
   ▼
Backend API
   │
   ▼
Database
   │
   ▼
Dashboard
```

Potential security areas include:

* Firmware secrets
* Device authentication
* MQTT authentication
* MQTT ACL configuration
* Network exposure
* Insecure APIs
* Device identity
* Command authorization
* OTA update security
* Data integrity

The IoT security labs focus on understanding security across the entire system architecture.

---

## Industrial IoT Security

Industrial and operational technology systems introduce additional security considerations.

Example architecture:

```text
Sensor
   │
   │ RS485
   ▼
Modbus RTU Device
   │
   ▼
Industrial Gateway
   │
   │ Modbus TCP
   ▼
Industrial Network
   │
   ▼
SCADA / Data Platform
```

Topics may include:

* Modbus protocol security
* Network segmentation
* Gateway security
* Device exposure
* Protocol trust assumptions
* Unauthorized command risks
* Monitoring and anomaly detection

Industrial security labs must always be performed in isolated or authorized environments.

Never perform experiments on operational production systems.

---

## Technologies

Technologies used throughout the labs may include:

* HTML
* CSS
* JavaScript
* Python
* FastAPI
* Linux
* Docker
* MQTT
* Mosquitto
* ESP32
* RS485
* Modbus RTU
* Modbus TCP
* Node-RED
* Wireshark

Different labs use different technology stacks depending on the security concept.

---

## Getting Started

Clone the repository:

```bash
git clone https://github.com/KOPE-SOLUTION/cybersecurity-attack-understand-defend.git
```

Enter the repository:

```bash
cd cybersecurity-attack-understand-defend
```

Select a lab:

```bash
cd 01-reverse-tabnabbing
```

Read the lab documentation:

```text
README.md
```

Each lab contains its own setup instructions, architecture explanation, security scenario, mitigation, and validation process.

---

## Important Security Note

Do not expose intentionally vulnerable labs directly to the public internet.

Recommended environments include:

```text
localhost
```

or isolated environments such as:

```text
Virtual Machine
Docker Network
Private Lab Network
Dedicated Test Device
```

Always verify the environment before running a security experiment.

---

## Learning Content

This repository is developed alongside cybersecurity learning content from **KOPE SOLUTION**.

The content focuses on practical engineering experiments involving:

* Cybersecurity
* Web Security
* IoT Security
* Embedded Systems
* Industrial IoT
* Linux
* Networking
* Software Engineering

The objective is to connect security concepts with real engineering systems.

---

## Contributions

Issues, technical discussions, documentation improvements, and defensive security suggestions are welcome.

When contributing a security lab:

* Use controlled environments
* Use dummy data
* Avoid real credentials
* Avoid targeting third-party systems
* Clearly document the security impact
* Include mitigation techniques
* Include a validation or retest process

---

## License

This project is provided for educational and authorized security research purposes.

Check the repository license before using the source code in other projects.

---

## KOPE SOLUTION

**Cybersecurity • IoT • Embedded Systems • Industrial IoT • Software Engineering**

> Build it. Break the lab. Understand it. Defend it.
