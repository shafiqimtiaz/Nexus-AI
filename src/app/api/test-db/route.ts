import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = createServerClient();
    
    // Attempt to query the settings table to check connection
    const { data, error } = await supabase
      .from("settings")
      .select("*")
      .limit(1);

    if (error) {
      return NextResponse.json(
        { success: false, message: "Database query failed", error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Successfully connected to Supabase!",
      data,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: "Internal server error", error: error.message },
      { status: 500 }
    );
  }
}
