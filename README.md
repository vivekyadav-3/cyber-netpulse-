# ⚡ NetPulse — Real-Time Cyber Network Intelligence & Telemetry

[![React](https://img.shields.io/badge/Frontend-React%2018%20%2B%20Vite-61dafb?style=for-the-badge&logo=react)](https://reactjs.org/)
[![Spring Boot](https://img.shields.io/badge/Backend-Spring%20Boot%203-6db33f?style=for-the-badge&logo=springboot)](https://spring.io/projects/spring-boot)
[![Java](https://img.shields.io/badge/Language-Java%2017%2B-ed8b00?style=for-the-badge&logo=openjdk)](https://openjdk.org/)
[![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)

**NetPulse** is a full-stack, real-time network intelligence and diagnostic platform designed with a modern cyber dark glassmorphism aesthetic. It bridges OS-level networking primitives (ICMP, raw sockets, route tables, DNS resolution) with an ultra-responsive web dashboard.

---

## ✨ Features & Architecture

### 📊 1. Network Dashboard
- **Real-Time Telemetry**: Auto-refreshes latency and connection metrics every 15 seconds.
- **Latency History Timeline**: Multi-series area chart tracking Min, Avg, and Max RTT trends.
- **Socket Distribution Breakdown**: Interactive donut chart visualizing TCP vs UDP protocol splits and socket states.
- **Ping Health Gauge**: Radial rating meter indicating live network quality (LAN, Regional, Cross-Continent).

### 📡 2. Ping Monitor
- **ICMP Latency Measurement**: Precision tracking of Round-Trip Time (RTT) and packet loss percentages.
- **Quality Meter**: Visual rating bar benchmarks against LAN (<20ms), Edge (<60ms), and WAN thresholds.
- **Terminal Replay**: Collapsible raw terminal log view with one-click clipboard copy.

### 🗺️ 3. Traceroute Visualizer
- **Hop-by-Hop Topology**: Live discovery of routing paths from the local machine to any target host.
- **Multi-Probe RTT**: Displays 3 distinct latency probes per hop with color-coded response badges and timeout indicators.
- **Presets & Guides**: Quick targets (Cloudflare, Google, GitHub, AWS) and TTL mechanics overview.

### 🌐 4. DNS Analyzer
- **Dual-Stack Resolution**: Automatic breakdown of IPv4 (`A`) and IPv6 (`AAAA`) addresses.
- **CNAME & Timing**: Identifies canonical hostnames and benchmarks query resolution speeds in milliseconds.
- **One-Click Copy**: Instant clipboard copying for any resolved IP address.

### 🔌 5. Active Connections Inspector
- **OS Kernel Inspection**: Directly parses live TCP/UDP socket tables via `netstat -ano`.
- **Interactive Filtering**: Search by IP, Port, State, or PID; instant protocol tabs (`All`, `TCP`, `UDP`); and state filters (`ESTABLISHED`, `LISTENING`, `TIME_WAIT`).

---

## 🚀 Quick Start

### Prerequisites
- **Java 17+**
- **Node.js 18+** & `npm`
- **Maven** (or included Maven wrapper)

### 1. Start Backend (Spring Boot)
```bash
cd backened
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
