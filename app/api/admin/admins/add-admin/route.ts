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

    if (adminIds.includes(email)) {
      return NextResponse.json({ error: 'User is already an admin' }, { status: 400 });
    }

    const userQuery = await dbAdmin.collection('users').where('email', '==', email).get();
    if (userQuery.empty) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    const userId = userQuery.docs[0].id;

    await clubDocRef.update({
      adminIds: [...adminIds, email]
    });

    // Add to memberIds if not already
    const memberIds = clubData?.memberIds || [];
    if (!memberIds.includes(userId)) {
      await clubDocRef.update({
        memberIds: [...memberIds, userId]
      });
    }

    // Update user's role to admin
    await dbAdmin.collection('users').doc(userId).update({ role: 'admin' });

    return NextResponse.json({ message: 'Admin added successfully' }, { status: 200 });

  } catch (error) {
    console.error("Error adding admin:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}