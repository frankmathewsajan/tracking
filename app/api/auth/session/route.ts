import { authAdmin, dbAdmin } from "@/lib/firebaseAdmin";
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const { idToken } = await request.json();
    const expiresIn = 60 * 60 * 24 * 5 * 1000;

    const decodedToken = await authAdmin.verifyIdToken(idToken);
    const uid = decodedToken.uid;

    const sessionCookie = await authAdmin.createSessionCookie(idToken, { expiresIn });

    const userRef = dbAdmin.collection('users').doc(uid);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      await userRef.set({
        email: decodedToken.email,
        name: decodedToken.name,
        photoURL: decodedToken.picture,
        role: "member",
        clubIds: [],
        department: "", 
        joinedAt: new Date(),
      });
    }

    (await cookies()).set("session", sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: expiresIn / 1000,
      path: "/",
    });

    return NextResponse.json({ status: "success" });
  } catch (error) {
    console.error("Session login error:", error);
    return NextResponse.json({ status: "error" }, { status: 401 });
  }
}

export async function DELETE() {
  try {
    (await cookies()).set("session", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 0,
      path: "/",
    });

    return NextResponse.json({ status: "success" });
  } catch (error) {
    console.error("Session logout error:", error);
    return NextResponse.json({ status: "error" }, { status: 500 });
  }
}