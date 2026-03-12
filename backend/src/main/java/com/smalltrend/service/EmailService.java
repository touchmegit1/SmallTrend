package com.smalltrend.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.host:}")
    private String mailHost;

    @Value("${app.mail.from:no-reply@smalltrend.local}")
    private String fromEmail;

    /**
     * Gửi email HTML chứa mã OTP đặt lại mật khẩu.
     *
     * @param toEmail       Email của người dùng (địa chỉ NHẬN)
     * @param fullName      Tên hiển thị của người dùng
     * @param otp           Mã OTP 6 chữ số
     * @param expireMinutes Thời gian hiệu lực (phút)
     */
    public void sendPasswordResetOtp(String toEmail, String fullName, String otp, int expireMinutes) {
        if (mailHost == null || mailHost.isBlank()) {
            throw new IllegalStateException("Hệ thống chưa cấu hình SMTP để gửi OTP");
        }

        try {
            MimeMessage mime = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mime, false, "UTF-8");
            helper.setFrom(fromEmail);          // tài khoản gửi (cấu hình trong .env)
            helper.setTo(toEmail);              // email của user lấy từ DB
            helper.setSubject("[SmallTrend] Mã OTP đặt lại mật khẩu");
            helper.setText(buildHtmlTemplate(fullName, otp, expireMinutes), true);
            mailSender.send(mime);
        } catch (MessagingException | MailException ex) {
            throw new RuntimeException("Không thể gửi OTP qua email, vui lòng thử lại", ex);
        }
    }

    private String buildHtmlTemplate(String fullName, String otp, int expireMinutes) {
        String safeName = (fullName == null || fullName.isBlank()) ? "bạn" : fullName;
        return """
                <!DOCTYPE html>
                <html lang="vi">
                <head>
                  <meta charset="UTF-8" />
                  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
                  <title>Đặt lại mật khẩu</title>
                </head>
                <body style="margin:0;padding:0;background:#f4f6f9;font-family:Arial,sans-serif;">
                  <table width="100%%" cellpadding="0" cellspacing="0" style="background:#f4f6f9;padding:40px 0;">
                    <tr>
                      <td align="center">
                        <table width="520" cellpadding="0" cellspacing="0"
                               style="background:#ffffff;border-radius:12px;overflow:hidden;
                                      box-shadow:0 4px 20px rgba(0,0,0,.08);">

                          <!-- Header -->
                          <tr>
                            <td style="background:linear-gradient(135deg,#6c63ff 0%%,#48c6ef 100%%);
                                        padding:32px 40px;text-align:center;">
                              <h1 style="margin:0;color:#ffffff;font-size:24px;letter-spacing:1px;">
                                🔐 SmallTrend
                              </h1>
                              <p style="margin:6px 0 0;color:#e0e7ff;font-size:13px;">
                                Hệ thống quản lý bán hàng
                              </p>
                            </td>
                          </tr>

                          <!-- Body -->
                          <tr>
                            <td style="padding:36px 40px;">
                              <p style="margin:0 0 12px;font-size:15px;color:#374151;">
                                Xin chào <strong>%s</strong>,
                              </p>
                              <p style="margin:0 0 24px;font-size:15px;color:#374151;line-height:1.6;">
                                Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn.<br/>
                                Vui lòng sử dụng mã OTP dưới đây:
                              </p>

                              <!-- OTP Box -->
                              <div style="text-align:center;margin:0 0 24px;">
                                <span style="display:inline-block;
                                             background:#f0edff;
                                             color:#6c63ff;
                                             font-size:36px;
                                             font-weight:700;
                                             letter-spacing:12px;
                                             padding:16px 32px;
                                             border-radius:10px;
                                             border:2px dashed #6c63ff;">
                                  %s
                                </span>
                              </div>

                              <p style="margin:0 0 24px;font-size:14px;color:#6b7280;text-align:center;">
                                ⏱ Mã có hiệu lực trong <strong>%d phút</strong>.
                              </p>

                              <hr style="border:none;border-top:1px solid #e5e7eb;margin:0 0 20px;"/>

                              <p style="margin:0;font-size:13px;color:#9ca3af;line-height:1.6;">
                                Nếu bạn không thực hiện yêu cầu này, hãy bỏ qua email này.
                                Mật khẩu của bạn sẽ không thay đổi.
                              </p>
                            </td>
                          </tr>

                          <!-- Footer -->
                          <tr>
                            <td style="background:#f9fafb;padding:20px 40px;text-align:center;
                                        border-top:1px solid #e5e7eb;">
                              <p style="margin:0;font-size:12px;color:#9ca3af;">
                                © 2026 SmallTrend · Email này được gửi tự động, vui lòng không phản hồi.
                              </p>
                            </td>
                          </tr>

                        </table>
                      </td>
                    </tr>
                  </table>
                </body>
                </html>
                """.formatted(safeName, otp, expireMinutes);
    }
}
