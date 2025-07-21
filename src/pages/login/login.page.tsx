import { LoginForm } from "@/components/login-form";
import { environment } from "@/config";

export default function LoginPage() {
  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <a href="#" className="flex items-center gap-2 self-center font-medium">
          <div className=" flex size-6 items-center justify-center rounded-md">
            <img
              src={environment.DEALERSHIP.LOGO}
              alt={environment.DEALERSHIP.NAME}
              className="size-8 rounded-lg"
            />
          </div>
          {environment.DEALERSHIP.NAME}
        </a>
        <LoginForm />
      </div>
    </div>
  );
}
