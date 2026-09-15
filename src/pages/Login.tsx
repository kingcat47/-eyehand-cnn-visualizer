import LoginModal from "@/components/auth";
import { Authlayout } from "@/components/layout";
import { Header } from "@/components/ui";


export default function LoginPage() {
  return (
    <>
    <Header/>
    <Authlayout>
      <LoginModal/>
    </Authlayout>
    </>
  )
}
