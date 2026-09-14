# ⚡ NetPulse — Real-Time Cyber Network Intelligence & Telemetry

[![React](https://img.shields.io/badge/Frontend-React%2018%20%2B%20Vite-61dafb?style=for-the-badge&logo=react)](https://reactjs.org/)
[![Spring Boot](https://img.shields.io/badge/Backend-Spring%20Boot%203-6db33f?style=for-the-badge&logo=springboot)](https://spring.io/projects/spring-boot)
[![Java](https://img.shields.io/badge/Language-Java%2017%2B-ed8b00?style=for-the-badge&logo=openjdk)](https://openjdk.org/)
[![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)

**NetPulse** is a full-stack, real-time network intelligence and diagnostic platform designed with a modern cyber dark glassmorphism aesthetic. It bridges OS-level networking primitives (ICMP, raw sockets, route tables, DNS resolution) with an ultra-responsive web dashboard.

<p align="center">
  <img src="docs/screenshots/dashboard.png" alt="NetPulse Network Dashboard" width="100%" />
</p>

---

## ✨ Features & Architecture

### 📊 1. Network Dashboard
- **Real-Time Telemetry**: Auto-refreshes latency and connection metrics every 15 seconds.
- **Latency History Timeline**: Multi-series area chart tracking Min, Avg, and Max RTT trends.
- **Socket Distribution Breakdown**: Interactive donut chart visualizing TCP vs UDP protocol splits and socket states.
- **Ping Health Gauge**: Radial rating meter indicating live network quality (LAN, Regional, Cross-Continent).

### 📡 2. Ping Monitor & ICMP Packet Inspector (RFC 792 / RFC 4443)
- **True RFC Packet Anatomy**: Disassembles every probe into exact ICMP header datagram fields:
  - **Request**: Type `8` (`128` IPv6), Code `0`, Sequence Number, 32-byte Payload, and PID-keyed Identifier.
  - **Checksum Verification (RFC 1071)**: Implements true 16-bit One's Complement Checksum computation across the header and payload buffer.
  - **Reply**: Type `0` (`129` IPv6), Code `0`, Sequence Number, decremented IP TTL, and calculated Round-Trip Time (RTT).
- **Interactive Probe Inspector**: Click between probe tabs (`Probe #1`, `Probe #2`, etc.) to inspect packet headers independently.
- **Packet Transmission Pipeline**: Interactive lifecycle diagram tracing `Local NIC` $\to$ `DNS` $\to$ `Outbound Request` $\to$ `Transit Router TTL Decrement` $\to$ `Target NIC` $\to$ `Inbound Reply`.

### 📦 3. Packet Encapsulation Hierarchy (OSI & TCP/IP 5-Layer Stack)
- **Layer 2 (Data Link)**: IEEE 802.3 / Ethernet II Frame inspection (Preamble, Source/Destination MAC, EtherType `0x0800` IPv4 / `0x86DD` IPv6, Hardware CRC-32/FCS).
- **Layer 3 (Network)**: IPv4 Header (RFC 791, 20 Bytes) / IPv6 Header (RFC 8200, 40 Bytes), Protocol `0x01` (ICMP), TTL/Hop Limit, Source/Destination IPs.
- **Layer 4 (Transport / Internet Control)**: ICMP Datagram (RFC 792, 8 Bytes) with RFC 1071 verified checksum and session ID.
- **Layer 7 (Application / Payload)**: 32-byte standard ASCII payload buffer sequence (`abcdefghijklmnopqrstuvw...`).

### 🗺️ 4. Traceroute Visualizer & TTL Hop Mechanics Inspector
- **Interactive TTL Simulation**: Step-through visualizer showing how intermediate routers decrement the IP header TTL field (`TTL = 1, 2, ... N`).
- **RFC 792 Error Generation**: Explains why routers discard datagrams at `TTL = 0` and return an **ICMP Type 11 (Time Exceeded in Transit, Code 0)** packet to discover the network topology.
- **Destination Verification**: Identifies the terminal hop where the target host returns an **ICMP Type 0 (Echo Reply)**.
- **Multi-Probe Diagnostics**: Measures probe round-trip times per hop with timeout handling for silent routers.

### 🌐 5. DNS Resolution Hierarchy & Analyzer (RFC 1035)
- **Interactive Resolution Hierarchy**: Traces the recursive vs. iterative DNS resolution path:
  `Client Stub Resolver` $\to$ `Local Recursive Resolver (e.g. 8.8.8.8)` $\to$ `Root Nameserver (.)` $\to$ `TLD Nameserver (.com)` $\to$ `Authoritative Nameserver`.
- **RFC 1035 Header Flags Breakdown**: Visualizes core DNS bitfields including `QR` (Query/Response), `OPCODE` (Standard Query), `AA` (Authoritative Answer), `TC` (Truncation), `RD` (Recursion Desired), `RA` (Recursion Available), and `RCODE` (Return Code).
- **Dual-Stack Resolution**: Automatic breakdown of IPv4 (`A`) and IPv6 (`AAAA`) addresses with benchmarked resolution latency in milliseconds.

### 🔄 6. Active Connections & TCP Finite State Machine (RFC 793)
- **Interactive TCP State Machine**: Visualizes the connection lifecycle (`LISTEN`, `SYN_SENT`, `ESTABLISHED`, `CLOSE_WAIT`, `TIME_WAIT`) with detailed packet control flags (SYN, ACK, FIN, 2×MSL timer).
- **Interactive Kernel Socket Filtering**: Click any state node to isolate matching sockets directly from the host operating system kernel table (`netstat -ano`).
- **Live Search & Protocol Tabs**: Instant filtering by IP, Port, State, or PID across active TCP and UDP streams.

---

## 🚀 Quick Start

### Prerequisites
- **Java 17+**
- **Node.js 18+** & `npm`
- **Maven** (or included Maven wrapper)

### 1. Start Backend (Spring Boot)
```bash
cd backend
mvn clean spring-boot:run
```
*Backend runs at `http://localhost:8080`.*

### 2. Start Frontend (React + Vite)
```bash
cd frontend
npm install
npm run dev
```
*Frontend runs at `http://localhost:5173`.*

---

## 🔍 Under the Hood: Engineering & Protocol Architecture

NetPulse is built to teach and inspect **how computer networks actually function**:

### 1. ICMP RFC 792 / RFC 4443 Implementation Reality
- **The Kernel Boundary**: Standard user-space Java sockets (`java.net.Socket`, `DatagramSocket`) operate at Layer 4 (Transport) and do not have raw packet access (`SOCK_RAW`, `IPPROTO_ICMP`) without administrative kernel privileges or native WinPcap/Npcap C bindings.
- **OS Subsystem Integration**: NetPulse leverages the host OS's native ICMP subsystem (`IcmpSendEcho` in Windows / kernel ICMP), captures the raw stream, and reconstructs the full RFC 792 (IPv4) & RFC 4443 (IPv6) datagram structure.
- **Checksum Calculation (RFC 1071)**: NetPulse computes the true 16-bit One's Complement Checksum across the ICMP Type, Code, PID Identifier, Sequence Number, and 32-byte payload buffer.

### 2. Traceroute TTL Expiration Mechanics
- **The Routing Loop Safeguard**: Every IP packet contains an 8-bit Time-To-Live (TTL) header field. Each intermediate router decrements this value by 1.
- **Topology Discovery via ICMP Type 11**: When $TTL = 0$, intermediate routers discard the datagram and send an `ICMP Type 11 (Time-to-Live Exceeded in Transit, Code 0)` error back to our machine. NetPulse traces these reflected error datagrams to reconstruct the hop-by-hop topology until the destination returns an `ICMP Type 0 (Echo Reply)`.

### 3. Live Socket Introspection
- Directly reads the active OS kernel socket table via system introspection (`netstat -ano`), mapping local and remote addresses, ephemeral ports, process IDs (PID), and TCP connection states (`ESTABLISHED`, `LISTENING`, `TIME_WAIT`, `CLOSE_WAIT`).

---

---

## 📡 REST API Reference

| Method | Endpoint | Query Params | Description |
|---|---|---|---|
| `GET` | `/api/ping` | `host`, `count` | Runs ICMP ping against target host |
| `GET` | `/api/traceroute` | `host`, `maxHops` | Traces route hops to destination |
| `GET` | `/api/dns` | `host` | Resolves IPv4/IPv6 and canonical name |
| `GET` | `/api/connections` | `protocol`, `limit` | Returns live OS socket table |
| `GET` | `/api/connections/summary` | — | Socket counts, states, and protocol aggregates |

---

## 🎨 Design System
- **Theme**: Cyber Dark Glassmorphism
- **Typography**: Inter (UI) & JetBrains Mono (Telemetry/Metrics)
- **Charts**: Recharts with customized linear gradients and tooltips
- **Icons**: Lucide React

---

## 📄 License
This project is licensed under the MIT License.
