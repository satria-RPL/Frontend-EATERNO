import Image from "next/image";

function Navbar() {
  return (
    <nav className="w-full bg-white sticky top-0 z-50 border-b shadow-sm text-gray-300">
      {/* 
        w-full  : lebar penuh mengikuti kontainer kanan, bukan layar
        sticky top-0 : nempel di atas saat scroll
        z-50   : pastikan navbar di atas konten, tapi tidak tumpang sidebar
      */}

      {/* Container utama navbar */}
      <div className="max-w-full mx-auto flex items-center justify-between px-6 py-3">
        <div className="relative flex h-16 items-center justify-between w-full">
          {/* ================== BAGIAN KIRI: LOGO ================== */}
          <div className="text-gray-800 font-bold text-lg">
            <Image
              src="/icon/brand.svg"
              width={80}
              height={80}
              alt=""
              className="h-fit w-fit object-cover"
            />
          </div>

          {/* ================== TENGAH: SEARCH BAR ==================
          <div className="hidden sm:block flex-1 max-w-md mx-8">
            <div className="relative">
              <input
                type="text"
                placeholder="Search Anything Here..."
                className="w-full border border-gray-300 rounded-xl pl-10 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 justify-end">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z"
                  />
                </svg>
              </span>
            </div>
          </div> */}

          {/* ================== KANAN: NOTIFIKASI & PROFIL ================== */}
          <div className="flex items-center gap-5">
            <button
              type="button"
              className="relative p-3 bg-white rounded-full hover:bg-orange-200 border-2 border-gray-100 transition"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="25"
                height="25"
                viewBox="0 0 27 29"
                fill="none"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M2.90724 10.5C2.90724 7.71523 4.01349 5.04451 5.98262 3.07538C7.95175 1.10625 10.6225 0 13.4072 0C16.192 0 18.8627 1.10625 20.8319 3.07538C22.801 5.04451 23.9072 7.71523 23.9072 10.5V16.146L26.6402 21.612C26.7661 21.8636 26.8255 22.1431 26.8128 22.4241C26.8002 22.7051 26.7159 22.9782 26.568 23.2175C26.4201 23.4568 26.2135 23.6543 25.9678 23.7912C25.7222 23.9282 25.4455 24 25.1642 24H19.2182C18.8846 25.2874 18.1329 26.4275 17.0811 27.2414C16.0294 28.0553 14.7371 28.4969 13.4072 28.4969C12.0773 28.4969 10.7851 28.0553 9.73335 27.2414C8.6816 26.4275 7.9299 25.2874 7.59624 24H1.65024C1.36896 24 1.09234 23.9282 0.846645 23.7912C0.600953 23.6543 0.394351 23.4568 0.246462 23.2175C0.0985726 22.9782 0.0143066 22.7051 0.00166693 22.4241C-0.0109727 22.1431 0.0484338 21.8636 0.174244 21.612L2.90724 16.146V10.5ZM10.8092 24C11.0726 24.456 11.4513 24.8347 11.9073 25.098C12.3634 25.3613 12.8807 25.4999 13.4072 25.4999C13.9338 25.4999 14.4511 25.3613 14.9072 25.098C15.3632 24.8347 15.7419 24.456 16.0052 24H10.8092ZM13.4072 3C11.4181 3 9.51047 3.79018 8.10394 5.1967C6.69742 6.60322 5.90724 8.51088 5.90724 10.5V16.146C5.90721 16.6115 5.79885 17.0706 5.59074 17.487L3.83574 21H22.9802L21.2252 17.487C21.0166 17.0707 20.9077 16.6116 20.9072 16.146V10.5C20.9072 8.51088 20.1171 6.60322 18.7105 5.1967C17.304 3.79018 15.3964 3 13.4072 3Z"
                  fill="black"
                  fillOpacity="0.35"
                />
              </svg>
            </button>
            <Image
              src="/img/profil.png"
              width={100}
              height={100}
              alt=""
              className="h-fit w-fit object-cover"
            />
            <div className="">
              <div className="font-bold text-black">Username</div>
              <span>Kasir</span> 20.00
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
