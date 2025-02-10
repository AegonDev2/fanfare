import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { Search } from "lucide-react";

const Landing = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  const slides = [
    {
      src: "https://storage.googleapis.com/a1aa/image/nEyyMJHY73DoGPRrtOSXC1KvCAwbILiKV78pvYqeexs.jpg",
      alt: "Advertisement banner for Sponsor 1 featuring a new product launch"
    },
    {
      src: "https://storage.googleapis.com/a1aa/image/M5nq5Hez3ef78AaLPSm-YJrIxUoHWGsaayDw16JqaCE.jpg",
      alt: "Advertisement banner for Sponsor 2 featuring a discount offer"
    },
    {
      src: "https://storage.googleapis.com/a1aa/image/Z2Kqw4XzbQzPaXB2LzQB4Rce-FMmCB0pAxCN5JOjxo0.jpg",
      alt: "Advertisement banner for Sponsor 3 featuring a special event"
    }
  ];

  const influencers = [
    {
      id: "1",
      name: "Jane Doe",
      category: "Beauty, Lifestyle",
      image: "https://storage.googleapis.com/a1aa/image/XZap5acURHVhX1bOw4h9xVM_CSgwW4lMTY9IVmySNr0.jpg"
    },
    {
      id: "2",
      name: "John Smith",
      category: "Gaming, Tech",
      image: "https://storage.googleapis.com/a1aa/image/R4lTF1BSiN2peiSedQ_j1g5qFHHgy0X5xpVXws3Wo1g.jpg"
    },
    {
      id: "3",
      name: "Emily Johnson",
      category: "Travel, Photography",
      image: "https://storage.googleapis.com/a1aa/image/e6eeDEu88nkMhxxbqL65Yf_1XJjeRTGffPUCWBak9Vc.jpg"
    }
  ];

  const gifts = [
    {
      name: "Stylish Handbag",
      price: "$49.99",
      image: "https://storage.googleapis.com/a1aa/image/ti84hphytV7QmWZbpAiDQTtHxz4Qsw7-Wf99DSn3DH8.jpg"
    },
    {
      name: "Gaming Headset",
      price: "$79.99",
      image: "https://storage.googleapis.com/a1aa/image/pLNeJ8LcljztHIanr9TuTSpnh7ilkb3zKl3EmL_sAH8.jpg"
    },
    {
      name: "Travel Backpack",
      price: "$59.99",
      image: "https://storage.googleapis.com/a1aa/image/3w2Nb6lAZ73GNHF_EsRxGE_8ei1THVU1GsAxp-BQ494.jpg"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <div className="min-h-screen bg-gray-100 font-roboto">
      <header className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Fan Fare</h1>
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate("/auth")}>
              Sign In
            </Button>
            <Button variant="outline" className="md:hidden" onClick={() => setMenuOpen(!menuOpen)}>
              <i className="fas fa-bars text-2xl"></i>
            </Button>
          </div>
          {menuOpen && (
            <nav className="absolute top-16 right-4 bg-white shadow-lg rounded-lg p-4 space-y-2 z-50">
              <div className="space-y-2">
                <Button variant="ghost" className="w-full justify-start">Home</Button>
                <Button variant="ghost" className="w-full justify-start">Profile</Button>
                <Button variant="ghost" className="w-full justify-start">Track Order</Button>
                <Button variant="ghost" className="w-full justify-start">Settings</Button>
              </div>
            </nav>
          )}
        </div>
      </header>

      <div className="container mx-auto px-4 py-4">
        <div className="relative w-full overflow-hidden rounded-lg shadow-lg h-64">
          {slides.map((slide, index) => (
            <div
              key={index}
              className={`absolute w-full h-full transition-opacity duration-500 ${
                index === currentSlide ? "opacity-100" : "opacity-0"
              }`}
            >
              <img
                src={slide.src}
                alt={slide.alt}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
          <Button
            variant="secondary"
            className="absolute top-1/2 left-4 -translate-y-1/2 rounded-full p-2"
            onClick={() => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)}
          >
            <i className="fas fa-chevron-left"></i>
          </Button>
          <Button
            variant="secondary"
            className="absolute top-1/2 right-4 -translate-y-1/2 rounded-full p-2"
            onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)}
          >
            <i className="fas fa-chevron-right"></i>
          </Button>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8">
        <section className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
            <h2 className="text-xl font-semibold text-gray-800">Discover Influencers</h2>
            <div className="relative w-full md:w-auto">
              <Input
                className="w-full md:w-64"
                placeholder="Search Influencers"
                type="text"
              />
              <Search className="absolute right-2 top-2.5 h-5 w-5 text-gray-500" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {influencers.map((influencer, index) => (
              <div key={index} className="bg-white p-3 rounded-lg shadow-md">
                <img
                  src={influencer.image}
                  alt={`${influencer.name}'s profile`}
                  className="w-full h-32 object-cover rounded-lg"
                />
                <div className="mt-2">
                  <h3 className="text-sm font-semibold text-gray-800">{influencer.name}</h3>
                  <p className="text-xs text-gray-600">{influencer.category}</p>
                  <Button 
                    size="sm" 
                    className="mt-2 w-full text-xs"
                    onClick={() => navigate(`/profile/${influencer.id}`)}
                  >
                    View Profile
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
            <h2 className="text-xl font-semibold text-gray-800">Gift Selection</h2>
            <div className="relative w-full md:w-auto">
              <Input
                className="w-full md:w-64"
                placeholder="Search Gifts"
                type="text"
              />
              <Search className="absolute right-2 top-2.5 h-5 w-5 text-gray-500" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {gifts.map((gift, index) => (
              <div key={index} className="bg-white p-3 rounded-lg shadow-md">
                <img
                  src={gift.image}
                  alt={gift.name}
                  className="w-full h-32 object-cover rounded-lg"
                />
                <div className="mt-2">
                  <h3 className="text-sm font-semibold text-gray-800">{gift.name}</h3>
                  <p className="text-xs text-gray-600">{gift.price}</p>
                  <Button size="sm" variant="secondary" className="mt-2 w-full text-xs">Gift This</Button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Order Tracking</h2>
          <div className="bg-white p-4 rounded-lg shadow-md">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Order #12345</h3>
                <p className="text-gray-600">
                  Status: <span className="text-yellow-500">Pending Approval</span>
                </p>
              </div>
              <Button>View Details</Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-white shadow-md mt-8">
        <div className="container mx-auto px-4 py-4 text-center text-gray-600">
          © 2023 Fan Fare. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default Landing;
