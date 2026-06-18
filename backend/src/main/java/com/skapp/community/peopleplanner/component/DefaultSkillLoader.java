package com.skapp.community.peopleplanner.component;

import jakarta.annotation.PostConstruct;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;
import org.yaml.snakeyaml.Yaml;

import java.io.InputStream;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Component
public class DefaultSkillLoader {

	private Map<Long, DefaultSkill> defaultSkillsById = new HashMap<>();

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
					Map<Long, DefaultSkill> map = HashMap.newHashMap(skillsList.size());
					for (Map<String, Object> entry : skillsList) {
						Long id = ((Number) entry.get("id")).longValue();
						String name = (String) entry.get("name");
						map.put(id, new DefaultSkill(id, name));
					}
					defaultSkillsById = map;
				}
			}
		}
		catch (Exception e) {
			defaultSkillsById = Collections.emptyMap();
		}
	}

	public Optional<DefaultSkill> findById(Long id) {
		return Optional.ofNullable(defaultSkillsById.get(id));
	}

	public record DefaultSkill(Long id, String name) {
	}

}
