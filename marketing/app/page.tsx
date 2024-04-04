export default function Home() {
  return (
    <div>
      {/* Hero header section */}
      <div className="flex flex-col items-center ">
        <div className="inline-flex h-[1184px] w-screen flex-col items-center justify-start bg-gray-50">
          <div className="flex h-20 w-screen items-center justify-center ">
            <div className="inline-flex h-20 flex-col items-center justify-center">
              <div className="flex w-full items-center justify-between px-8">
                <div className="flex items-center justify-start gap-10">
                  <div className="flex h-8 items-center justify-center gap-2.5">
                    <div className="inline-flex items-start justify-start shadow">
                      <div className="relative h-8 w-8 rounded-lg border border-gray-300 bg-gradient-to-b from-white to-gray-300">
                        <div className="absolute left-0 top-0 h-8 w-8"></div>
                        <div className="absolute left-[8px] top-[8px] h-4 w-4 rounded-full bg-gradient-to-tr from-gray-900 to-gray-700 shadow"></div>
                        <div className="absolute left-0 top-[16px] h-4 w-8 rounded-bl-lg rounded-br-lg bg-opacity-20 backdrop-blur-[5px]"></div>
                      </div>
                    </div>
                    <span className="">carbon</span>
                  </div>
                  <div className="flex gap-4">
                    <div className="text-base font-semibold leading-normal text-slate-600">
                      Home
                    </div>
                    <div className="text-base font-semibold leading-normal  text-slate-600">
                      Products
                    </div>
                    <div className="text-base font-semibold leading-normal text-slate-600">
                      Resources
                    </div>
                    <div className="text-base font-semibold  leading-normal text-slate-600">
                      Pricing
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-center gap-1.5 rounded-lg border border-gray-500 bg-gray-500 px-4 py-2.5 shadow">
                  <div className="flex items-center justify-center px-0.5">
                    <div className="text-base font-semibold leading-normal text-white">
                      Log in
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-center justify-start gap-16 self-stretch py-24">
            <div className="flex  flex-col items-center justify-start gap-8 self-stretch px-8">
              <div className="flex  flex-col items-center justify-start gap-12 self-stretch">
                <div className="flex flex-col items-center justify-center gap-6">
                  <div className="max-w-2xl text-center text-6xl font-semibold leading-[72px] text-gray-900">
                    Open Source ERP to power your business
                  </div>
                  <div className="self-stretch text-center text-xl font-normal leading-[30px]  text-slate-600">
                    Carbon is cloud manufacturing software that helps you make
                    better decisions faster.
                  </div>
                </div>
                <div className="inline-flex items-start justify-start gap-3">
                  <div className="flex items-center justify-center gap-2.5 rounded-lg border border-gray-300 bg-white px-[22px] py-4 shadow">
                    <div className="relative h-6 w-6"></div>
                    <div className="flex items-center justify-center px-0.5">
                      <div className="text-lg font-semibold leading-7  text-slate-700">
                        Demo
                      </div>
                    </div>
                    <div className="relative h-6 w-6"></div>
                  </div>
                  <div className="flex items-center justify-center gap-2.5 rounded-lg border border-zinc-500 bg-zinc-500 px-[22px] py-4 shadow">
                    <div className="flex items-center justify-center px-0.5">
                      <div className="text-lg font-semibold leading-7  text-white">
                        Sign up
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex h-[512px] flex-col items-center justify-start gap-8 self-stretch px-8">
              <div className="flex h-[512px] flex-col items-center justify-start self-stretch">
                <div className="relative h-[512px] w-[768px] rounded-[10px] border-4 border-gray-900">
                  <div className="absolute left-[28px] top-0 h-[512px] w-[712px] bg-black shadow"></div>
                  <img
                    className="absolute left-0 top-0 h-[512px] w-[768px] rounded-[10px]"
                    src="https://via.placeholder.com/768x512"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
