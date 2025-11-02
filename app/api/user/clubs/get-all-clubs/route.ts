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

    await dbAdmin.collection("users").doc(uid).get();


    const clubsRef = dbAdmin.collection('clubs');
    const snapshot = await clubsRef.get();
    const clubs = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data?.name,
        departments: data?.departments,
        createdAt: data?.createdAt,
      };
    });

    return NextResponse.json(clubs);
  } catch (error) {
    console.error('Error fetching clubs:', error);
    return NextResponse.json({ error: 'Failed to fetch clubs' }, { status: 500 });
  }
}