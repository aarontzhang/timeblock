import { useAuth } from '../../contexts/AuthContext';

export function Header() {
  const { userProfile, logout } = useAuth();

  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">TimeBlock</h1>

        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">
            {userProfile?.displayName}
          </span>
          <button
            onClick={logout}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Sign out
          </button>
        </div>
      </div>
    </header>
  );
}
