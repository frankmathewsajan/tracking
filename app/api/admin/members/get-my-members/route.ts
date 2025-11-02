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
    const clubIds = (userData as any)?.clubIds as string[] | undefined;

    if (!clubIds || !clubIds.includes(clubId)) {
      return NextResponse.json({ error: 'Access denied: You are not a member of this club' }, { status: 403 });
    }

    const usersRef = dbAdmin.collection('users');
    const usersQuery = usersRef.where('clubIds', 'array-contains', clubId);
    const querySnapshot = await usersQuery.get();

    const users = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json(users, { status: 200 });

  } catch (error) {
    console.error("Error fetching club members:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}