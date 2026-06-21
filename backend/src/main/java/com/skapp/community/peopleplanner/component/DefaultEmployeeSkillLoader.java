package com.skapp.community.peopleplanner.component;

import com.skapp.enterprise.common.util.YamlReader;
import jakarta.annotation.PostConstruct;
import lombok.Data;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Component
public class DefaultEmployeeSkillLoader {

	private Map<Long, DefaultEmployeeSkill> defaultEmployeeSkillsById = new HashMap<>();

	@PostConstruct
	public void init() {
		loadSkills();
	}

	private void loadSkills() {
		try {
			EmployeeSkillsData data = YamlReader.read("community/common/skills.yml", EmployeeSkillsData.class);
			if (data.getSkills() != null) {
				Map<Long, DefaultEmployeeSkill> map = HashMap.newHashMap(data.getSkills().size());
				for (DefaultEmployeeSkill skill : data.getSkills()) {
					map.put(skill.getId(), skill);
				}
				defaultEmployeeSkillsById = map;
			}
		}
		catch (Exception e) {
			defaultEmployeeSkillsById = Collections.emptyMap();
		}
	}

	public Optional<DefaultEmployeeSkill> findById(Long id) {
		return Optional.ofNullable(defaultEmployeeSkillsById.get(id));
	}

	@Data
	public static class EmployeeSkillsData {

		private List<DefaultEmployeeSkill> skills;

	}

	@Data
	public static class DefaultEmployeeSkill {

		private Long id;

		private String name;

	}

}
