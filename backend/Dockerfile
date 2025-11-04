FROM openjdk:21-ea-21-jdk-slim
WORKDIR /app
COPY target/skapp-1.0.0.jar skapp.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "skapp.jar"]

