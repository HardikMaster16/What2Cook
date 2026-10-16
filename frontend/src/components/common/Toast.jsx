
import { CheckCircle2, CircleAlert, X } from "lucide-react";

function Toast({ type = "success", message, onClose }) {
  if (!message) return null;

  const isSuccess = type === "success";

  return (
    <div
      role={isSuccess ? "status" : "alert"}
      className={`fixed right-5 top-5 z-50 flex w-[calc(100%-2.5rem)] max-w-md items-start gap-3 rounded-xl border p-4 shadow-lg ${
        isSuccess
          ? "border-green-200 bg-green-50 text-green-900"
          : "border-red-200 bg-red-50 text-red-900"
      }`}
    >
      {isSuccess ? (
        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
      ) : (
        <CircleAlert className="mt-0.5 h-5 w-5 shrink-0" />
      )}

      <p className="flex-1 text-sm font-medium">{message}</p>

      <button
        type="button"
        onClick={onClose}
        aria-label="Dismiss notification"
        className="rounded-md p-1 hover:bg-black/5"
      >
        <X size={18} />
      </button>
    </div>
  );
}

export default Toast;
