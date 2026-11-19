import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getStore, nowIso, uid } from '@/lib/store/repository';

const ContactSchema = z.object({
  name: z.string().min(2).max(120),
  phone: z.string().min(7).max(25),
  email: z.string().email().optional().or(z.literal('')),
  message: z.string().min(5).max(2000),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = ContactSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Please fill in your name, phone, and message.' }, { status: 400 });
    }
    const store = getStore();
    const enquiry = {
      id: uid('enq'),
      name: parsed.data.name,
      phone: parsed.data.phone,
      email: parsed.data.email || undefined,
      message: parsed.data.message,
      createdAt: nowIso(),
    };
    store.contactEnquiries.unshift(enquiry);
    return NextResponse.json({ enquiry }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Unable to send message.' }, { status: 500 });
  }
}
