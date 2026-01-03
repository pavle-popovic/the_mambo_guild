"use client";

import Link from "next/link";
import Image from "next/image";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { FaInstagram, FaYoutube, FaTrophy, FaMusic } from "react-icons/fa";

export default function InstructorsPage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-mambo-dark">
      <NavBar user={user || undefined} />

      <div className="max-w-7xl mx-auto px-8 py-20 pt-28">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-extrabold mb-6 text-mambo-text">
            Meet Your Instructors
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Learn from world-class dancers who have dedicated their lives to mastering salsa on2
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
          {/* Main Instructor Card */}
          <div className="bg-mambo-panel border border-gray-800 rounded-2xl overflow-hidden hover:border-gray-700 transition">
            <div className="relative h-80 bg-gradient-to-br from-mambo-blue/20 to-purple-600/20 overflow-hidden">
              <Image
                src="/assets/Personal_Pic.jpg"
                alt="Pavle Popovic"
                fill
                className="object-cover object-center"
                style={{ objectPosition: 'center 30%' }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
            </div>
            
            <div className="p-8">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-mambo-text mb-1">Pavle Popovic</h2>
                  <p className="text-mambo-blue font-semibold">Lead Instructor & Founder</p>
                </div>
                <div className="flex gap-3">
                  <a
                    href="https://www.instagram.com/pavlepopovic204/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center text-gray-400 hover:text-mambo-blue transition"
                    aria-label="Instagram"
                  >
                    <FaInstagram />
                  </a>
                  <a
                    href="#"
                    className="w-10 h-10 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center text-gray-400 hover:text-mambo-blue transition"
                    aria-label="YouTube"
                  >
                    <FaYoutube />
                  </a>
                </div>
              </div>

              <p className="text-gray-400 mb-6 leading-relaxed">
                With 10 years of experience in salsa on2, Pavle combines his passion for dance
                with expertise in learning design. As a certified Learning Experience Designer (LXD),
                he has collaborated with leading experts to study motor pattern learning and dance
                training methodologies, bringing evidence-based teaching approaches to his students.
              </p>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-mambo-gold shrink-0">
                    <FaTrophy className="text-lg" />
                  </div>
                  <div>
                    <h3 className="font-bold text-mambo-text mb-1">Certified LXD</h3>
                    <p className="text-sm text-gray-500">
                      Certified Learning Experience Designer with a focus on motor pattern learning
                      and dance training. Collaborates with experts to develop effective teaching
                      methodologies.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-mambo-blue shrink-0">
                    <FaMusic className="text-lg" />
                  </div>
                  <div>
                    <h3 className="font-bold text-mambo-text mb-1">Research-Based Teaching</h3>
                    <p className="text-sm text-gray-500">
                      Combines 10 years of dance experience with scientific research on motor pattern
                      learning to create structured, effective training programs that help students
                      progress faster and more efficiently.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-800">
                <p className="text-sm text-gray-500 italic">
                  &quot;Dancing is not just about steps—it&apos;s about connection, musicality, and
                  expressing yourself through movement. My goal is to help you find your own voice
                  on the dance floor.&quot;
                </p>
              </div>
            </div>
          </div>

          {/* Additional Instructors Section */}
          <div className="space-y-6">
            <div className="bg-mambo-panel border border-gray-800 rounded-xl p-6">
              <h3 className="text-xl font-bold text-mambo-text mb-4">Join Our Team</h3>
              <p className="text-gray-400 mb-4 text-sm leading-relaxed">
                We&apos;re always looking for passionate instructors who share our vision of
                making quality salsa education accessible to everyone.
              </p>
              <Link
                href="#"
                className="inline-block px-6 py-3 bg-mambo-blue hover:bg-blue-600 text-white font-bold rounded-lg transition text-sm"
              >
                Apply to Teach
              </Link>
            </div>

            <div className="bg-mambo-panel border border-gray-800 rounded-xl p-6">
              <h3 className="text-xl font-bold text-mambo-text mb-4">Guest Instructors</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Throughout the year, we host workshops with internationally renowned salsa
                instructors, bringing you diverse perspectives and advanced techniques from around
                the world.
              </p>
            </div>

            <div className="bg-gradient-to-br from-mambo-blue/10 to-purple-600/10 border border-mambo-blue/30 rounded-xl p-6">
              <h3 className="text-lg font-bold text-mambo-text mb-2">Want to Learn More?</h3>
              <p className="text-gray-400 text-sm mb-4">
                Check out our courses and start your journey with us today.
              </p>
              <Link
                href="/courses"
                className="inline-block px-6 py-2 bg-mambo-blue hover:bg-blue-600 text-white font-bold rounded-lg transition text-sm"
              >
                Explore Courses
              </Link>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

