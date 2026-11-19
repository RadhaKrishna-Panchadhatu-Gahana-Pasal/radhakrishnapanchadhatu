import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // TODO:
    // 1. Extract encodedData from body
    // 2. Use EsewaProvider.verify() — server-side only
    // 3. Compare verified amount with the stored order total
    // 4. Mark Payment as PAID or FAILED idempotently
    // 5. Update Order paymentStatus
    // 6. Reserve/deduct stock
    // 7. Send confirmation notification
    // 8. Return result

    return NextResponse.json(
      { success: false, error: "eSewa verification not yet configured" },
      { status: 503 }
    );
  } catch (err) {
    console.error("[esewa/verify]", err);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
