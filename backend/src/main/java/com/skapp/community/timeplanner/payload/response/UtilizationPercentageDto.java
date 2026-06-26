package com.skapp.community.timeplanner.payload.response;

public record UtilizationPercentageDto(double percentage, double lastThirtyDayChange) {
	public UtilizationPercentageDto(double percentage, double lastThirtyDayChange) {
		this.percentage = Double.isNaN(percentage) ? 0 : percentage;
		this.lastThirtyDayChange = Double.isNaN(lastThirtyDayChange) ? 0 : lastThirtyDayChange;
	}
}
