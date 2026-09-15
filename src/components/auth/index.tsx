import { Button, Spacing, Typo } from "@/components/ui";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import s from "./styles.module.scss";

export type SnsProvider = "google" | "kakao" | "naver";

interface LoginModalProps {
  providers?: SnsProvider[];
  showPhoneLogin?: boolean;
}

const providerConfig: Record<
  SnsProvider,
  { icon: string; label: string; className: string }
> = {
  google: { icon: "/google.svg", label: "구글로 시작하기", className: s.google_button },
  kakao: { icon: "/kakao.svg", label: "카카오톡으로 시작하기", className: s.kakao_button },
  naver: { icon: "/naver.svg", label: "네이버로 시작하기", className: s.naver_button },
};

export default function LoginModal({ providers = ["google", "kakao", "naver"], showPhoneLogin = false }: LoginModalProps) {
  return (
    <>
      <div className={s.container}>
        <img src="/partiz.svg" alt="logo" width="111" height="32" />
        <Spacing size={12} />
        <div className={s.login_container}>
        </div>
        {providers.map((provider) => {
          const { icon, label, className } = providerConfig[provider];
          return (
            <Button
              key={provider}
              size="large"
              variant="secondary"
              fullWidth
              className={className}
              leadingIcon={
                <img src={icon} alt={provider} style={{ width: "20px", height: "20px" }} />
              }
              onClick={() => console.log(`${provider} login`)}
            >
              {label}
            </Button>
          );
        })}

        </div>
        {showPhoneLogin && (
          <>
            <Spacing size={8} />
            <Link to="/auth/login" className={s.number_container}>
              <Typo.BodyLarge>전화번호로 시작하기</Typo.BodyLarge> <ChevronRight size={21} />
            </Link>
          </>
        )}
      </>
  );
}