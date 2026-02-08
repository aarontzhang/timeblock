import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

function getAuthErrorMessage(error: unknown): string {
  const code = (error as { code?: string })?.code;
  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
      return 'incorrect email or password';
    case 'auth/user-not-found':
      return 'no account found with this email';
    case 'auth/email-already-in-use':
      return 'an account with this email already exists';
    case 'auth/weak-password':
      return 'password must be at least 6 characters';
    case 'auth/invalid-email':
      return 'please enter a valid email address';
    case 'auth/too-many-requests':
      return 'too many attempts — please try again later';
    case 'auth/unauthorized-domain':
      return 'this domain is not authorized for sign-in';
    case 'auth/popup-closed-by-user':
      return 'sign-in was cancelled';
    case 'auth/network-request-failed':
      return 'network error — please check your connection';
    default:
      return 'something went wrong — please try again';
  }
}

export function LoginForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { signIn, signUp, signInWithGoogle } = useAuth();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await signIn(email, password);
      } else {
        if (!displayName.trim()) {
          setError('Please enter your name');
          setLoading(false);
          return;
        }
        await signUp(email, password, displayName);
      }
    } catch (err: unknown) {
      setError(getAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSignIn() {
    setError('');
    setLoading(true);
    try {
      await signInWithGoogle();
    } catch (err: unknown) {
      setError(getAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50 px-6">
      <div className="max-w-sm w-full">
        <div className="text-center mb-14">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-neutral-800 mx-auto mb-5 w-8 h-8">
            <line x1="12" y1="12" x2="12" y2="5" />
            <line x1="12" y1="12" x2="17" y2="15" />
          </svg>
          <h1 className="text-sm font-light text-neutral-800 tracking-[0.3em] uppercase">timeblock</h1>
          <p className="text-neutral-500 mt-3 font-light text-xs tracking-wider">track your time, understand your day</p>
        </div>

        <div className="px-2">
          <h2 className="text-sm font-light text-neutral-700 tracking-wider mb-8">
            {isLogin ? 'welcome back' : 'create account'}
          </h2>

          {error && (
            <div className="text-red-500 py-3 mb-5 text-xs font-light tracking-wide">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div>
                <label htmlFor="displayName" className="block text-[11px] font-light text-neutral-600 mb-2 tracking-wider">
                  name
                </label>
                <input
                  id="displayName"
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-0 py-3 border-b border-neutral-200 focus:outline-none focus:border-neutral-400 font-light text-sm text-neutral-800 placeholder:text-neutral-400 bg-transparent transition-colors duration-500"
                  placeholder="your name"
                />
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-[11px] font-light text-neutral-600 mb-2 tracking-wider">
                email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-0 py-3 border-b border-neutral-200 focus:outline-none focus:border-neutral-400 font-light text-sm text-neutral-800 placeholder:text-neutral-400 bg-transparent transition-colors duration-500"
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-[11px] font-light text-neutral-600 mb-2 tracking-wider">
                password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-0 py-3 border-b border-neutral-200 focus:outline-none focus:border-neutral-400 font-light text-sm text-neutral-800 placeholder:text-neutral-400 bg-transparent transition-colors duration-500"
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-neutral-800 text-white py-3.5 px-4 rounded-2xl font-light text-xs tracking-wider disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-500 mt-8"
            >
              {loading ? 'loading' : isLogin ? 'sign in' : 'create account'}
            </button>
          </form>

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-neutral-100" />
              </div>
              <div className="relative flex justify-center">
                <span className="px-4 bg-stone-50 text-neutral-500 font-light text-[11px] tracking-wider">or</span>
              </div>
            </div>

            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="mt-8 w-full flex items-center justify-center gap-3 border border-neutral-200 text-neutral-700 py-3.5 px-4 rounded-2xl font-light text-xs tracking-wider disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-500"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              continue with google
            </button>
          </div>

          <p className="mt-10 text-center text-[11px] text-neutral-500 font-light tracking-wider">
            {isLogin ? "don't have an account? " : 'already have an account? '}
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
              }}
              className="text-neutral-800 font-light transition-colors duration-500"
            >
              {isLogin ? 'sign up' : 'sign in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
