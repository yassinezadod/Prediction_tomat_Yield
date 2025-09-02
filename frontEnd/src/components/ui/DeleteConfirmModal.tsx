import { Modal } from "./modal";
import Button from "./button/Button"

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  email?: string;
}

export default function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  email,
}: DeleteConfirmModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-md p-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
        ⚠️ Confirmation de suppression
      </h2>
      <p className="mt-3 text-sm text-gray-600 dark:text-gray-300">
        Êtes-vous sûr de vouloir supprimer cet utilisateur ?
      </p>
      <p className="mt-2 text-sm font-medium text-red-600">Email: {email}</p>
      <p className="mt-1 text-xs text-gray-500">
        Cette action est <strong>irréversible</strong>.
      </p>

      <div className="mt-6 flex justify-end gap-3">
        <Button variant="outline" onClick={onClose}>
          Annuler
        </Button>
        <Button  onClick={onConfirm}>
          Supprimer
        </Button>
      </div>
    </Modal>
  );
}
