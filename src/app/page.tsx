import { Hero } from "@/components/sections/Hero";
import { Ribbon } from "@/components/sections/Ribbon";
import { Course } from "@/components/sections/Course";
import { InvictusQuote } from "@/components/sections/InvictusQuote";
import { Team } from "@/components/sections/Team";
import { Videos } from "@/components/sections/Videos";
import { Schedule } from "@/components/sections/Schedule";
import { Location } from "@/components/sections/Location";
import { Contact } from "@/components/sections/Contact";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export default function HomePage() {
  return (
    <div id="top">
      <a className="skip" href="#main">
        Vai al contenuto
      </a>
      <Header />
      <main id="main" tabIndex={-1}>
        <Hero />
        <Ribbon />
        <Course />
        <InvictusQuote />
        <Team />
        <Videos />
        <Schedule />
        <Location />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
