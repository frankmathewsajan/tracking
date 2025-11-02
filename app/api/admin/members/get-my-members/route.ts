import { authAdmin, dbAdmin } from '@/lib/firebaseAdmin';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clubId = searchParams.get('clubId');

    if (!clubId) {
      return NextResponse.json({ error: 'Club ID is required' }, { status: 400 });
    }

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
    const clubIds = (userData as any)?.clubIds as any[] | undefined;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (!clubIds || !clubIds.some((c: any) => c.clubId === clubId)) {
      return NextResponse.json({ error: 'Access denied: You are not a member of this club' }, { status: 403 });
    }

    const clubDocRef = dbAdmin.collection('clubs').doc(clubId);
    const clubDocSnap = await clubDocRef.get();
    if (!clubDocSnap.exists) {
      return NextResponse.json({ error: 'Club not found' }, { status: 404 });
    }
    const clubData = clubDocSnap.data();
    const memberIds = clubData?.memberIds || [];

    const users = await Promise.all(memberIds.map(async (memberId: string) => {
      const userDoc = await dbAdmin.collection('users').doc(memberId).get();
      if (userDoc.exists) {
        const userData = userDoc.data();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const clubEntry = (userData?.clubIds as any[])?.find((c: any) => c.clubId === clubId);
        return {
          id: userDoc.id,
          ...userData,
          department: clubEntry?.department || null,
        };
      }
      return null;
    }));

    const filteredUsers = users.filter(u => u !== null);

    return NextResponse.json(filteredUsers, { status: 200 });

  } catch (error) {
    console.error("Error fetching club members:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}