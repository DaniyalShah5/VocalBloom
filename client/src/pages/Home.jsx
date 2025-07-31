import Footer from "../component/Footer";
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
export default function Home() {
  const { user } = useAuth();
  const testimonies =[
    {id:1, name:"Andrew Berg",message:"This site has been amazing for my son! The therapy modules are really easy to follow. I love that it's free and made just for kids."},
    {id:2, name:"Susan gurzanski",message:"We’ve seen great improvement in our daughter’s speech since using this site. It’s simple, engaging, and doesn’t cost anything. Thank you!"},
    {id:3, name:"Linda Berlin",message:"Very helpful and easy to use. My child actually enjoys the sessions! It’s a great resource for parents looking for free speech therapy support."}
  ]
  return (
    <div className="min-h-screen">
      <div className="relative pb-10">
        <div className="max-w-7xl mx-auto ">
          
          <div className="flex flex-col lg:flex-row min-h-[600px] w-full ">
            {/* Image Section */}
            <div className="lg:w-1/2 order-1 lg:order-last flex">
              <div className="relative w-full h-full  overflow-hidden">
                <img
                  src="https://res.cloudinary.com/dpucsvoo6/image/upload/v1753020344/smile2_zr2dyv.jpg"
                  alt="Happy child playing"
                  className="w-full h-full object-cover object-center shadow-xl"
                />
              </div>
            </div>

             {/* Text Content Section */}
          <div className="lg:w-1/2 flex items-center justify-center bg-[#db8ec1] p-5 md:p-8 lg:p-10">
            <div className="space-y-6 md:space-y-8 py-8 px-4 w-full max-w-lg mx-auto">
              <div className="animate-fade-in-up">
                <span className="inline-block bg-white text-gray-700 px-4 py-2 rounded-full text-sm font-semibold shadow-md">
                  Trusted by 500+ families
                </span>
              </div>

              <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight animate-fade-in-up delay-100">
                Free Speech Development Resources
              </h1>

              <p className="text-lg md:text-xl text-gray-200 animate-fade-in-up delay-200">
                Community-driven speech therapy platform combining
                expert-designed exercises with progress tracking for children
                and caregivers.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-up delay-300">
                {user ? ( 
                  <>
                  {user.role === 'child' ? (

                    <Link
                      to="/interactive-session"
                      className="px-8 py-3 bg-[#8ec1db] text-white rounded-lg text-lg font-semibold hover:bg-[#5495b5] transition-all transform hover:scale-105 text-center "
                    >
                      Start a Session
                    </Link>
                  ): user.role === 'parent' ? (
                    <Link
                      to="/progress"
                      className="px-8 py-3 bg-[#8ec1db] text-white rounded-lg text-lg font-semibold hover:bg-[#5495b5] transition-all transform hover:scale-105 text-center "
                    >
                      View Progress
                    </Link>
                  ): user.role === 'therapist' ? (
                    <Link
                      to="/patientDashboard"
                      className="px-8 py-3 bg-[#8ec1db] text-white rounded-lg text-lg font-semibold hover:bg-[#5495b5] transition-all transform hover:scale-105 text-center "
                    >
                      Therapist Dashboard
                    </Link>
                  ): user.role === 'admin' ? (
                    <Link
                      to="/admin"
                      className="px-8 py-3 bg-[#8ec1db] text-white rounded-lg text-lg font-semibold hover:bg-[#5495b5] transition-all transform hover:scale-105 text-center "
                    >
                      Admin Panel
                    </Link>
                  ):(
                    <></>
                  )}
                    <Link
                      to="/therapy-modules"
                      className="px-8 py-3 text-gray-700 border-2 border-white rounded-lg text-lg font-semibold bg-white hover:bg-gray-100 hover:scale-105 transition-all text-center "
                    >
                      Browse Modules
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      to="/register"
                      className="px-8 py-3 bg-[#8ec1db] text-white rounded-lg text-lg font-semibold hover:bg-[#5495b5] transition-all transform hover:scale-105 text-center "
                    >
                      Get Started Free
                    </Link>
                    <Link
                      to="/login"
                      className="px-8 py-3 text-gray-700 border-2 border-white rounded-lg text-lg font-semibold bg-white hover:bg-gray-100 hover:scale-105 transition-all text-center "
                    >
                      Already a User
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-16 bg-[#8ec1db]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8  text-center">
            {[
              { number: "10K+", label: "Exercises Completed" },
              { number: "95%", label: "Satisfaction Rate" },
              { number: "2.5x", label: "Faster Progress" },
              { number: "100%", label: "Free Forever" },
            ].map((stat, idx) => (
              <div key={idx} className="p-6">
                <div className="text-4xl font-bold text-white mb-2">
                  {stat.number}
                </div>
                <div className="text-white text-sm font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="py-20 ">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Comprehensive Learning Tools
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Everything you need to support speech development - completely
              free
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: "🎮",
                title: "Interactive Modules",
                desc: "300+ evidence-based exercises across 15 speech domains",
              },
              {
                icon: "📊",
                title: "Progress Tracking",
                desc: "Real-time pronunciation analysis and progress reports",
              },
              {
                icon: "👨👩👧",
                title: "Family Portal",
                desc: "Collaborative space for parents and caregivers",
              },
              {
                icon: "🏆",
                title: "Reward System",
                desc: "Motivational badges and achievement tracking",
              },
              {
                icon: "📲",
                title: "Mobile Friendly",
                desc: "Practice anywhere with mobile-optimized access",
              },
              {
                icon: "🛡️",
                title: "Secure Platform",
                desc: "Privacy-focused data protection",
              },
            ].map((feature, idx) => (
              <div
                key={idx}
                className="p-8 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div id="testimonials" className="py-20 bg-[#db8ec1]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              Community Stories
            </h2>
            <p className="text-gray-50">Hear from our users</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonies.map((item) => (
              <div key={item.id} className="p-8 bg-white rounded-xl shadow-lg">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center font-semibold text-2xl text-white bg-[#8ec1db]  mr-4">{item.name?.charAt(0).toUpperCase()}</div>
                  <div>
                    <div className="font-semibold">{item.name}</div>
                    <div className="text-sm text-gray-500">Parent</div>
                  </div>
                </div>
                <p className="text-gray-600">
                  {item.message}
                </p>
                <div className="mt-4 flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className="w-5 h-5 text-yellow-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 ">
        {user?(
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-6 text-gray-800"> 
            Ready to Schedule a Session?
          </h2>
          <p className="text-xl mb-8 text-gray-700"> 
            Find the perfect time and therapist to kickstart your progress.
          </p>
          <Link
            to="/schedule" 
            className="inline-block px-8 py-3 bg-[#8ec1db] text-white rounded-lg text-lg font-semibold hover:bg-[#5495b5] transition-transform duration-150 transform hover:scale-105 shadow-lg"
          >
            Schedule a Session
          </Link>
        </div>
        ):(
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-6">
            Start Improving Today - 100% Free
          </h2>
          <p className="text-xl mb-8">
            Join our community and access all features at no cost
          </p>
          <Link
            to="/register"
            className="inline-block px-8 py-3 bg-[#8ec1db] text-white rounded-lg text-lg font-semibold  hover:scale-105 transition-transform duration-150"
          >
            Create Free Account
          </Link>
        </div>
        )}
        
      </div>
    </div>
  );
}