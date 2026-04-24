package com.skapp.enterprise.pm.model;

import com.skapp.community.common.model.Auditable;
import com.skapp.community.peopleplanner.model.Employee;
import com.skapp.enterprise.common.util.LongListConverter;
import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Getter
@Setter
@NoArgsConstructor
@Table(name = "guest_user_requests")
public class GuestUserRequest extends Auditable<String> {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "id", updatable = false)
	private Long id;

	@Column(name = "email", nullable = false)
	private String email;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "requested_user_id", nullable = false)
	private Employee requestedUser;

	@Column(name = "requested_date", nullable = false)
	private LocalDateTime requestedDate;

	@Column(name = "project_ids", columnDefinition = "text")
	@Convert(converter = LongListConverter.class)
	private List<Long> projectIds;

}
