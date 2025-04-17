export function FooterComponent() {
  return (
    <footer className="py-6 bg-gray-100">
      <div className="container px-4 mx-auto">
        {/* Top Section */}
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <h2 className="text-2xl font-bold text-gray-800">Agrotech</h2>
          <ul className="flex gap-6 text-sm text-gray-600">
            <li>
              <a href="/about" className="transition hover:text-gray-800">
                About Us
              </a>
            </li>
            <li>
              <a href="/contact" className="transition hover:text-gray-800">
                Contact
              </a>
            </li>
            <li>
              <a href="/privacy" className="transition hover:text-gray-800">
                Privacy Policy
              </a>
            </li>
            <li>
              <a href="/terms" className="transition hover:text-gray-800">
                Terms of Service
              </a>
            </li>
          </ul>
        </div>

        {/* Divider */}
        <div className="my-4 border-t border-gray-300"></div>

        {/* Bottom Section */}
        <div className="text-sm text-center text-gray-500">
          &copy; {new Date().getFullYear()} Agrotech. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
