import { checkDashboardAccess } from "@/lib/dashboard-access";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);
    
    // If no session, return 401
    if (!session) {
      return NextResponse.json({ hasAccess: false, error: "No session" }, { status: 401 });
    }

    // If no access token, return 401
    if (!session.accessToken) {
      console.error("Dashboard access check: No access token in session", {
        hasSession: !!session,
        hasUser: !!session.user,
        userId: session.user?.id,
      });
      return NextResponse.json({ hasAccess: false, error: "No access token" }, { status: 401 });
    }

    // Check dashboard access with retry logic for transient failures
    let hasAccess = false;
    let lastError: Error | null = null;
    
    // Retry up to 2 times for transient failures
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        hasAccess = await checkDashboardAccess();
        if (hasAccess) {
          break; // Success, exit retry loop
        }
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        // If it's a network error or rate limit, wait before retry
        if (attempt < 2) {
          await new Promise(resolve => setTimeout(resolve, 100 * (attempt + 1))); // 100ms, 200ms delays
          continue;
        }
      }
    }
    
    if (hasAccess) {
      return NextResponse.json({ hasAccess: true });
    } else {
      // If we have a last error, include it in the response for debugging
      const errorMessage = lastError 
        ? `Access check failed: ${lastError.message}` 
        : "User does not have required server membership or roles";
      
      return NextResponse.json({ 
        hasAccess: false, 
        error: errorMessage 
      }, { status: 403 });
    }
  } catch (error) {
    console.error("Error in dashboard access check:", error);
    return NextResponse.json({ 
      hasAccess: false, 
      error: error instanceof Error ? error.message : "Unknown error" 
    }, { status: 500 });
  }
}

