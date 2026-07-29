package com.skapp.community.common.model;

import com.skapp.community.common.type.SpecialNotificationType;
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
public class SpecialNotificationId implements Serializable {

	private Long employee;

	private SpecialNotificationType specialNotificationType;

	@Override
	public boolean equals(Object object) {
		if (this == object)
			return true;
		if (!(object instanceof SpecialNotificationId that))
			return false;
		return Objects.equals(getEmployee(), that.getEmployee())
				&& getSpecialNotificationType() == that.getSpecialNotificationType();
	}

	@Override
	public int hashCode() {
		return Objects.hash(getEmployee(), getSpecialNotificationType());
	}

}
