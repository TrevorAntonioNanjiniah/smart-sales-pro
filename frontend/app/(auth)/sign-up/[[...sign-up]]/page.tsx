import { SignUp } from '@clerk/nextjs';

export default function Page({
  searchParams,
}: {
  searchParams: { redirect_url?: string };
}) {
  const redirectUrl = searchParams.redirect_url
    ? decodeURIComponent(searchParams.redirect_url)
    : 'http://localhost:3001/products';

  return (
    <div className="flex items-center justify-center min-h-screen">
      <SignUp
        forceRedirectUrl={`/onboarding?redirect_url=${encodeURIComponent(redirectUrl)}`}
      />
    </div>
  );
}