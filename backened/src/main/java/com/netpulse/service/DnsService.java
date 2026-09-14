package com.netpulse.service;

import com.netpulse.model.DnsResult;
import org.springframework.stereotype.Service;

import java.net.InetAddress;
import java.util.ArrayList;
import java.util.List;

@Service
public class DnsService {

    public DnsResult resolveDns(String host) {
        if (host == null || !host.matches("^[a-zA-Z0-9.-]+$")) {
            return DnsResult.builder()
                    .host(host)
                    .successful(false)
                    .errorMessage("Invalid host name format")
                    .build();
        }

        long startTime = System.currentTimeMillis();

        try {
            InetAddress[] addresses = InetAddress.getAllByName(host);
            long duration = System.currentTimeMillis() - startTime;

            List<String> ipList = new ArrayList<>();
            String canonicalName = "";

            for (InetAddress addr : addresses) {
                ipList.add(addr.getHostAddress());
                if (canonicalName.isEmpty()) {
                    canonicalName = addr.getCanonicalHostName();
                }
            }

            return DnsResult.builder()
                    .host(host)
                    .canonicalHostName(canonicalName)
                    .resolvedIps(ipList)
                    .resolutionTimeMs(duration)
                    .successful(true)
                    .build();

        } catch (Exception e) {
            long duration = System.currentTimeMillis() - startTime;
            return DnsResult.builder()
                    .host(host)
                    .resolutionTimeMs(duration)
                    .successful(false)
                    .errorMessage("Could not resolve host: " + e.getMessage())
                    .resolvedIps(List.of())
                    .build();
        }
    }
}
