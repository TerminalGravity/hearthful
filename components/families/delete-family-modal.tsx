import Modal from "@/components/shared/modal";
import { Dispatch, SetStateAction } from "react";

interface DeleteFamilyModalProps {
  showModal: boolean;
  setShowModal: Dispatch<SetStateAction<boolean>>;
  familyName: string;
  isDeleting: boolean;
  onConfirm: () => void;
}

export default function DeleteFamilyModal({
  showModal,
  setShowModal,
  familyName,
  isDeleting,
  onConfirm,
}: DeleteFamilyModalProps) {
  return (
    <Modal showModal={showModal} setShowModal={setShowModal}>
      <div className="w-full overflow-hidden md:max-w-md md:rounded-2xl md:border md:border-gray-100 md:shadow-xl">
        <div className="flex flex-col items-center justify-center space-y-3 bg-white px-4 py-6 pt-8 text-center md:px-16">
          <h3 className="font-display text-2xl font-bold">Delete Family Group</h3>
          <p className="text-sm text-gray-500">
            Are you sure you want to delete <span className="font-semibold">{familyName}</span>? This action cannot be undone.
          </p>
          <div className="flex w-full justify-end space-x-2 pt-4">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              disabled={isDeleting}
              className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-black"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isDeleting}
              className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
            >
              {isDeleting ? "Deleting..." : "Delete Family"}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
} 