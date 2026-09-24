import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import Icon from "../../components/Icon.jsx";
import { useAdminAuth } from "../AdminAuth.jsx";
import { Spinner } from "../ui/states.jsx";

export default function Login() {
  const { status, login } = useAdminAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || "/admin";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  if (status === "authed") return <Navigate to={from} replace />;

  const submit = async (e) => {
    e.preventDefault();
    if (busy) return;
    setError(null);
    setBusy(true);
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err?.message || "Sign in failed. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink-950 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-[12px] bg-accent-600 text-white">
            <Icon name="store" size={22} />
          </span>
          <h1 className="mt-4 font-display text-[1.375rem] font-extrabold tracking-[-0.02em] text-white">
            SmartphoneCafe Admin
          </h1>
          <p className="mt-1 text-[0.875rem] text-ink-400">Sign in to manage the site</p>
        </div>

        <form
          onSubmit={submit}
          noValidate
          className="rounded-[var(--radius-lg)] bg-white p-6 shadow-[var(--shadow-deep)]"
        >
          {error ? (
            <div className="mb-4 flex items-start gap-2 rounded-[var(--radius-md)] border border-red-500/30 bg-red-50 px-3.5 py-2.5 text-[0.875rem] text-red-700">
              <Icon name="alert" size={16} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          ) : null}

          <label htmlFor="email" className="text-[0.8125rem] font-semibold text-ink-700">
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={busy}
            className="mt-1.5 mb-4 w-full rounded-[var(--radius-md)] border border-line bg-white px-3.5 py-2.5 text-[0.9375rem] text-ink-900 outline-none focus:border-accent-400 focus:ring-2 focus:ring-accent-100"
          />

          <label htmlFor="password" className="text-[0.8125rem] font-semibold text-ink-700">
            Password
          </label>
          <div className="relative mt-1.5">
            <input
              id="password"
              type={showPw ? "text" : "password"}
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={busy}
              className="w-full rounded-[var(--radius-md)] border border-line bg-white px-3.5 py-2.5 pr-10 text-[0.9375rem] text-ink-900 outline-none focus:border-accent-400 focus:ring-2 focus:ring-accent-100"
            />
            <button
              type="button"
              onClick={() => setShowPw((s) => !s)}
              aria-label={showPw ? "Hide password" : "Show password"}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-700"
            >
              <Icon name={showPw ? "eyeOff" : "eye"} size={18} />
            </button>
          </div>

          <button
            type="submit"
            disabled={busy}
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-[var(--radius-md)] bg-accent-600 px-5 py-2.5 text-[0.9375rem] font-semibold text-white transition-colors hover:bg-accent-700 disabled:opacity-60"
          >
            {busy ? <Spinner size={17} /> : <Icon name="lock" size={17} />}
            Sign in
          </button>
        </form>
      </div>
    </div>
  );
}
