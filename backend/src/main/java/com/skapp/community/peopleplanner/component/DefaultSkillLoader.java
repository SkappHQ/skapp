package com.skapp.community.peopleplanner.component;

import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;
import org.yaml.snakeyaml.Yaml;

import java.io.InputStream;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Slf4j
@Component
public class DefaultSkillLoader {

	private List<DefaultSkill> defaultSkills = new ArrayList<>();

	@PostConstruct
	public void init() {
		loadSkills();
	}

	private void loadSkills() {
		try {
			ClassPathResource resource = new ClassPathResource("community/common/skills.yml");
			try (InputStream inputStream = resource.getInputStream()) {
				Yaml yaml = new Yaml();
				Map<String, List<Map<String, Object>>> data = yaml.load(inputStream);
				List<Map<String, Object>> skillsList = data.get("skills");
				if (skillsList != null) {
					defaultSkills = skillsList.stream()
						.map(entry -> new DefaultSkill(((Number) entry.get("id")).longValue(),
								(String) entry.get("name")))
						.collect(Collectors.toList());
				}
			}
			log.info("Loaded default skills from skills.yml");
		}
		catch (Exception e) {
			log.error("Failed to load default skills from skills.yml", e);
			defaultSkills = Collections.emptyList();
		}
	}

	public Optional<DefaultSkill> findById(Long id) {
		return defaultSkills.stream().filter(skill -> skill.id().equals(id)).findFirst();
	}

	public record DefaultSkill(Long id, String name) {
	}

}
