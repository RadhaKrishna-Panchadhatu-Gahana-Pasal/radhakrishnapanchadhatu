import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
  orderId: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId } = schema.parse(body);

    // TODO:
    // 1. Authenticate the request (session or guest token)
    // 2. Load the order from DB, verify it belongs to this user
    // 3. Verify the order is in PENDING payment state
    // 4. Create a Payment record
    // 5. Use EsewaProvider.initiate() to get the redirect URL
    // 6. Return formData and redirectUrl to the client

    return NextResponse.json(
      { success: false, error: "eSewa integration not yet configured" },
      { status: 503 }
    );
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Invalid request", details: err.flatten() },
        { status: 400 }
      );
    }
    console.error("[esewa/initiate]", err);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
