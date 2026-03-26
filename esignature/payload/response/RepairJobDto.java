package com.skapp.enterprise.esignature.payload.response;

import com.skapp.enterprise.esignature.type.RepairJobStatus;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
public class RepairJobDto {

	private String jobId;

	private RepairJobStatus status;

	private DocumentHashRepairResponseDto result;

	private Instant createdAt;

	private Instant updatedAt;

}
