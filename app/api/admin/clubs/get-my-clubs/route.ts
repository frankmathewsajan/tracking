import { authAdmin, dbAdmin } from '@/lib/firebaseAdmin';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get("session")?.value;
    if (!sessionCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decodedToken = await authAdmin.verifySessionCookie(sessionCookie, true);
    const userId = decodedToken.uid;

    const userDocRef = dbAdmin.collection('users').doc(userId);
    const userDocSnap = await userDocRef.get();

    if (!userDocSnap.exists) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userData = userDocSnap.data();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const clubIds = (userData as any)?.clubIds as string[] | undefined;

    if (!clubIds || clubIds.length === 0) {
      return NextResponse.json([], { status: 200 });
    }

    const clubDocs = await Promise.all(
      clubIds.map(id => dbAdmin.collection('clubs').doc(id).get())
    );

    const clubs = clubDocs
      .filter(docSnap => docSnap.exists)
      .map(docSnap => ({
        id: docSnap.id,
        ...(docSnap.data() as Record<string, unknown>),
      }));

    return NextResponse.json(clubs, { status: 200 });

  } catch (error) {
    console.error("Error fetching user's clubs:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}