package com.smalltrend.service;

import com.itextpdf.io.font.constants.StandardFonts;
import com.itextpdf.kernel.colors.DeviceRgb;
import com.itextpdf.kernel.font.PdfFont;
import com.itextpdf.kernel.font.PdfFontFactory;
import com.itextpdf.kernel.geom.PageSize;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.borders.Border;
import com.itextpdf.layout.borders.SolidBorder;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import com.itextpdf.layout.properties.VerticalAlignment;
import org.apache.poi.ss.usermodel.BorderStyle;
import org.apache.poi.ss.usermodel.FillPatternType;
import org.apache.poi.ss.util.CellRangeAddress;
import org.apache.poi.xssf.usermodel.XSSFCellStyle;
import org.apache.poi.xssf.usermodel.XSSFColor;
import org.apache.poi.xssf.usermodel.XSSFFont;
import org.apache.poi.xssf.usermodel.XSSFSheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;

@Service
public class ReportGeneratorService {

    // ── PDF color palette (iText7 DeviceRgb) ─────────────────────────────
    private static final DeviceRgb PDF_PRIMARY       = new DeviceRgb(37,  99, 235);
    private static final DeviceRgb PDF_PRIMARY_DARK  = new DeviceRgb(29,  78, 216);
    private static final DeviceRgb PDF_ACCENT_LIGHT  = new DeviceRgb(147, 197, 253);
    private static final DeviceRgb PDF_SUBTITLE_TEXT = new DeviceRgb(191, 219, 254);
    private static final DeviceRgb PDF_HEADER_TEXT   = new DeviceRgb(255, 255, 255);
    private static final DeviceRgb PDF_ROW_ODD       = new DeviceRgb(255, 255, 255);
    private static final DeviceRgb PDF_ROW_EVEN      = new DeviceRgb(239, 246, 255);
    private static final DeviceRgb PDF_HIGHLIGHT_BG  = new DeviceRgb(220, 252, 231);
    private static final DeviceRgb PDF_HIGHLIGHT_TXT = new DeviceRgb(21,  128,  61);
    private static final DeviceRgb PDF_TEXT_DARK     = new DeviceRgb(17,  24,  39);
    private static final DeviceRgb PDF_TEXT_MUTED    = new DeviceRgb(107, 114, 128);
    private static final DeviceRgb PDF_KPI_BG        = new DeviceRgb(248, 250, 252);
    private static final DeviceRgb PDF_BORDER        = new DeviceRgb(226, 232, 240);

    // ── Excel color palette (RGB byte arrays) ─────────────────────────────
    private static final byte[] XL_PRIMARY      = {37, 99, (byte) 235};
    private static final byte[] XL_PRIMARY_DARK = {29, 78, (byte) 216};
    private static final byte[] XL_BLUE_700     = {29, 78, (byte) 216};
    private static final byte[] XL_WHITE        = {(byte) 255, (byte) 255, (byte) 255};
    private static final byte[] XL_ROW_EVEN     = {(byte) 239, (byte) 246, (byte) 255};
    private static final byte[] XL_ROW_ODD      = {(byte) 255, (byte) 255, (byte) 255};
    private static final byte[] XL_KPI_BG       = {(byte) 248, (byte) 250, (byte) 252};
    private static final byte[] XL_TEXT_DARK    = {17, 24, 39};
    private static final byte[] XL_TEXT_MUTED   = {107, (byte) 114, (byte) 128};

    // ─────────────────────────────────────────────────────────────────────
    // PDF
    // ─────────────────────────────────────────────────────────────────────

