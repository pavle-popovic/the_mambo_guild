import Link from "next/link";

interface FooterProps {
  className?: string;
}

export default function Footer({ className = "" }: FooterProps) {
  return (
    <footer className={`border-t border-gray-800 bg-black pt-16 pb-8 mt-20 ${className}`}>
      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-12 mb-12">
        <div className="col-span-1 md:col-span-2">
          <Link href="/" className="text-xl font-bold tracking-tight mb-4 block">
            <span className="text-mambo-text">THE MAMBO INN</span>
          </Link>
          <p className="text-gray-500 max-w-sm">
            The world&apos;s first structured salsa academy. We use proven methods to make you a
            better dancer, faster.
          </p>
        </div>
        <div>
          <h4 className="font-bold mb-4 text-mambo-text">Learn</h4>
          <ul className="space-y-2 text-sm text-gray-500">
            <li>
              <Link href="#" className="hover:text-mambo-blue transition">
                Beginner Course
              </Link>
            </li>
            <li>
              <Link href="#" className="hover:text-mambo-blue transition">
                Styling Workshop
              </Link>
            </li>
            <li>
              <Link href="#" className="hover:text-mambo-blue transition">
                Musicality
              </Link>
            </li>
            <li>
              <Link href="/pricing" className="hover:text-mambo-blue transition">
                Pricing
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold mb-4 text-mambo-text">Community</h4>
          <ul className="space-y-2 text-sm text-gray-500">
            <li>
              <Link href="#" className="hover:text-mambo-blue transition">
                Discord Server
              </Link>
            </li>
            <li>
              <Link href="#" className="hover:text-mambo-blue transition">
                Instagram
              </Link>
            </li>
            <li>
              <Link href="#" className="hover:text-mambo-blue transition">
                YouTube
              </Link>
            </li>
            <li>
              <Link href="#" className="hover:text-mambo-blue transition">
                Support
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-6 border-t border-gray-900 pt-8 flex flex-col md:flex-row justify-between text-xs text-gray-600">
        <p>&copy; 2024 The Mambo Inn. Keep dancing.</p>
        <div className="flex gap-4 mt-2 md:mt-0">
          <Link href="#">Privacy Policy</Link>
          <Link href="#">Terms of Service</Link>
        </div>
      </div>
    </footer>
  );
}

