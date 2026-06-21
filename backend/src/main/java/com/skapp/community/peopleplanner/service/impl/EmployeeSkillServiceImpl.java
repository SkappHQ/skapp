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
import java.util.Optional;
import java.util.function.Function;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmployeeSkillServiceImpl implements EmployeeSkillService {

	private static final String SKILLS_YAML_PATH = "community/common/skills.yml";

	private final CustomEmployeeSkillDao customEmployeeSkillDao;

	private final EmployeeSkillDao employeeSkillDao;

	private Map<Long, String> defaultEmployeeSkillNames;

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
				CustomEmployeeSkill customSkill = findOrCreateCustomSkill(skillDto.getName());
				employeeSkill.setSkillId(customSkill.getId());
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
	public List<EmployeeSkillResponseDto> getEmployeeSkillResponses(Long employeeId) {
		log.info("getEmployeeSkillResponses: execution started");

		List<EmployeeSkill> employeeSkills = employeeSkillDao.findByEmployeeEmployeeId(employeeId);

		List<Long> customSkillIds = employeeSkills.stream()
			.filter(es -> es.getSkillType() == EmployeeSkillType.CUSTOM)
			.map(EmployeeSkill::getSkillId)
			.toList();

		Map<Long, CustomEmployeeSkill> customSkillMap = customEmployeeSkillDao.findAllById(customSkillIds)
			.stream()
			.collect(Collectors.toMap(CustomEmployeeSkill::getId, Function.identity()));

		return employeeSkills.stream().map(es -> mapToEmployeeSkillResponseDto(es, customSkillMap)).toList();
	}

	@Override
	public ResponseEntityDto getAllSkills() {
		log.info("getAllSkills: execution started");

		List<EmployeeSkillResponseDto> customSkills = customEmployeeSkillDao.findAll()
			.stream()
			.map(s -> new EmployeeSkillResponseDto(s.getId(), s.getName(), EmployeeSkillType.CUSTOM))
			.toList();

		return new ResponseEntityDto(false, customSkills);
	}

	private EmployeeSkillResponseDto mapToEmployeeSkillResponseDto(EmployeeSkill es,
			Map<Long, CustomEmployeeSkill> customSkillMap) {
		if (es.getSkillType() == EmployeeSkillType.DEFAULT) {
			String skillName = getDefaultEmployeeSkillName(es.getSkillId());
			return new EmployeeSkillResponseDto(es.getSkillId(), skillName, EmployeeSkillType.DEFAULT);
		}

		CustomEmployeeSkill customSkill = customSkillMap.get(es.getSkillId());

		if (customSkill == null) {
			throw new ModuleException(PeopleMessageConstant.PEOPLE_ERROR_SKILL_NOT_FOUND);
		}

		return new EmployeeSkillResponseDto(es.getSkillId(), customSkill.getName(), EmployeeSkillType.CUSTOM);
	}

	private String getDefaultEmployeeSkillName(Long id) {
		if (defaultEmployeeSkillNames == null) {
			DefaultEmployeeSkillsYaml data = YamlReader.read(SKILLS_YAML_PATH, DefaultEmployeeSkillsYaml.class);
			defaultEmployeeSkillNames = data.getSkills()
				.stream()
				.collect(Collectors.toMap(DefaultEmployeeSkill::getId, DefaultEmployeeSkill::getName));
		}

		String name = defaultEmployeeSkillNames.get(id);

		if (name == null) {
			throw new ModuleException(PeopleMessageConstant.PEOPLE_ERROR_SKILL_NOT_FOUND);
		}

		return name;
	}

	private CustomEmployeeSkill findOrCreateCustomSkill(String name) {
		Optional<CustomEmployeeSkill> existing = customEmployeeSkillDao.findByNameIgnoreCase(name);

		if (existing.isPresent()) {
			return existing.get();
		}

		CustomEmployeeSkill customSkill = new CustomEmployeeSkill();
		customSkill.setName(name);

		return customEmployeeSkillDao.save(customSkill);
	}

}
