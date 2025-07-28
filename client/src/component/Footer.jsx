import { Link } from 'react-router-dom';
export default function Footer(){
    return(
        
      <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid md:grid-cols-4 gap-8 text-center md:text-left">
          <div className="md:col-span-2">
            <h3 className="text-xl font-bold mb-4">VocalBloom</h3>
            <p className="text-gray-400 text-sm">
              Free speech development resources for everyone
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-4">Resources</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/therapy-modules" className="text-gray-400 hover:text-white">Therapy Modules</Link></li>
              <li><Link to="/interactive-session" className="text-gray-400 hover:text-white">Interactive Session</Link></li>
              <li><Link to="/progress" className="text-gray-400 hover:text-white">Progress Tracking</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/schedule" className="text-gray-400 hover:text-white">Schedule Session</Link></li>
              <li><Link to="/support" className="text-gray-400 hover:text-white">Contact</Link></li>
              <li><Link to="/support" className="text-gray-400 hover:text-white">Support</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400 text-sm">
          © 2025 VocalBloom. Free forever, open source.
        </div>
      </div>
    </footer>
    )
}