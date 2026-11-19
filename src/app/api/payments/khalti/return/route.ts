import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const pidx = searchParams.get("pidx");
  const status = searchParams.get("status");

  if (!pidx) {
    return NextResponse.redirect(
      new URL("/order/failed?reason=missing_pidx", request.url)
    );
  }

  // TODO:
  // 1. Find Payment record by providerTransactionId = pidx
  // 2. Call KhaltiProvider.verify({ paymentId, providerData: { pidx } })
  // 3. Compare verified amount with order total
  // 4. Mark Payment PAID or FAILED idempotently
  // 5. Redirect to success or failure page

  if (status === "Completed") {
    return NextResponse.redirect(
      new URL("/order/success?payment=khalti", request.url)
    );
  }

  return NextResponse.redirect(
    new URL("/order/failed?reason=payment_incomplete", request.url)
  );
}
