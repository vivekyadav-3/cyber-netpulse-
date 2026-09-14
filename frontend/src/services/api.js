const BASE = '/api';

const get = (url) => fetch(BASE + url).then(r => r.json());

export const ping = (host, count = 4) =>
  get(`/ping?host=${encodeURIComponent(host)}&count=${count}`);

export const traceroute = (host, maxHops = 15) =>
  get(`/traceroute?host=${encodeURIComponent(host)}&maxHops=${maxHops}`);

export const dns = (host) =>
  get(`/dns?host=${encodeURIComponent(host)}`);

export const connections = (protocol = '', limit = 100) =>
  get(`/connections?protocol=${protocol}&limit=${limit}`);

export const connectionSummary = () =>
  get(`/connections/summary`);
