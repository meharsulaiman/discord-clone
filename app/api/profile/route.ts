import { currentProfile } from '@/lib/current-profile';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  try {
    const profile = await currentProfile();

    if (!profile) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    return NextResponse.json({ id: profile.id });
  } catch (error) {
    console.error(error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}
