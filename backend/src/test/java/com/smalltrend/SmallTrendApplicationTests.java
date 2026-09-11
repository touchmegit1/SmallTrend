package com.smalltrend;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest(properties = {
    "spring.datasource.url=jdbc:h2:mem:smalltrend-test;MODE=MySQL;DB_CLOSE_DELAY=-1;DATABASE_TO_LOWER=TRUE",
    "spring.datasource.driver-class-name=org.h2.Driver",
    "spring.datasource.username=sa",
    "spring.datasource.password=",
    "spring.jpa.database-platform=org.hibernate.dialect.H2Dialect",
    "spring.jpa.hibernate.ddl-auto=create-drop",
    "spring.sql.init.mode=never",
    "spring.mail.host=localhost",
    "spring.mail.port=25",
    "spring.mail.username=",
    "spring.mail.password=",
    "spring.mail.properties.mail.smtp.auth=false",
    "spring.mail.properties.mail.smtp.starttls.enable=false"
})
class SmallTrendApplicationTests {

    @Test
    void contextLoads() {
    }

}
