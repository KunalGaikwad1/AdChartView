import { NextResponse } from "next/server";
import { initSocket } from "@/lib/socketServer";

export async function GET() {
  // This endpoint ensures socket is initialized when called
  try {
    initSocket((global as any).server);
    return NextResponse.json({ message: "Socket initialized" });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
