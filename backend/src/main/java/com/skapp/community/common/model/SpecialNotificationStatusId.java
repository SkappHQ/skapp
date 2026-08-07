package com.skapp.community.common.model;

import com.skapp.community.common.type.SpecialNotificationType;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.io.Serializable;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
public class SpecialNotificationStatusId implements Serializable {

	private Long employee;

	private SpecialNotificationType specialNotificationType;

}
