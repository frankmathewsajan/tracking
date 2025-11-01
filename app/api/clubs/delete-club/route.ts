import { authAdmin, dbAdmin } from '@/lib/firebaseAdmin';
import { NextRequest, NextResponse } from 'next/server';

export async function DELETE(request: NextRequest) {
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

    const { id } = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'Club ID is required' }, { status: 400 });
    }

    const clubRef = dbAdmin.collection('clubs').doc(id);
    const clubDoc = await clubRef.get();

    if (!clubDoc.exists) {
      return NextResponse.json({ error: 'Club not found' }, { status: 404 });
    }

    await clubRef.delete();

    return NextResponse.json({ message: 'Club deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting club:', error);
    return NextResponse.json({ error: 'Failed to delete club' }, { status: 500 });
  }
}