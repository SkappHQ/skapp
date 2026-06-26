package com.skapp.community.peopleplanner.model;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.io.Serializable;
import java.util.Objects;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class JobFamilyTitleId implements Serializable {

	private Long jobFamily;

	private Long jobTitle;

	@Override
	public boolean equals(Object object) {
		if (this == object)
			return true;
		if (!(object instanceof JobFamilyTitleId that))
			return false;
		return Objects.equals(getJobFamily(), that.getJobFamily()) && Objects.equals(getJobTitle(), that.getJobTitle());
	}

	@Override
	public int hashCode() {
		return Objects.hash(getJobFamily(), getJobTitle());
	}

}
