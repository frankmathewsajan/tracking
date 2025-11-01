import { authAdmin, dbAdmin } from '@/lib/firebaseAdmin';
import { NextRequest, NextResponse } from 'next/server';

export async function PUT(request: NextRequest) {
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

    const { id, name, departments, adminIds, memberIds } = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'Club ID is required' }, { status: 400 });
    }

    const clubRef = dbAdmin.collection('clubs').doc(id);
    const clubDoc = await clubRef.get();

    if (!clubDoc.exists) {
      return NextResponse.json({ error: 'Club not found' }, { status: 404 });
    }

    const updateData: Partial<{name: string; departments: string[]; adminIds: string[]; memberIds: string[]}> = {};
    if (name !== undefined) updateData.name = name;
    if (departments !== undefined) updateData.departments = departments;
    if (adminIds !== undefined) updateData.adminIds = adminIds;
    if (memberIds !== undefined) updateData.memberIds = memberIds;

    await clubRef.update(updateData);

    return NextResponse.json({ message: 'Club updated successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error updating club:', error);
    return NextResponse.json({ error: 'Failed to update club' }, { status: 500 });
  }
}