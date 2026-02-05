import Badge from "./Badge";
import Button from "./Button";
import StarIcon from "@/svg/websiteSvg/starIcon";


function ProfileSection() {
  return (
    <section className="w-full pt-10 md:pt-14 lg:pt-16">
      <div className="bg-blueGradient">
        <div className="container mx-auto">
          <div className="flex flex-col lg:flex-row items-center py-4 lg:py-0">
            <div className="order-2 md:order-1 w-full text-center md:text-left mt-6 md:mt-0 lg:w-1/2 px-4 sm:px-6 lg:px-8 flex flex-col justify-center space-y-4 ">
              <span className="bg-[#FFFFFF33] border border-[#6B4EFF33] rounded-2xl py-3 px-4 inline-flex items-center justify-center gap-2 mx-auto md:mx-0 text-white uppercase text-sm font-semibold font-nunito max-w-[290px]">
                <StarIcon /> JOINED 10,000+ VERIFIED USERS
              </span>
              <h2 className="text-xl md:text-2xl lg:text-4xl font-bold text-white text-text-light leading-tight">
                Create a profile to showcase to potential agents
              </h2>

              <p className="text-base md:text-lg !text-white max-w-2xl font-nunito">
                Join thousands of renters and property owners who trust RentEase
                for their rental needs
              </p>

              <div className="!mt-4">
                <button className="px-6 py-3 w-full md:w-auto rounded-lg font-bold font-nunito transition-all duration-200 bg-white  text-[#4A2FCC] ">
                  Explore Services
                </button>
              </div>
            </div>
            <div className="order-1 md:order-2 w-full lg:w-1/2  lg:-mt-10 -mt-0">
              <img
                src="/images/website/profile-section-image.png"
                alt="Modern house"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ProfileSection;
