# Build Stage
FROM maven:3.8.5-openjdk-17 AS build
WORKDIR /app

# Copy the backend project files
COPY backend/pom.xml .
COPY backend/src ./src

# Copy the frontend files to the static resources directory of the backend
# This allows Spring Boot to serve the frontend at the root URL
COPY frontend ./src/main/resources/static

# Build the application
RUN mvn clean package -DskipTests

# Run Stage
FROM openjdk:17-jdk-slim
WORKDIR /app

# Copy the built JAR from the build stage
COPY --from=build /app/target/avva-home-foods-1.0.0.jar app.jar

# Expose the application port
EXPOSE 8080

# Run the application
ENTRYPOINT ["java", "-jar", "app.jar"]
