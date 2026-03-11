import java.sql.*;
public class Dump {
    public static void main(String[] args) throws Exception {
        Connection c = DriverManager.getConnection("jdbc:mysql://localhost:3306/smalltrend", "root", "");
        ResultSet rs = c.createStatement().executeQuery("SELECT phone FROM customers");
        while(rs.next()) System.out.println("PHONE_IN_DB: " + rs.getString(1));
    }
}
