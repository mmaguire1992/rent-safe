function DeleteAccountTab({ onDelete }) {
  return (
    <div className="w-full">
      <div className="bg-[#FEF2F2] border border-[#FFC9C9] rounded-xl p-4">
        <h3 className="text-base font-bold font-nunito text-[#D24343] mb-2">
          Delete Account
        </h3>
        <p className="text-sm font-normal font-nunito text-[#D24343] mb-3">
          Permanently delete your account and all associated data. This action
          cannot be undone. All your properties will be removed.
        </p>
        <div className="flex justify-start">
          <button
            onClick={onDelete}
            className="px-4 sm:px-8  py-3 bg-blueGradient text-white rounded-[10px] text-sm sm:text-base shadow-[0px_2px_10px_0px_#00000033] hover:bg-opacity-90 transition-colors font-bold font-nunito"
          >
            Delete Account Permanently
          </button>
        </div>
      </div>
    </div>
  );
}

export default DeleteAccountTab;
