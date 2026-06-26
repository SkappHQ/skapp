package com.skapp.community.peopleplanner.payload.request;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class JobFamilyDto {

	private String name;

	private List<String> titles;

}
