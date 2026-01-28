import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { format } from "date-fns";

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const logs = await prisma.coffeeLog.findMany({
      where: { userId: session.user.id },
      orderBy: { dateTime: "desc" },
    });

    // CSV header
    const headers = [
      "ID",
      "日時",
      "タイトル",
      "場所タイプ",
      "店名/場所",
      "ドリンクタイプ",
      "焙煎度",
      "産地",
      "品種",
      "精製方法",
      "評価",
      "メモ",
      "写真URL",
      "公開設定",
      "味座標X（渋み↔酸味）",
      "味座標Y（焙煎度）",
      "作成日時",
      "更新日時",
    ];

    // CSV rows
    const rows = logs.map((log) => [
      log.id,
      format(log.dateTime, "yyyy-MM-dd HH:mm:ss"),
      escapeCSV(log.title),
      log.locationType,
      escapeCSV(log.placeName || ""),
      escapeCSV(log.drinkType || ""),
      log.roastLevel,
      escapeCSV(log.origin || ""),
      escapeCSV(log.variety || ""),
      escapeCSV(log.process || ""),
      log.rating,
      escapeCSV(log.memo || ""),
      log.photoUrl || "",
      log.visibility,
      log.tasteX,
      log.roastY,
      format(log.createdAt, "yyyy-MM-dd HH:mm:ss"),
      format(log.updatedAt, "yyyy-MM-dd HH:mm:ss"),
    ]);

    // Build CSV content
    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");

    // Add BOM for Excel compatibility with Japanese characters
    const bom = "\uFEFF";
    const csvWithBom = bom + csvContent;

    // Create response with proper headers
    const response = new NextResponse(csvWithBom);
    response.headers.set("Content-Type", "text/csv; charset=utf-8");
    response.headers.set(
      "Content-Disposition",
      `attachment; filename="coffee-logs-${format(new Date(), "yyyy-MM-dd")}.csv"`
    );

    return response;
  } catch (error) {
    console.error("CSV export error:", error);
    return NextResponse.json({ error: "Export failed" }, { status: 500 });
  }
}

// Escape CSV values
function escapeCSV(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/*
 * TODO: CSV Import Implementation Notes
 *
 * For future CSV import functionality:
 *
 * 1. Create POST endpoint at /api/import/csv
 * 2. Accept multipart/form-data with CSV file
 * 3. Parse CSV using a library like papaparse
 * 4. Validate each row against coffeeLogSchema
 * 5. Create logs in batch using prisma.coffeeLog.createMany()
 * 6. Handle duplicate detection (e.g., by dateTime + title)
 * 7. Return import summary (success count, error rows)
 *
 * Schema mapping:
 * - Parse date strings to Date objects
 * - Map locationType to valid enum values
 * - Map roastLevel to valid enum values
 * - Validate tasteX is -100 to +100
 * - Validate roastY is 0 to 100
 * - Validate rating is 1 to 5
 */
