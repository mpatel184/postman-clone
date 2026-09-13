import Image from "next/image";
import { currentUser } from "@/modules/authentication/actions";
import UserButton from "@/modules/authentication/components/user-button";
export default async function Home() {
  const user = await currentUser()
  return (
    <div className="flex justify-center items-center h-screen">
      {/* <UserButton user={user} /> */}
    </div>
  )
}
