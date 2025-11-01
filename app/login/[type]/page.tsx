import LoginPage from '@/components/common/login'

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