    /**
     * Generates a professional PDF with branded banner, optional KPI summary
     * cards, zebra-striped data rows, and conditional highlighting on the row
     * whose value in {@code highlightCol} is the highest.
     *
     * @param title        Report heading (e.g. "Revenue Report")
     * @param subtitle     Date-range string shown under the title (null to omit)
     * @param headers      Column header labels
     * @param data         Table rows
     * @param kpis         Ordered map label→value shown as KPI cards (null to omit)
     * @param highlightCol Column index whose peak-value row is highlighted green (-1 = none)
     */
    public byte[] generatePdf(String title, String subtitle,
                              List<String> headers, List<List<String>> data,
                              Map<String, String> kpis, int highlightCol) {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        try {
            Document document = new Document(new PdfDocument(new PdfWriter(out)), PageSize.A4);
            document.setMargins(36, 36, 36, 36);

            PdfFont regular = PdfFontFactory.createFont(StandardFonts.HELVETICA);
            PdfFont bold    = PdfFontFactory.createFont(StandardFonts.HELVETICA_BOLD);

            // ── Banner ────────────────────────────────────────────────────
            Table banner = new Table(UnitValue.createPercentArray(new float[]{3, 1}))
                    .useAllAvailableWidth()
                    .setBackgroundColor(PDF_PRIMARY);

            banner.addCell(new Cell()
                    .add(new Paragraph("SmallTrend")
                            .setFont(bold).setFontSize(10).setFontColor(PDF_ACCENT_LIGHT))
                    .add(new Paragraph(title)
                            .setFont(bold).setFontSize(22).setFontColor(PDF_HEADER_TEXT))
                    .add(new Paragraph(subtitle != null ? subtitle : "")
                            .setFont(regular).setFontSize(10).setFontColor(PDF_SUBTITLE_TEXT))
                    .setPadding(20).setBorder(Border.NO_BORDER)
                    .setVerticalAlignment(VerticalAlignment.BOTTOM));

            banner.addCell(new Cell()
                    .add(new Paragraph("Generated")
                            .setFont(regular).setFontSize(8).setFontColor(PDF_SUBTITLE_TEXT)
                            .setTextAlignment(TextAlignment.RIGHT))
                    .add(new Paragraph(LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd MMM yyyy")))
                            .setFont(bold).setFontSize(10).setFontColor(PDF_HEADER_TEXT)
                            .setTextAlignment(TextAlignment.RIGHT))
                    .add(new Paragraph(LocalDateTime.now().format(DateTimeFormatter.ofPattern("HH:mm")))
                            .setFont(regular).setFontSize(9).setFontColor(PDF_SUBTITLE_TEXT)
                            .setTextAlignment(TextAlignment.RIGHT))
                    .setPadding(20).setBorder(Border.NO_BORDER)
                    .setVerticalAlignment(VerticalAlignment.BOTTOM));

            document.add(banner);
            document.add(new Paragraph(" ").setFontSize(6));

            // ── KPI Cards ────────────────────────────────────────────────
            if (kpis != null && !kpis.isEmpty()) {
                float[] kpiCols = new float[kpis.size()];
                for (int i = 0; i < kpis.size(); i++) kpiCols[i] = 1f;

                Table kpiTable = new Table(UnitValue.createPercentArray(kpiCols))
                        .useAllAvailableWidth().setMarginBottom(14);

                for (Map.Entry<String, String> entry : kpis.entrySet()) {
                    kpiTable.addCell(new Cell()
                            .add(new Paragraph(entry.getValue())
                                    .setFont(bold).setFontSize(17)
                                    .setFontColor(PDF_PRIMARY_DARK)
                                    .setTextAlignment(TextAlignment.CENTER))
                            .add(new Paragraph(entry.getKey())
                                    .setFont(regular).setFontSize(8)
                                    .setFontColor(PDF_TEXT_MUTED)
                                    .setTextAlignment(TextAlignment.CENTER))
                            .setBackgroundColor(PDF_KPI_BG)
                            .setBorder(new SolidBorder(PDF_BORDER, 1))
                            .setPaddingTop(12).setPaddingBottom(12)
                            .setPaddingLeft(8).setPaddingRight(8));
                }
                document.add(kpiTable);
            }

            // ── Data Table ───────────────────────────────────────────────
            double maxVal = findMaxInColumn(data, highlightCol);

            float[] colWidths = new float[headers.size()];
            for (int i = 0; i < headers.size(); i++) colWidths[i] = 1f;

            Table table = new Table(UnitValue.createPercentArray(colWidths)).useAllAvailableWidth();

            for (String h : headers) {
                table.addHeaderCell(new Cell()
                        .add(new Paragraph(h).setFont(bold).setFontSize(10).setFontColor(PDF_HEADER_TEXT))
                        .setBackgroundColor(PDF_PRIMARY_DARK)
                        .setBorder(Border.NO_BORDER)
                        .setPaddingTop(9).setPaddingBottom(9)
                        .setPaddingLeft(8).setPaddingRight(8)
                        .setTextAlignment(TextAlignment.CENTER));
            }

            for (int r = 0; r < data.size(); r++) {
                List<String> row = data.get(r);
                boolean highlight = isMaxRow(row, highlightCol, maxVal);
                DeviceRgb rowBg = highlight ? PDF_HIGHLIGHT_BG
                        : (r % 2 == 0 ? PDF_ROW_ODD : PDF_ROW_EVEN);

                for (String val : row) {
                    Paragraph p = new Paragraph(val != null ? val : "")
                            .setFont(highlight ? bold : regular).setFontSize(9)
                            .setFontColor(highlight ? PDF_HIGHLIGHT_TXT : PDF_TEXT_DARK);
                    table.addCell(new Cell().add(p)
                            .setBackgroundColor(rowBg)
                            .setBorder(Border.NO_BORDER)
                            .setBorderBottom(new SolidBorder(PDF_BORDER, 0.5f))
                            .setPaddingTop(7).setPaddingBottom(7)
                            .setPaddingLeft(8).setPaddingRight(8));
                }
            }

            document.add(table);

            // ── Footer ───────────────────────────────────────────────────
            document.add(new Paragraph(" ").setFontSize(8));
            document.add(new Paragraph("Generated automatically by SmallTrend POS System  •  Confidential")
                    .setFont(regular).setFontSize(8)
                    .setFontColor(PDF_TEXT_MUTED)
                    .setTextAlignment(TextAlignment.CENTER));

            document.close();
        } catch (Exception e) {
            throw new RuntimeException("Error generating PDF", e);
        }
        return out.toByteArray();
    }

    /** Backward-compatible overload – no KPI section, no conditional highlighting. */
    public byte[] generatePdf(String title, List<String> headers, List<List<String>> data) {
        return generatePdf(title, null, headers, data, null, -1);
    }

    // ─────────────────────────────────────────────────────────────────────
    // Excel
    // ─────────────────────────────────────────────────────────────────────

    /**
     * Generates an Excel workbook with a branded title row, horizontal KPI
     * section, blue header row, and zebra-striped data rows.
     */
    public byte[] generateExcel(String sheetName, String subtitle,
                                List<String> headers, List<List<String>> data,
                                Map<String, String> kpis) {
        try (XSSFWorkbook wb = new XSSFWorkbook();
             ByteArrayOutputStream out = new ByteArrayOutputStream()) {

            XSSFSheet sheet = wb.createSheet(sheetName);
            sheet.setDefaultColumnWidth(18);

            XSSFCellStyle titleStyle    = xlStyle(wb, XL_PRIMARY,      XL_WHITE,      true,  16, false);
            XSSFCellStyle subtitleStyle = xlStyle(wb, XL_KPI_BG,       XL_TEXT_MUTED, false, 10, false);
            XSSFCellStyle kpiLblStyle   = xlStyle(wb, XL_KPI_BG,       XL_TEXT_MUTED, false,  9, false);
            XSSFCellStyle kpiValStyle   = xlStyle(wb, XL_KPI_BG,       XL_BLUE_700,   true,  13, false);
            XSSFCellStyle headerStyle   = xlStyle(wb, XL_PRIMARY_DARK, XL_WHITE,      true,  10, true);
            XSSFCellStyle oddStyle      = xlStyle(wb, XL_ROW_ODD,      XL_TEXT_DARK,  false,  9, false);
            XSSFCellStyle evenStyle     = xlStyle(wb, XL_ROW_EVEN,     XL_TEXT_DARK,  false,  9, false);

            int r = 0;

            // ── Title ─────────────────────────────────────────────────────
            org.apache.poi.ss.usermodel.Row titleRow = sheet.createRow(r++);
            titleRow.setHeightInPoints(30);
            org.apache.poi.ss.usermodel.Cell titleCell = titleRow.createCell(0);
            titleCell.setCellValue(sheetName);
            titleCell.setCellStyle(titleStyle);
            if (headers.size() > 1)
                sheet.addMergedRegion(new CellRangeAddress(r - 1, r - 1, 0, headers.size() - 1));

            // ── Subtitle ──────────────────────────────────────────────────
            if (subtitle != null) {
                org.apache.poi.ss.usermodel.Row subRow = sheet.createRow(r++);
                org.apache.poi.ss.usermodel.Cell subCell = subRow.createCell(0);
                subCell.setCellValue(subtitle);
                subCell.setCellStyle(subtitleStyle);
                if (headers.size() > 1)
                    sheet.addMergedRegion(new CellRangeAddress(r - 1, r - 1, 0, headers.size() - 1));
            }

            // ── KPI section (labels row + values row, horizontal layout) ──
            if (kpis != null && !kpis.isEmpty()) {
                r++; // spacer
                org.apache.poi.ss.usermodel.Row lblRow = sheet.createRow(r++);
                org.apache.poi.ss.usermodel.Row valRow = sheet.createRow(r++);
                valRow.setHeightInPoints(22);

                int col = 0;
                for (Map.Entry<String, String> entry : kpis.entrySet()) {
                    org.apache.poi.ss.usermodel.Cell lbl = lblRow.createCell(col);
                    lbl.setCellValue(entry.getKey());
                    lbl.setCellStyle(kpiLblStyle);

                    org.apache.poi.ss.usermodel.Cell val = valRow.createCell(col);
                    val.setCellValue(entry.getValue());
                    val.setCellStyle(kpiValStyle);
                    col++;
                }
                r++; // spacer
            }

            // ── Header row ────────────────────────────────────────────────
            org.apache.poi.ss.usermodel.Row headerRow = sheet.createRow(r++);
            headerRow.setHeightInPoints(18);
            for (int c = 0; c < headers.size(); c++) {
                org.apache.poi.ss.usermodel.Cell cell = headerRow.createCell(c);
                cell.setCellValue(headers.get(c));
                cell.setCellStyle(headerStyle);
            }

            // ── Data rows ─────────────────────────────────────────────────
            for (int i = 0; i < data.size(); i++) {
                org.apache.poi.ss.usermodel.Row row = sheet.createRow(r++);
                XSSFCellStyle rowStyle = i % 2 == 0 ? oddStyle : evenStyle;
                List<String> rowData = data.get(i);
                for (int c = 0; c < rowData.size(); c++) {
                    org.apache.poi.ss.usermodel.Cell cell = row.createCell(c);
                    cell.setCellValue(rowData.get(c) != null ? rowData.get(c) : "");
                    cell.setCellStyle(rowStyle);
                }
            }

            for (int c = 0; c < headers.size(); c++) sheet.autoSizeColumn(c);

            wb.write(out);
            return out.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Error generating Excel", e);
        }
    }

    /** Backward-compatible overload. */
    public byte[] generateExcel(String sheetName, List<String> headers, List<List<String>> data) {
        return generateExcel(sheetName, null, headers, data, null);
    }

    // ─────────────────────────────────────────────────────────────────────
    // CSV (unchanged)
    // ─────────────────────────────────────────────────────────────────────

    public byte[] generateCsv(String title, List<String> headers, List<List<String>> data) {
        StringBuilder csv = new StringBuilder();
        csv.append(escapeCsv(title)).append("\n");
        for (int i = 0; i < headers.size(); i++) {
            csv.append(escapeCsv(headers.get(i)));
            if (i < headers.size() - 1) csv.append(",");
        }
        csv.append("\n");
        for (List<String> row : data) {
            for (int i = 0; i < row.size(); i++) {
                csv.append(escapeCsv(row.get(i) != null ? row.get(i) : ""));
                if (i < row.size() - 1) csv.append(",");
            }
            csv.append("\n");
        }
        return csv.toString().getBytes(StandardCharsets.UTF_8);
    }

    // ─────────────────────────────────────────────────────────────────────
    // Helpers
    // ─────────────────────────────────────────────────────────────────────

    private XSSFCellStyle xlStyle(XSSFWorkbook wb, byte[] bgRgb, byte[] fgRgb,
                                  boolean bold, int fontSize, boolean withBorder) {
        XSSFCellStyle style = wb.createCellStyle();
        style.setFillForegroundColor(new XSSFColor(bgRgb, null));
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        style.setVerticalAlignment(org.apache.poi.ss.usermodel.VerticalAlignment.CENTER);
        style.setAlignment(org.apache.poi.ss.usermodel.HorizontalAlignment.LEFT);
        if (withBorder) {
            style.setBorderBottom(BorderStyle.THIN);
            style.setBorderTop(BorderStyle.THIN);
            style.setBottomBorderColor(new XSSFColor(new byte[]{(byte) 226, (byte) 232, (byte) 240}, null));
            style.setTopBorderColor(new XSSFColor(new byte[]{(byte) 226, (byte) 232, (byte) 240}, null));
        }
        XSSFFont font = wb.createFont();
        font.setBold(bold);
        font.setFontHeightInPoints((short) fontSize);
        if (fgRgb != null) font.setColor(new XSSFColor(fgRgb, null));
        style.setFont(font);
        return style;
    }

    private double findMaxInColumn(List<List<String>> data, int col) {
        if (col < 0) return Double.MIN_VALUE;
        double max = Double.MIN_VALUE;
        for (List<String> row : data) {
            if (col < row.size() && row.get(col) != null) {
                try {
                    double v = Double.parseDouble(row.get(col).replaceAll("[^\\d.]", ""));
                    if (v > max) max = v;
                } catch (NumberFormatException ignored) {}
            }
        }
        return max;
    }

    private boolean isMaxRow(List<String> row, int col, double maxVal) {
        if (col < 0 || col >= row.size() || maxVal == Double.MIN_VALUE) return false;
        try {
            double v = Double.parseDouble(row.get(col).replaceAll("[^\\d.]", ""));
            return Math.abs(v - maxVal) < 0.01;
        } catch (NumberFormatException e) {
            return false;
        }
    }

    private String escapeCsv(String data) {
        if (data == null) return "";
        String escaped = data.replaceAll("\"", "\"\"");
        if (data.contains(",") || data.contains("\n") || data.contains("\""))
            return "\"" + escaped + "\"";
        return data;
    }
}
