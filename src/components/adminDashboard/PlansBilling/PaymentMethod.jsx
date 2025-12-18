import { FiCreditCard, FiPlus } from "react-icons/fi";

function PaymentMethod({ paymentMethod, onAddCard, onUpdate }) {
  return (
    <div className="bg-white rounded-[20px] border border-lightGray p-6">
      <h2 className="text-xl font-bold font-nunito text-secondary mb-4">
        Payment Method
      </h2>

      {paymentMethod ? (
        <div className="flex flex-col md:flex-row bg-[#F8FAFC] border border-lightGray rounded-[10px] p-4 md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blueGradient rounded-2xl flex items-center justify-center">
              <FiCreditCard className="text-2xl text-white" />
            </div>
            <div>
              <p className="text-base font-semibold font-nunito text-secondary mb-1">
                {paymentMethod.cardNumber}
              </p>
              <p className="text-sm font-normal font-nunito text-darkGray">
                Expires {paymentMethod.expiryDate}
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={onUpdate}
              className="p-0 text-[#00893A] rounded-lg hover:bg-green-700 transition-colors font-semibold font-nunito"
            >
              Update
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <p className="text-base font-normal font-nunito text-darkGray">
            No payment method added
          </p>
        </div>
      )}
      <div className="mt-6 block">
        {" "}
        <button
          onClick={onAddCard}
          className="flex items-center gap-2 px-4 py-1.5 border-2 border-[#6B4EFF] text-[#6B4EFF] rounded-[10px] transition-colors font-semibold font-nunito"
        >
          <span>Add New Card</span> <FiPlus />
        </button>
      </div>
    </div>
  );
}

export default PaymentMethod;
