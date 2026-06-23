package com.skapp.community.peopleplanner.service.impl;

import com.skapp.community.common.exception.ModuleException;
import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.peopleplanner.constant.PeopleMessageConstant;
import com.skapp.community.peopleplanner.model.CustomEmployeeSkill;
import com.skapp.community.peopleplanner.model.Employee;
import com.skapp.community.peopleplanner.model.EmployeeSkill;
import com.skapp.community.peopleplanner.payload.employeeskill.DefaultEmployeeSkill;
import com.skapp.community.peopleplanner.payload.employeeskill.DefaultEmployeeSkillsYaml;
import com.skapp.community.peopleplanner.payload.request.EmployeeSkillDto;
import com.skapp.community.peopleplanner.payload.response.EmployeeSkillResponseDto;
import com.skapp.community.peopleplanner.repository.CustomEmployeeSkillDao;
import com.skapp.community.peopleplanner.repository.EmployeeSkillDao;
import com.skapp.community.peopleplanner.service.EmployeeSkillService;
import com.skapp.community.peopleplanner.type.EmployeeSkillType;
import com.skapp.enterprise.common.util.YamlReader;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
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
	public List<EmployeeSkill> saveEmployeeSkills(Employee employee, List<EmployeeSkillDto> skills) {
		log.info("saveEmployeeSkills: execution started");

		employeeSkillDao.deleteByEmployeeEmployeeId(employee.getEmployeeId());

		if (skills == null || skills.isEmpty()) {
			return new ArrayList<>();
		}

		List<EmployeeSkill> employeeSkills = new ArrayList<>();

		for (EmployeeSkillDto skillDto : skills) {
			EmployeeSkill employeeSkill = new EmployeeSkill();
			employeeSkill.setEmployee(employee);

			if (skillDto.getSkillType() == EmployeeSkillType.DEFAULT) {
				getDefaultEmployeeSkillName(skillDto.getSkillId());
				employeeSkill.setSkillId(skillDto.getSkillId());
				employeeSkill.setSkillType(EmployeeSkillType.DEFAULT);
			}
			else if (skillDto.getSkillType() == EmployeeSkillType.CUSTOM) {
				if (skillDto.getName() == null || skillDto.getName().isBlank()) {
					throw new ModuleException(PeopleMessageConstant.PEOPLE_ERROR_SKILL_NOT_FOUND);
				}

				if (customEmployeeSkillDao.findByNameIgnoreCase(skillDto.getName()).isPresent()) {
					throw new ModuleException(PeopleMessageConstant.PEOPLE_ERROR_SKILL_ALREADY_EXISTS);
				}

				CustomEmployeeSkill customSkill = new CustomEmployeeSkill();
				
				customSkill.setName(skillDto.getName());
				employeeSkill.setSkillId(customEmployeeSkillDao.save(customSkill).getId());
				employeeSkill.setSkillType(EmployeeSkillType.CUSTOM);
			}
			else {
				throw new ModuleException(PeopleMessageConstant.PEOPLE_ERROR_SKILL_NOT_FOUND);
			}

			employeeSkills.add(employeeSkill);
		}

		return employeeSkillDao.saveAll(employeeSkills);
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
