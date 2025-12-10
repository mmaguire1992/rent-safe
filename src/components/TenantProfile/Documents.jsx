import BlueDocumentIcon from "../../svg/blueDocumentIcon";
import SmallCheckIcon from "../../svg/smallCheckIcon";
import WhiteDocumentIcon from "../../svg/whiteDocumentIcon";

function Documents({ documents }) {
  return (
    <div className="bg-lightGrayGradient rounded-[10px] shadow-[0px_0px_40px_0px_#4A4A4A14] border border-lightGray p-6">
      <div className="flex items-center justify-start gap-4 mb-6">
        <span className="bg-[#E8E2FF] rounded-[10px] p-2">
          <BlueDocumentIcon />
        </span>
        <h2 className="text-xl font-bold text-secondary font-nunito mb-0">
          Documents
        </h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {documents.map((doc, index) => (
          <div
            key={index}
            className="border bg-[#EBF4FF] border-white rounded-lg p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center justify-start gap-4 mb-6">
                <span className="bg-[#2177CE] rounded-[10px] p-2">
                  <WhiteDocumentIcon />
                </span>
                <h2 className="text-base font-bold text-secondary font-nunito mb-0">
                  {doc.type}
                </h2>
              </div>
              {doc.verified && (
                <span className="bg-[#DFFFE6] text-[#00893A] px-2 py-1 rounded-full text-base font-normal font-nunito flex items-center gap-1">
                  Verified <SmallCheckIcon />
                </span>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-normal  font-nunito text-darkGray mb-1">
                  Document Number
                </p>
                <p className="font-normal text-base font-nunito text-secondary">
                  {doc.documentNumber}
                </p>
              </div>
              <div>
                <p className="text-sm font-normal  font-nunito text-darkGray mb-1">
                  Expires
                </p>
                <p className="font-normal text-base font-nunito text-secondary">
                  {doc.expires}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Documents;
