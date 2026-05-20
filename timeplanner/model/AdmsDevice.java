package com.skapp.enterprise.timeplanner.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@Table(name = "adms_device")
public class AdmsDevice {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "id", updatable = false)
	private Long id;

	@Column(name = "serial_number", nullable = false, unique = true)
	private String serialNumber;

	@Column(name = "name")
	private String name;

	@Column(name = "ip_address")
	private String ipAddress;

	@Column(name = "push_version")
	private String pushVersion;

	@Column(name = "device_type")
	private String deviceType;

	@Column(name = "firmware_version")
	private String firmwareVersion;

	@Column(name = "att_stamp")
	private Long attStamp;

	@Column(name = "op_stamp")
	private Long opStamp;

	@Column(name = "last_online_at")
	private LocalDateTime lastOnlineAt;

	@Column(name = "last_sync_at")
	private LocalDateTime lastSyncAt;

	@CreationTimestamp
	@Column(name = "created_at", updatable = false)
	private LocalDateTime createdAt;

}
