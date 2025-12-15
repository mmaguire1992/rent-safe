function DeleteAccountTab({ onDelete }) {
  return (
    <div className="max-w-2xl">
      <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6">
        <h3 className="text-xl font-bold font-nunito text-red-700 mb-3">
          Delete Account
        </h3>
        <p className="text-base font-normal font-nunito text-red-600 mb-6">
          Permanently delete your account and all associated data. This action
          cannot be undone. All your properties will be removed.
        </p>
        <div className="flex justify-center">
          <button
            onClick={onDelete}
            className="px-8 py-3 bg-[#6B4EFF] text-white rounded-lg hover:bg-opacity-90 transition-colors font-semibold font-nunito"
          >
            Delete Account Permanently
          </button>
        </div>
      </div>
    </div>
  );
}

export default DeleteAccountTab;





