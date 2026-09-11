package com.smalltrend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

import io.github.cdimascio.dotenv.Dotenv;

@SpringBootApplication
@EnableAsync
@EnableScheduling
public class SmallTrendApplication {

	public static void main(String[] args) {
        // Load .env file
        Dotenv dotenv = Dotenv.configure().ignoreIfMissing().load();
        dotenv.entries().forEach(entry -> {
            String key = entry.getKey();
            String value = entry.getValue();

            if (value == null) {
                return;
            }

            String normalizedValue = value.trim();
            if ("MAIL_PASSWORD".equals(key)) {
                // Gmail app passwords are often copied with visual spaces.
                normalizedValue = normalizedValue.replaceAll("\\s+", "");
            }

            System.setProperty(key, normalizedValue);
        });

		SpringApplication.run(SmallTrendApplication.class, args);
	}

}
