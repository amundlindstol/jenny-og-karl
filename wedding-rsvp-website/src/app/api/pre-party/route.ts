import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { sheetsService } from "@/lib/sheets-service";
import type { APIResponse } from "@/types";

const schema = z.object({
  names: z
    .array(z.string().min(1).max(100).trim())
    .min(1, "Minst ett navn er påkrevd")
    .max(20),
});

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();

    let data;
    try {
      data = schema.parse(body);
    } catch (error: any) {
      const msg =
        error.errors?.map((e: any) => e.message).join(", ") || "Ugyldig data";
      return NextResponse.json(
        { success: false, error: "Valideringsfeil", message: msg } as APIResponse,
        { status: 400 },
      );
    }

    await sheetsService.registerPreParty(data.names);

    return NextResponse.json(
      { success: true, message: "Påmelding registrert!" } as APIResponse,
      { status: 200 },
    );
  } catch (error) {
    console.error("Pre-party registration error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Serverfeil",
        message: "Noe gikk galt. Prøv igjen eller kontakt oss direkte.",
      } as APIResponse,
      { status: 500 },
    );
  }
}

export async function GET(): Promise<NextResponse> {
  return NextResponse.json(
    { success: false, error: "Metode ikke tillatt" } as APIResponse,
    { status: 405 },
  );
}
