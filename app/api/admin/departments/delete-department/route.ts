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
    if (!departments.includes(department)) {
      return NextResponse.json({ error: 'Department not found' }, { status: 400 });
    }

    const updatedDepartments = departments.filter((dept: string) => dept !== department);
    await clubDocRef.update({ departments: updatedDepartments });

    const memberIds = clubData?.memberIds || [];
    for (const userId of memberIds) {
      const userDocRef = dbAdmin.collection('users').doc(userId);
      const userDocSnap = await userDocRef.get();
      if (userDocSnap.exists) {
        const userData = userDocSnap.data();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const clubIds = (userData?.clubIds as any[]) || [];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const updatedClubIds = clubIds.map((c: any) => 
          c.clubId === clubId && c.department === department 
            ? { ...c, department: 'no-department' } 
            : c
        );
        await userDocRef.update({ clubIds: updatedClubIds });
      }
    }

    return NextResponse.json({ message: 'Department deleted successfully' }, { status: 200 });

  } catch (error) {
    console.error("Error deleting department:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}