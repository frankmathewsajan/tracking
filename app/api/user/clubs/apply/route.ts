import { authAdmin, dbAdmin } from '@/lib/firebaseAdmin';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get("session")?.value;
    if (!sessionCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decodedToken = await authAdmin.verifySessionCookie(sessionCookie, true);
    const userId = decodedToken.uid;
    const userEmail = decodedToken.email;

    const { clubId, department } = await request.json();
    if (!clubId || !department) {
      return NextResponse.json({ error: 'Club ID and department are required' }, { status: 400 });
    }

    const clubDocRef = dbAdmin.collection('clubs').doc(clubId);
    const clubDocSnap = await clubDocRef.get();
    if (!clubDocSnap.exists) {
      return NextResponse.json({ error: 'Club not found' }, { status: 404 });
    }

    const userDocRef = dbAdmin.collection('users').doc(userId);
    const userDocSnap = await userDocRef.get();
    if (!userDocSnap.exists) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    const userData = userDocSnap.data();
    const userName = userData?.name || 'Unknown';

    const tempUserQuery = await dbAdmin.collection('tempUser').where('userId', '==', userId).where('clubId', '==', clubId).get();
    if (!tempUserQuery.empty) {
      return NextResponse.json({ error: 'Already applied to this club' }, { status: 400 });
    }

    await dbAdmin.collection('tempUser').add({
      appliedAt: new Date(),
      clubId,
      department,
      email: userEmail,
      name: userName,
      role: 'member',
      userId
    });

    return NextResponse.json({ message: 'Application submitted successfully' }, { status: 200 });

  } catch (error) {
    console.error("Error applying to club:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}