import { authAdmin, dbAdmin } from '@/lib/firebaseAdmin';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const sessionCookie = request.cookies.get("session")?.value;

  if (!sessionCookie) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const decodedToken = await authAdmin.verifySessionCookie(sessionCookie, true);
    const uid = decodedToken.uid;

    const userDoc = await dbAdmin.collection("users").doc(uid).get();

    if (!userDoc.exists || userDoc.data()?.role !== "super_admin") {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const clubsRef = dbAdmin.collection('clubs');
    const snapshot = await clubsRef.get();
    const clubs = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json(clubs);
  } catch (error) {
    console.error('Error fetching clubs:', error);
    return NextResponse.json({ error: 'Failed to fetch clubs' }, { status: 500 });
  }
}