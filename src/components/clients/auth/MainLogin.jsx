import LoginForm from "@/components/Global/Forms/LoginForm";
import Image from "next/image";
import Link from "next/link";

export default function MainLogin() {
  return (
    <div className="h-screen overflow-hidden flex gap-0 bg-black" data-auth-page="true">
      <div className="flex-1 bg-background relative overflow-y-auto min-h-0">
        {/* Main background image behind the form */}
        <Image
          src="/images/main-bg.png"
          alt="Background"
          width={"12000"}
          height={"12000"}
          className="absolute inset-0 w-full h-full object-cover"
        />

        <div className="relative z-10 flex flex-col h-full">
          <div className="px-5 pt-5">
            <Link href="/">
              <Image
                src={"/images/logo.png"}
                alt="Logo"
                width={"70"}
                height={"100"}
              />
            </Link>
          </div>

          <div className="flex-1 flex items-center justify-center px-8 lg:px-12">
            <LoginForm />
          </div>
        </div>
      </div>

      <div className="hidden lg:flex flex-1 relative h-screen overflow-hidden bg-black">
        {/* Main background image */}
        <Image
          src="/images/c1.webp"
          alt="Background"
          width={"12000"}
          height={"12000"}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div
          className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-foreground/10 to-transparent"
          aria-hidden="true"
        />

        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 text-center text-white">
          <h2 className="text-2xl font-light mb-1">Welcome to AiNDREA</h2>
          <p className="text-sm lg:text-base opacity-80 max-w-md">
            Your AI-powered creative platform for creators and clients
          </p>
        </div>
      </div>
    </div>
  );
}
