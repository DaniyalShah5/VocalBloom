import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useSession } from "../context/SessionContext";
import ProfileMenu from "../component/ProfileMenu";
import { Menu, X } from "lucide-react";

function Navigation() {
  const { user } = useAuth();
  const { pendingRequestsCount } = useSession(); 
  const [menuOpen, setMenuOpen] = useState(false);

  const navItems = [
    {
      to: "/therapy-modules",
      text: "Therapy Modules",
      roles: ["parent", "child", "therapist", "admin"],
      public: true,
    },
    {
      to: "/progress",
      text: "Progress Report",
      roles: ["parent", "child"],
    },
    {
      to: "/interactive-session",
      text: "Interactive Session",
      roles: ["child", "therapist"],
      public: true,
      excludeRoles: ["admin", "parent"],
      showBadge: true, 
    },
    {
      to: "/create-therapy",
      text: "Create Modules",
      roles: ["therapist"],
    },
    {
      to: "/patientDashboard",
      text: "Patient Dashboard",
      roles: ["therapist"],
    },
    {
      to: "/schedule",
      text: "Schedule Session",
      roles: ["parent", "child"],
      public: true,
      excludeRoles: ["therapist"],
    },
    {
      to: "/support",
      text: "Support",
      roles: ["parent", "child", "therapist"],
      public: true,
    },
    {
      to: "/admin",
      text: "Admin Panel",
      roles: ["admin"],
    },
  ];

  const shouldShowNavItem = (item) => {
    if (item.public) {
      if (item.excludeRoles?.includes(user?.role)) return false;
      return true;
    }
    if (!user) return false;
    return item.roles.includes(user.role);
  };

  const renderNavItemWithBadge = (item, isMobile = false) => {
    const isInteractiveSession = item.to === "/interactive-session";
    const shouldShowBadge = isInteractiveSession && 
                           user?.role === "therapist" && 
                           pendingRequestsCount > 0;

    const baseClasses = isMobile 
      ? "block text-gray-700 hover:bg-[#8ec1db] hover:text-white p-2 rounded-md"
      : "text-md text-gray-700 hover:scale-105 duration-300 hover:bg-[#8ec1db] hover:text-white p-2 rounded-lg";

    return (
      <Link
        to={item.to}
        className={`${baseClasses} ${shouldShowBadge ? 'relative' : ''}`}
        onClick={isMobile ? () => setMenuOpen(false) : undefined}
      >
        {item.text}
        {shouldShowBadge && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
            {pendingRequestsCount}
          </span>
        )}
      </Link>
    );
  };

  return (
    <nav className="bg-white shadow-lg mb-2">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Mobile: Menu Button  */}
          <div className="lg:hidden flex items-center space-x-3">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="text-gray-800 focus:outline-none"
            >
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            
          </div>
          {/* Logo */}
          <div className=" flex items-center ml-3">
            <span className="text-2xl  sm:text-3xl font-bold text-[#db8ec1] hover:scale-110 duration-200 ">
              <Link to="/" className="mr-4">
                VocalBloom
              </Link>
            </span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden lg:flex space-x-5">
            {navItems.map((item, index) =>
              shouldShowNavItem(item) && (
                <div key={index}>
                  {renderNavItemWithBadge(item)}
                </div>
              )
            )}
          </div>

          {/* Desktop Auth/Profile */}
          <div className="hidden lg:flex items-center space-x-4">
            {!user ? (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 text-black hover:scale-105 transition-all"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 bg-[#88c6e4] text-white hover:bg-[#88c5e4de] hover:scale-105 transition-all"
                >
                  Register
                </Link>
              </>
            ) : (
              <ProfileMenu />
            )}
          </div>
          <div className="lg:hidden flex items-center space-x-1 ml-auto">
            {user ? (
              <ProfileMenu />
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-sm  px-4 py-2 text-gray-700 rounded-sm "
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="text-sm text-white bg-[#88c6e4] px-3 py-2 hover:bg-[#88c5e4de]"
                >
                  Register
                </Link>
              </>
            )}
          </div>

        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {menuOpen && (
        <div className="md:hidden px-4 pb-4 space-y-2">
          {navItems.map((item, index) =>
            shouldShowNavItem(item) && (
              <div key={index}>
                {renderNavItemWithBadge(item, true)}
              </div>
            )
          )}
        </div>
      )}
    </nav>
  );
}

export default Navigation;