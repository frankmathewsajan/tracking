import { authAdmin, dbAdmin } from '@/lib/firebaseAdmin';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get("session")?.value;
    if (!sessionCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decodedToken = await authAdmin.verifySessionCookie(sessionCookie, true);

    const { applicantId } = await request.json();
    if (!applicantId) {
      return NextResponse.json({ error: 'Applicant ID is required' }, { status: 400 });
    }

    // Get applicant from tempUser
    const tempUserDocRef = dbAdmin.collection('tempUser').doc(applicantId);
    const tempUserDocSnap = await tempUserDocRef.get();
    if (!tempUserDocSnap.exists) {
      return NextResponse.json({ error: 'Applicant not found' }, { status: 404 });
    }
    const applicantData = tempUserDocSnap.data();
    const clubId = applicantData?.clubId;

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

    // Delete from tempUser
    await tempUserDocRef.delete();

    return NextResponse.json({ message: 'Applicant rejected' }, { status: 200 });

  } catch (error) {
    console.error("Error rejecting applicant:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
