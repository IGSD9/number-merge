import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-950 px-4 py-12 text-white">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight">Number Merge</h1>
        <p className="mt-2 text-sm text-gray-400">ログインしてスコアを保存・ランキングに参加</p>
      </header>

      <LoginForm />
    </div>
  );
}
