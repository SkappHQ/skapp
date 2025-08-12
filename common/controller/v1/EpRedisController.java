// package com.skapp.enterprise.common.controller.v1;
//
// import com.skapp.community.common.payload.response.ResponseEntityDto;
// import com.skapp.enterprise.common.service.EpRedisService;
// import lombok.RequiredArgsConstructor;
// import org.springframework.http.HttpStatus;
// import org.springframework.http.ResponseEntity;
// import org.springframework.web.bind.annotation.GetMapping;
// import org.springframework.web.bind.annotation.RequestMapping;
// import org.springframework.web.bind.annotation.RestController;
//
// @RestController
// @RequiredArgsConstructor
// @RequestMapping("/v1/ep/redis")
// public class EpRedisController {
//
// private final EpRedisService epRedisService;
//
// @GetMapping("/load-system-version")
// public ResponseEntity<ResponseEntityDto> loadSystemVersion() {
// ResponseEntityDto response = epRedisService.loadSystemVersionToRedis();
// return new ResponseEntity<>(response, HttpStatus.OK);
// }
//
// @GetMapping("/load-all-user-versions")
// public ResponseEntity<ResponseEntityDto> loadAllUserVersions() {
// ResponseEntityDto response = epRedisService.loadAllUserVersionsToRedis();
// return new ResponseEntity<>(response, HttpStatus.OK);
// }
//
// @GetMapping("/load-all-users")
// public ResponseEntity<ResponseEntityDto> loadAllUserData() {
// ResponseEntityDto response = epRedisService.loadAllUserDataToRedis();
// return new ResponseEntity<>(response, HttpStatus.OK);
// }
//
// }
