import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { sheetsService } from "@/lib/sheets-service";
import type { APIResponse } from "@/types";

const speechSchema = z.object({
  name: z.string().min(1, "Navn er påkrevd").max(100).trim(),
  email: z.email("Ugyldig e-postadresse").optional().or(z.literal("")),
  durationMinutes: z
    .number()
    .int()
    .min(1, "Varighet må være minst 1 minutt")
    .max(7, "Varighet kan ikke overstige 7 minutter"),
  message: z.string().max(1000).optional().default(""),
});

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();

    let data;
    try {
      data = speechSchema.parse(body);
    } catch (error: any) {
      const msg =
        error.errors?.map((e: any) => e.message).join(", ") || "Ugyldig data";
      return NextResponse.json(
        {
          success: false,
          error: "Valideringsfeil",
          message: msg,
        } as APIResponse,
        { status: 400 },
      );
    }

    await sheetsService.registerSpeech(data);

    return NextResponse.json(
      { success: true, message: "Tale registrert!" } as APIResponse,
      { status: 200 },
    );
  } catch (error) {
    console.error("Speech registration error:", error);
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
