import { logout } from "../../auth/login/actions";

export default function DashboardPage() {
  return (
    <div>
        <form action={logout}>
          <button
            type="submit"
            className="text-sm px-3 py-1 border rounded"
          >
            Logout
          </button>
        </form>

      <main className="p-4">
        <p>Selamat datang di dashboard dummy 🎉</p>
      </main>
    </div>
  );
}
