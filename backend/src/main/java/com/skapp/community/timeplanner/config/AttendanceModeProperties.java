package com.skapp.community.timeplanner.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

import java.util.ArrayList;
import java.util.List;

@Setter
@Getter
@Configuration
@ConfigurationProperties(prefix = "attendance.clock-in-out-only")
public class AttendanceModeProperties {

	private boolean enabled;

	private List<String> tenants = new ArrayList<>();

}
