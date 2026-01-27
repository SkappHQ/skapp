package com.skapp.enterprise.ai.model;

import com.skapp.community.common.model.Auditable;
import com.skapp.community.common.model.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Entity
@Getter
@Setter
@Table(name = "ai_tokens")
public class AIToken extends Auditable<String> {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "id")
	private Long id;

	@OneToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "user_id", nullable = false, unique = true)
	private User user;

	@Column(name = "chatbot_daily_usage", nullable = false)
	private Long chatbotDailyUsage = 0L;

	@Column(name = "chatbot_tokens_last_updated_at")
	private Instant chatbotTokensLastUpdatedAt;

}
