import { authAdmin, dbAdmin } from "@/lib/firebaseAdmin";
import admin from "firebase-admin";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
const DAILY_POINTS = 10;

function isSameUtcDay(a: Date, b: Date) {
  return (
    a.getUTCFullYear() === b.getUTCFullYear() &&
    a.getUTCMonth() === b.getUTCMonth() &&
    a.getUTCDate() === b.getUTCDate()
  );
}

export async function POST(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get("session")?.value;
    if (!sessionCookie) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decodedToken = await authAdmin.verifySessionCookie(sessionCookie, true);
    const uid = decodedToken.uid;
    const userRef = dbAdmin.collection("users").doc(uid);
    const now = admin.firestore.Timestamp.now();

    const result = await dbAdmin.runTransaction(async (tx) => {
      const snap = await tx.get(userRef);
      if (!snap.exists) {
        throw new Error("USER_NOT_FOUND");
      }

      const data = snap.data() || {};
      const lastDailyClaimAt = data.lastDailyClaimAt as admin.firestore.Timestamp | undefined;
      const hasClaimedToday = lastDailyClaimAt
        ? isSameUtcDay(lastDailyClaimAt.toDate(), now.toDate())
        : false;

      if (hasClaimedToday) {
        return {
          claimed: false,
          points: data.points ?? 0,
          last: lastDailyClaimAt,
        } as const;
      }

      tx.update(userRef, {
        points: admin.firestore.FieldValue.increment(DAILY_POINTS),
        lastDailyClaimAt: now,
      });

      return {
        claimed: true,
        points: (data.points ?? 0) + DAILY_POINTS,
        last: now,
      } as const;
    });

    if (!result.claimed) {
      return NextResponse.json(
        {
          message: "Already claimed for today",
          points: result.points,
          lastClaimAt: result.last?.toDate?.() ?? null,
        },
        { status: 409 }
      );
    }

    return NextResponse.json({
      message: "Daily points claimed",
      points: result.points,
      lastClaimAt: result.last?.toDate?.() ?? null,
    });
  } catch (error: any) {
    if (error?.message === "USER_NOT_FOUND") {
      return NextResponse.json({ error: "User profile not found" }, { status: 404 });
    }

    console.error("Error claiming daily points:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
