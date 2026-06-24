package com.skapp.community.peopleplanner.service.impl;

import com.skapp.community.common.exception.ModuleException;
import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.common.util.YamlReader;
import com.skapp.community.peopleplanner.constant.PeopleMessageConstant;
import com.skapp.community.peopleplanner.model.CustomEmployeeSkill;
import com.skapp.community.peopleplanner.payload.employeeskill.DefaultEmployeeSkill;
import com.skapp.community.peopleplanner.payload.employeeskill.DefaultEmployeeSkillsYaml;
import com.skapp.community.peopleplanner.payload.request.CustomSkillRequestDto;
import com.skapp.community.peopleplanner.payload.response.EmployeeSkillResponseDto;
import com.skapp.community.peopleplanner.repository.CustomEmployeeSkillDao;
import com.skapp.community.peopleplanner.repository.EmployeeSkillDao;
import com.skapp.community.peopleplanner.service.EmployeeSkillService;
import com.skapp.community.peopleplanner.type.EmployeeSkillType;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmployeeSkillServiceImpl implements EmployeeSkillService {

	private static final String SKILLS_YAML_PATH = "community/common/skills.yml";

	private final CustomEmployeeSkillDao customEmployeeSkillDao;

	private final EmployeeSkillDao employeeSkillDao;

	@Override
	@Transactional
	public ResponseEntityDto saveCustomSkills(CustomSkillRequestDto customSkillRequestDto) {
		log.info("saveCustomSkills: execution started");

		if (customSkillRequestDto.getSkills() == null || customSkillRequestDto.getSkills().isEmpty()) {
			return new ResponseEntityDto(false, List.of());
		}

		List<EmployeeSkillResponseDto> savedSkills = customSkillRequestDto.getSkills().stream().map(skillDto -> {
			CustomEmployeeSkill customSkill = customEmployeeSkillDao.findByNameIgnoreCase(skillDto.getName())
				.orElseGet(() -> {
					CustomEmployeeSkill newSkill = new CustomEmployeeSkill();
					newSkill.setName(skillDto.getName());
					return customEmployeeSkillDao.save(newSkill);
				});

			return new EmployeeSkillResponseDto(customSkill.getId(), customSkill.getName(), EmployeeSkillType.CUSTOM);
		}).toList();

		return new ResponseEntityDto(false, savedSkills);
	}

	@Override
	public List<EmployeeSkillResponseDto> getEmployeeSkills(Long employeeId) {
		log.info("getEmployeeSkills: execution started");

		return employeeSkillDao.getEmployeeSkills(employeeId)
			.stream()
			.map(this::mapToEmployeeSkillResponseDto)
			.toList();
	}

	@Override
	public ResponseEntityDto getAllCustomSkills() {
		log.info("getAllCustomSkills: execution started");

		List<EmployeeSkillResponseDto> customSkills = customEmployeeSkillDao.findAll()
			.stream()
			.map(s -> new EmployeeSkillResponseDto(s.getId(), s.getName(), EmployeeSkillType.CUSTOM))
			.toList();

		return new ResponseEntityDto(false, customSkills);
	}

	private EmployeeSkillResponseDto mapToEmployeeSkillResponseDto(EmployeeSkillResponseDto skill) {
		if (skill.getSkillType() == EmployeeSkillType.DEFAULT) {
			skill.setName(getDefaultEmployeeSkillName(skill.getId()));
			return skill;
		}

		if (skill.getName() == null) {
			throw new ModuleException(PeopleMessageConstant.PEOPLE_ERROR_SKILL_NOT_FOUND);
		}

		return skill;
	}

	private String getDefaultEmployeeSkillName(Long id) {
		DefaultEmployeeSkillsYaml data = YamlReader.read(SKILLS_YAML_PATH, DefaultEmployeeSkillsYaml.class);
		Map<Long, String> defaultEmployeeSkillNames = data.getDefaultSkills()
			.stream()
			.collect(Collectors.toMap(DefaultEmployeeSkill::getId, DefaultEmployeeSkill::getName));

		String name = defaultEmployeeSkillNames.get(id);

		if (name == null) {
			throw new ModuleException(PeopleMessageConstant.PEOPLE_ERROR_SKILL_NOT_FOUND);
		}

		return name;
	}

}
