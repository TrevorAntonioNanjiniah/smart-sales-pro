import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function POST(req) {
  try {
    const { clerkId, phone, firstName, lastName, email } = await req.json();

    const client = await clientPromise;
    const db = client.db();

    await db.collection('users').updateOne(
      { clerkId },
      {
        $set: {
          clerkId,
          phone,
          firstName,
          lastName,
          email,
          updatedAt: new Date()
        },
        $setOnInsert: {
          createdAt: new Date()
        }
      },
      { upsert: true }
    );

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Save user error:', error);
    return NextResponse.json(
      { error: 'Failed to save user data' },
      { status: 500 }
    );
  }
}