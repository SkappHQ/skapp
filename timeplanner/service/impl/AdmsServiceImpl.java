package com.skapp.enterprise.timeplanner.service.impl;

import com.skapp.enterprise.common.config.TenantContext;
import com.skapp.enterprise.timeplanner.enums.AdmsResponse;
import com.skapp.enterprise.timeplanner.enums.AdmsTableType;
import com.skapp.enterprise.timeplanner.model.AdmsAttendanceLog;
import com.skapp.enterprise.timeplanner.model.AdmsDevice;
import com.skapp.enterprise.timeplanner.repository.AdmsAttendanceLogDao;
import com.skapp.enterprise.timeplanner.repository.AdmsDeviceDao;
import com.skapp.enterprise.timeplanner.service.AdmsService;
import com.skapp.enterprise.timeplanner.util.AdmsUtils;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class AdmsServiceImpl implements AdmsService {

	private final TenantContext tenantContext;

	private final AdmsDeviceDao admsDeviceDao;

	private final AdmsAttendanceLogDao admsAttendanceLogDao;

	@Override
	@Transactional
	public String handleHandshake(String tenantId, String serialNumber, HttpServletRequest request) {
		log.info("handleHandshake: execution started for SN={}", serialNumber);
		if (serialNumber == null || serialNumber.isBlank()) {
			return AdmsResponse.ERROR.getValue();
		}

		tenantContext.setTenantAndSwitchSchema(tenantId);

		AdmsDevice device = findOrCreateDevice(serialNumber, request);
		device.setLastOnlineAt(LocalDateTime.now());
		admsDeviceDao.save(device);

		long stamp = device.getAttStamp() != null ? device.getAttStamp() : Instant.now().getEpochSecond();
		long opStamp = device.getOpStamp() != null ? device.getOpStamp() : Instant.now().getEpochSecond();

		return buildOptionsResponse(serialNumber, stamp, opStamp);
	}

	@Override
	@Transactional
	public String receiveRecords(String tenantId, String serialNumber, String table, String stamp, String body,
			HttpServletRequest request) {
		log.info("receiveRecords: execution started for SN={}, table={}", serialNumber, table);
		if (serialNumber == null || serialNumber.isBlank()) {
			return AdmsResponse.ERROR.getValue();
		}

		tenantContext.setTenantAndSwitchSchema(tenantId);

		AdmsDevice device = findOrCreateDevice(serialNumber, request);
		device.setLastOnlineAt(LocalDateTime.now());

		if (AdmsTableType.ATTLOG.matches(table)) {
			int count = processAttendanceLogs(device, body, stamp);
			device.setLastSyncAt(LocalDateTime.now());
			admsDeviceDao.save(device);
			return AdmsResponse.OK.withCount(count);
		}

		if (AdmsTableType.OPERLOG.matches(table)) {
			log.info("Received OPERLOG from device SN={}: {}", serialNumber, body);
			if (stamp != null && !stamp.isBlank()) {
				Long parsedStamp = AdmsUtils.parseLong(stamp);
				if (parsedStamp != null) {
					device.setOpStamp(Math.max(device.getOpStamp() != null ? device.getOpStamp() : 0, parsedStamp));
				}
			}
			admsDeviceDao.save(device);
			return AdmsResponse.OK.getValue();
		}

		admsDeviceDao.save(device);
		return AdmsResponse.OK.getValue();
	}

	@Override
	@Transactional
	public String getRequest(String tenantId, String serialNumber) {
		log.info("getRequest: execution started for SN={}", serialNumber);
		if (serialNumber == null || serialNumber.isBlank()) {
			return AdmsResponse.ERROR.getValue();
		}

		tenantContext.setTenantAndSwitchSchema(tenantId);

		AdmsDevice device = admsDeviceDao.findBySerialNumber(serialNumber).orElse(null);
		if (device != null) {
			device.setLastOnlineAt(LocalDateTime.now());
			admsDeviceDao.save(device);
		}

		return AdmsResponse.OK.getValue();
	}

	private int processAttendanceLogs(AdmsDevice device, String body, String stamp) {
		if (body == null || body.isBlank()) {
			return 0;
		}

		int count = 0;
		for (String line : splitAttendanceLines(body)) {
			count += processAttendanceLine(device, line);
		}

		updateAttStamp(device, stamp);

		return count;
	}

	private String[] splitAttendanceLines(String body) {
		return body.split("\\r\\n|\\r|\\n");
	}

	private int processAttendanceLine(AdmsDevice device, String line) {
		if (line.isBlank() || !AdmsUtils.isValidAttLogLine(line)) {
			return 0;
		}

		String[] fields = line.split("\\t");
		LocalDateTime punchedAt = AdmsUtils.parseDateTime(fields[1].trim(), AdmsUtils.PUNCH_DATE_FORMAT);
		if (punchedAt == null) {
			return 0;
		}

		AdmsAttendanceLog attendanceLog = buildAttendanceLog(device, line, fields, punchedAt);
		admsAttendanceLogDao.save(attendanceLog);
		return 1;
	}

	private AdmsAttendanceLog buildAttendanceLog(AdmsDevice device, String line, String[] fields,
			LocalDateTime punchedAt) {
		AdmsAttendanceLog attendanceLog = new AdmsAttendanceLog();
		attendanceLog.setDevice(device);
		attendanceLog.setPin(fields[0].trim());
		attendanceLog.setPunchedAt(punchedAt);
		attendanceLog.setStatus(AdmsUtils.parseInteger(fields[2].trim()));
		attendanceLog.setVerifyType(AdmsUtils.parseInteger(fields[3].trim()));
		attendanceLog.setWorkCode(fields.length > 4 ? AdmsUtils.parseInteger(fields[4].trim()) : null);
		attendanceLog.setRawData(line);
		return attendanceLog;
	}

	private void updateAttStamp(AdmsDevice device, String stamp) {
		if (stamp == null || stamp.isBlank()) {
			return;
		}

		Long stampValue = AdmsUtils.parseLong(stamp);
		if (stampValue == null) {
			return;
		}

		device.setAttStamp(Math.max(device.getAttStamp() != null ? device.getAttStamp() : 0, stampValue));
	}

	private AdmsDevice findOrCreateDevice(String serialNumber, HttpServletRequest request) {
		AdmsDevice device = admsDeviceDao.findBySerialNumber(serialNumber).orElseGet(() -> {
			AdmsDevice newDevice = new AdmsDevice();
			newDevice.setSerialNumber(serialNumber);
			String deviceName = request.getHeader("DeviceName");
			newDevice.setName(deviceName != null && !deviceName.isBlank() ? deviceName : "Device " + serialNumber);
			newDevice.setAttStamp(0L);
			newDevice.setOpStamp(0L);
			return admsDeviceDao.save(newDevice);
		});
		device.setIpAddress(request.getRemoteAddr());
		return device;
	}

	private String buildOptionsResponse(String serialNumber, long stamp, long opStamp) {
		return String.join("\n", "GET OPTION FROM: " + serialNumber, "Stamp=" + stamp, "OpStamp=" + opStamp,
				AdmsUtils.DEFAULT_ERROR_DELAY, AdmsUtils.DEFAULT_DELAY, AdmsUtils.DEFAULT_TRANS_TIMES,
				AdmsUtils.DEFAULT_TRANS_INTERVAL, AdmsUtils.DEFAULT_TRANS_FLAG, AdmsUtils.DEFAULT_REALTIME,
				AdmsUtils.DEFAULT_ENCRYPT);
	}

}
