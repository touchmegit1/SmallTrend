package tools;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class PasswordGenerator {

    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

        // Generate hash for password "password"
        String plainPassword = "password";
        String hashedPassword = encoder.encode(plainPassword);

        System.out.println("Plain password: " + plainPassword);
        System.out.println("Hashed password: " + hashedPassword);
        System.out.println("Verification: " + encoder.matches(plainPassword, hashedPassword));

        // Test with multiple generations to show different salts
        System.out.println("\nMultiple hash generations for reference:");
        for (int i = 1; i <= 5; i++) {
            String hash = encoder.encode(plainPassword);
            System.out.println("Hash " + i + ": " + hash);
        }
    }
}
