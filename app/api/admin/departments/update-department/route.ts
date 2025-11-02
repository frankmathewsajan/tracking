import { authAdmin, dbAdmin } from '@/lib/firebaseAdmin';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get("session")?.value;
    if (!sessionCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decodedToken = await authAdmin.verifySessionCookie(sessionCookie, true);

    const { clubId, oldDepartment, newDepartment } = await request.json();
    if (!clubId || !oldDepartment || !newDepartment) {
      return NextResponse.json({ error: 'Club ID, old department, and new department are required' }, { status: 400 });
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
    if (!departments.includes(oldDepartment)) {
      return NextResponse.json({ error: 'Old department not found' }, { status: 400 });
    }
    if (departments.includes(newDepartment)) {
      return NextResponse.json({ error: 'New department already exists' }, { status: 400 });
    }

    // Update club's departments
    const updatedDepartments = departments.map((dept: string) => dept === oldDepartment ? newDepartment : dept);
    await clubDocRef.update({ departments: updatedDepartments });

    // Update users' clubIds
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
          c.clubId === clubId && c.department === oldDepartment 
            ? { ...c, department: newDepartment } 
            : c
        );
        await userDocRef.update({ clubIds: updatedClubIds });
      }
    }

    return NextResponse.json({ message: 'Department updated successfully' }, { status: 200 });

  } catch (error) {
    console.error("Error updating department:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
