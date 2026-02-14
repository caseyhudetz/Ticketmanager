import { NextRequest, NextResponse } from "next/server";
import { searchContacts, MOCK_CONTACTS } from "@/lib/mock-data";
import { ApiResponse, SalesforceContact } from "@/types";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");

  try {
    let contacts: SalesforceContact[];

    if (query) {
      contacts = searchContacts(query);
    } else {
      contacts = MOCK_CONTACTS;
    }

    return NextResponse.json({
      success: true,
      data: contacts,
    } satisfies ApiResponse<SalesforceContact[]>);
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to fetch Salesforce contacts" } satisfies ApiResponse<never>,
      { status: 500 }
    );
  }
}
