import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
  orderId: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId } = schema.parse(body);

    // TODO: Same pattern as eSewa — load order, create Payment, call KhaltiProvider.initiate()

    return NextResponse.json(
      { success: false, error: "Khalti integration not yet configured" },
      { status: 503 }
    );
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Invalid request" },
        { status: 400 }
      );
    }
    console.error("[khalti/initiate]", err);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
