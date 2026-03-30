package com.skapp.enterprise.common.payload.response;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
public class AnnouncementPageResponseDto {

	private List<FeatureAnnouncementResponseDto> items;

	private int currentPage;

	private long totalItems;

	private int totalPages;

}
