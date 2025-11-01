import { authAdmin, dbAdmin } from '@/lib/firebaseAdmin';
import { NextRequest, NextResponse } from 'next/server';
import { Timestamp } from 'firebase-admin/firestore';

export async function POST(request: NextRequest) {
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

    const { name, departments, adminIds, memberIds } = await request.json();

    if (!name || !departments || !adminIds || !memberIds) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const createdAt = Timestamp.now();

    await dbAdmin.collection('clubs').add({
      name,
      departments,
      adminIds,
      memberIds,
      createdAt,
    });

    return NextResponse.json({ message: 'Club created successfully' }, { status: 201 });
  } catch (error) {
    console.error('Error creating club:', error);
    return NextResponse.json({ error: 'Failed to create club' }, { status: 500 });
  }
}