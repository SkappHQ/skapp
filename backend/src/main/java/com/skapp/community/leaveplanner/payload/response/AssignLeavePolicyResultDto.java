package com.skapp.community.leaveplanner.payload.response;

import com.skapp.community.common.payload.response.ResponseEntityDto;

/**
 * Result of an assign-leave-policy call. {@code created} is {@code true} when a new
 * assignment was persisted and {@code false} for the idempotent no-op (identical
 * re-assign), so the controller can return 201 vs 200 accordingly.
 */
public record AssignLeavePolicyResultDto(boolean created, ResponseEntityDto response) {
}
