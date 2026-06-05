import { Home } from "lucide-react";

interface HomeConfirmModalProps {
  onConfirm: () => void;
  onCancel: () => void;
}

export function HomeConfirmModal({ onConfirm, onCancel }: HomeConfirmModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-gray-900 p-6 text-center text-white shadow-xl">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-800">
          <Home className="h-6 w-6 text-gray-300" />
        </div>
        <h2 className="text-xl font-bold">ホームに戻りますか？</h2>
        <p className="mt-3 text-sm leading-relaxed text-gray-400">
          現在のゲームはリセットされます。
          <br />
          このまま続けますか？
        </p>

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-xl border border-gray-700 px-4 py-3 font-semibold text-gray-300 transition-colors hover:bg-gray-800"
          >
            キャンセル
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 rounded-xl bg-indigo-500 px-4 py-3 font-semibold transition-colors hover:bg-indigo-400"
          >
            ホームに戻る
          </button>
        </div>
      </div>
    </div>
  );
}
