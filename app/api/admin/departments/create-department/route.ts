import { authAdmin, dbAdmin } from '@/lib/firebaseAdmin';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get("session")?.value;
    if (!sessionCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decodedToken = await authAdmin.verifySessionCookie(sessionCookie, true);

    const { clubId, department } = await request.json();
    if (!clubId || !department) {
      return NextResponse.json({ error: 'Club ID and department are required' }, { status: 400 });
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

    const departments = clubData?.departments || [];
    if (departments.includes(department)) {
      return NextResponse.json({ error: 'Department already exists' }, { status: 400 });
    }

    await clubDocRef.update({ departments: [...departments, department] });

    return NextResponse.json({ message: 'Department created successfully' }, { status: 200 });

  } catch (error) {
    console.error("Error creating department:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}