FROM eclipse-temurin:17-jdk AS build
WORKDIR /workspace

COPY .mvn .mvn
COPY mvnw pom.xml ./
RUN chmod +x mvnw
RUN ./mvnw -B -ntp dependency:go-offline

COPY src src
RUN ./mvnw -B -ntp clean package -Dmaven.test.skip=true

FROM eclipse-temurin:17-jre
WORKDIR /app

COPY --from=build /workspace/target/backend-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8081

ENTRYPOINT ["java", "-jar", "app.jar"]
