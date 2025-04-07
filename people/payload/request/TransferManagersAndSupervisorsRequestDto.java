package com.skapp.enterprise.people.payload.request;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class TransferManagersAndSupervisorsRequestDto {

	private List<TransferSupervisorsRequestDto> supervisors;

	private List<TransferManagersRequestDto> managers;

}
