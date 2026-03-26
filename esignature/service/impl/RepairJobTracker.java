package com.skapp.enterprise.esignature.service.impl;

import com.skapp.enterprise.esignature.payload.response.DocumentHashRepairResponseDto;
import com.skapp.enterprise.esignature.payload.response.RepairJobDto;
import com.skapp.enterprise.esignature.type.RepairJobStatus;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Component
public class RepairJobTracker {

	private static final long JOB_TTL_MILLIS = 60 * 60 * 1000L; // 1 hour

	private final ConcurrentHashMap<String, RepairJobDto> jobs = new ConcurrentHashMap<>();

	public RepairJobDto createJob() {
		RepairJobDto job = new RepairJobDto();
		job.setJobId(UUID.randomUUID().toString());
		job.setStatus(RepairJobStatus.PENDING);
		job.setCreatedAt(Instant.now());
		job.setUpdatedAt(Instant.now());
		jobs.put(job.getJobId(), job);
		log.info("[RepairJobTracker] Created job {}", job.getJobId());
		return job;
	}

	public RepairJobDto getJob(String jobId) {
		return jobs.get(jobId);
	}

	public void markRunning(String jobId) {
		RepairJobDto job = jobs.get(jobId);
		if (job != null) {
			job.setStatus(RepairJobStatus.RUNNING);
			job.setUpdatedAt(Instant.now());
		}
	}

	public void markCompleted(String jobId, DocumentHashRepairResponseDto result) {
		RepairJobDto job = jobs.get(jobId);
		if (job != null) {
			job.setStatus(RepairJobStatus.COMPLETED);
			job.setResult(result);
			job.setUpdatedAt(Instant.now());
		}
	}

	public void markFailed(String jobId, DocumentHashRepairResponseDto result) {
		RepairJobDto job = jobs.get(jobId);
		if (job != null) {
			job.setStatus(RepairJobStatus.FAILED);
			job.setResult(result);
			job.setUpdatedAt(Instant.now());
		}
	}

	/**
	 * Cleanup completed/failed jobs older than 1 hour to prevent memory leaks.
	 */
	@Scheduled(fixedDelay = 30 * 60 * 1000L) // every 30 minutes
	public void cleanupStaleJobs() {
		Instant cutoff = Instant.now().minusMillis(JOB_TTL_MILLIS);
		jobs.entrySet().removeIf(entry -> {
			RepairJobDto job = entry.getValue();
			boolean isTerminal = job.getStatus() == RepairJobStatus.COMPLETED
					|| job.getStatus() == RepairJobStatus.FAILED;
			boolean isOld = job.getUpdatedAt().isBefore(cutoff);
			if (isTerminal && isOld) {
				log.info("[RepairJobTracker] Evicting stale job {}", entry.getKey());
				return true;
			}
			return false;
		});
	}

}
