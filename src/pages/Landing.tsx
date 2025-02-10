
import Header from "@/components/landing/Header";
import HeroCarousel from "@/components/landing/HeroCarousel";
import InfluencerSection from "@/components/landing/InfluencerSection";
import GiftSection from "@/components/landing/GiftSection";
import OrderTrackingSection from "@/components/landing/OrderTrackingSection";

interface LandingProps {
  setNavOpen: (isOpen: boolean) => void;
}

const Landing = ({ setNavOpen }: LandingProps) => {
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
    },
    {
      id: "4",
      name: "Alex Rivera",
      category: "Fitness, Health",
      image: "https://images.unsplash.com/photo-1582562124811-c09040d0a901"
    },
    {
      id: "5",
      name: "Sarah Chen",
      category: "Fashion, Style",
      image: "https://images.unsplash.com/photo-1721322800607-8c38375eef04"
    },
    {
      id: "6",
      name: "Mike Wilson",
      category: "Food, Cooking",
      image: "https://images.unsplash.com/photo-1498936178812-4b2e558d2937"
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
    },
    {
      name: "Smart Watch",
      price: "$199.99",
      image: "https://images.unsplash.com/photo-1501286353178-1ec881214838"
    },
    {
      name: "Wireless Earbuds",
      price: "$129.99",
      image: "https://images.unsplash.com/photo-1469041797191-50ace28483c3"
    },
    {
      name: "Digital Camera",
      price: "$399.99",
      image: "https://images.unsplash.com/photo-1582562124811-c09040d0a901"
    }
  ];

  return (
    <div className="min-h-screen w-full bg-gray-100 font-roboto">
      <Header setNavOpen={setNavOpen} />
      <div className="pt-16"> {/* Add padding to account for fixed header */}
        <HeroCarousel slides={slides} />
        <main className="container mx-auto py-8 px-4 sm:px-6 lg:px-8 max-w-7xl">
          <InfluencerSection influencers={influencers} />
          <GiftSection gifts={gifts} />
          <OrderTrackingSection />
        </main>
        <footer className="bg-white shadow-md mt-8">
          <div className="container mx-auto px-4 py-4 text-center text-gray-600">
            © 2023 Fan Fare. All rights reserved.
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Landing;
