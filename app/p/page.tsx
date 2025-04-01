'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Page() {
    const router = useRouter();

    useEffect(() => {
        router.push('/');
    }, [router]);

    return null; // Optionally, you can return a loading spinner or nothing

}
