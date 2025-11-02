import { authAdmin, dbAdmin } from '@/lib/firebaseAdmin';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get("session")?.value;
    if (!sessionCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decodedToken = await authAdmin.verifySessionCookie(sessionCookie, true);

    const { clubId, email } = await request.json();
    if (!clubId || !email) {
      return NextResponse.json({ error: 'Club ID and email are required' }, { status: 400 });
    }

    const clubDocRef = dbAdmin.collection('clubs').doc(clubId);
    const clubDocSnap = await clubDocRef.get();
    if (!clubDocSnap.exists) {
      return NextResponse.json({ error: 'Club not found' }, { status: 404 });
    }
    const clubData = clubDocSnap.data();
    const adminIds = clubData?.adminIds || [];
    if (!adminIds.includes(decodedToken.email)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (!adminIds.includes(email)) {
      return NextResponse.json({ error: 'User is not an admin' }, { status: 400 });
    }

    // Remove from adminIds
    await clubDocRef.update({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      adminIds: adminIds.filter((a: any) => a !== email)
    });

    return NextResponse.json({ message: 'Admin removed successfully' }, { status: 200 });

  } catch (error) {
    console.error("Error removing admin:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}