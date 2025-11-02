import { authAdmin, dbAdmin } from '@/lib/firebaseAdmin';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get("session")?.value;
    if (!sessionCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decodedToken = await authAdmin.verifySessionCookie(sessionCookie, true);

    const { applicantId, role, department } = await request.json();
    if (!applicantId || !role || !department) {
      return NextResponse.json({ error: 'Applicant ID, role, and department are required' }, { status: 400 });
    }

    // Get applicant from tempUser
    const tempUserDocRef = dbAdmin.collection('tempUser').doc(applicantId);
    const tempUserDocSnap = await tempUserDocRef.get();
    if (!tempUserDocSnap.exists) {
      return NextResponse.json({ error: 'Applicant not found' }, { status: 404 });
    }
    const applicantData = tempUserDocSnap.data();
    const clubId = applicantData?.clubId;
    const userId = applicantData?.userId;
    const email = applicantData?.email;

    // Check if admin
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

    const memberIds = clubData?.memberIds || [];
    if (!memberIds.includes(userId)) {
      await clubDocRef.update({
        memberIds: [...memberIds, userId]
      });
    }

    const userDocRef = dbAdmin.collection('users').doc(userId);
    const userDocSnap = await userDocRef.get();
    if (userDocSnap.exists) {
      const userData = userDocSnap.data();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const clubIds = (userData?.clubIds as any[]) || [];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (!clubIds.some((c: any) => c.clubId === clubId)) {
        await userDocRef.update({
          clubIds: [...clubIds, { clubId, department }]
        });
      }
    }

    // Delete from tempUser
    await tempUserDocRef.delete();

    return NextResponse.json({ message: 'Applicant accepted' }, { status: 200 });

  } catch (error) {
    console.error("Error accepting applicant:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}