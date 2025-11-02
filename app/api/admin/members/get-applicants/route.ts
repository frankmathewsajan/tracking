import { authAdmin, dbAdmin } from '@/lib/firebaseAdmin';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get("session")?.value;
    if (!sessionCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decodedToken = await authAdmin.verifySessionCookie(sessionCookie, true);

    const { searchParams } = new URL(request.url);
    const clubId = searchParams.get('clubId');
    if (!clubId) {
      return NextResponse.json({ error: 'Club ID is required' }, { status: 400 });
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

    const tempUserQuery = await dbAdmin.collection('tempUser').where('clubId', '==', clubId).get();
    const applicants = tempUserQuery.docs.map(doc => ({
      id: doc.id,
      appliedAt: doc.data().appliedAt,
      department: doc.data().department,
      email: doc.data().email,
      role: doc.data().role,
      userId: doc.data().userId,
      name: doc.data().name,
      clubId: doc.data().clubId,
    }));

    return NextResponse.json(applicants, { status: 200 });

  } catch (error) {
    console.error("Error fetching applicants:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}