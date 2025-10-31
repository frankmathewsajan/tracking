import LoginPage from '@/components/ui/login'

export default async function Page({
  params,
}: {
  params: Promise<{ type: string }>
}) {
  const { type } = await params
  let userType = "member"; 

  if (type === "m") {
    userType = "member";
  } else if (type === "c") {
    userType = "club";
  } else if (type === "sa") {
    userType = "superadmin";
  }

  return (
    <LoginPage userType={userType} />
  );
};