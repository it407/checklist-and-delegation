"use client"

import { useState, useEffect } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { CheckSquare, ClipboardList, Home, LogOut, Menu, Database, ChevronDown, ChevronRight, Zap, Video, KeyRound, Calendar ,Edit } from 'lucide-react'

export default function AdminLayout({ children, darkMode, toggleDarkMode }) {
  const location = useLocation()
  const navigate = useNavigate()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isDataSubmenuOpen, setIsDataSubmenuOpen] = useState(false)
  const [username, setUsername] = useState("")
  const [userRole, setUserRole] = useState("")

  const [headerAnimatedText, setHeaderAnimatedText] = useState("");
  const [showAnimation, setShowAnimation] = useState(false);



  useEffect(() => {
    const storedUsername = sessionStorage.getItem("username");
    const storedRole = sessionStorage.getItem("role");

    if (!storedUsername) {
      navigate("/login");
      return;
    }

    // ✅ IMPORTANT: set state
    setUsername(storedUsername);
    setUserRole(storedRole || "user");

    // Show welcome animation once
    const hasSeenAnimation = sessionStorage.getItem("hasSeenWelcomeAnimation");

    if (!hasSeenAnimation) {
      setShowAnimation(true);
      sessionStorage.setItem("hasSeenWelcomeAnimation", "true");

      let currentIndex = 0;
      const welcomeText = `Welcome, ${storedUsername}`;

      const typingInterval = setInterval(() => {
        if (currentIndex <= welcomeText.length) {
          setHeaderAnimatedText(welcomeText.slice(0, currentIndex));
          currentIndex++;
        } else {
          clearInterval(typingInterval);
          setShowAnimation(false);
        }
      }, 80);

      return () => clearInterval(typingInterval);
    } else {
      setHeaderAnimatedText(`Welcome, ${storedUsername}`);
    }
  }, [navigate]);



  // Handle logout
  const handleLogout = () => {
    sessionStorage.removeItem('username')
    sessionStorage.removeItem('role')
    sessionStorage.removeItem('department')
    navigate("/login")
  }

  // Filter dataCategories based on user role
  const dataCategories = [
    { id: "picu", name: "Business Strategy", link: "/dashboard/data/picu" },
    { id: "sales", name: "Administration Facilities", link: "/dashboard/data/sales" },
    { id: "service", name: "Finance Accounts", link: "/dashboard/data/service" },
    { id: "jockey", name: "Information Technology", link: "/dashboard/data/jockey" },
    { id: "account", name: "Claims Reconciliation", link: "/dashboard/data/account" },
    { id: "warehouse", name: "Operations Supply Chain", link: "/dashboard/data/warehouse" },
    { id: "director", name: "Procurement", link: "/dashboard/data/director" },
    { id: "rmo", name: "Order Processing", link: "/dashboard/data/rmo" },
    { id: "tpa", name: "Warehousing Logistics", link: "/dashboard/data/tpa" },
    { id: "purchase", name: "Maintenance", link: "/dashboard/data/purchase" },
    { id: "managing-director", name: "Plant Operations", link: "/dashboard/data/managing-director" },
    { id: "it", name: "Production", link: "/dashboard/data/it" },
    { id: "general-ward", name: "Quality", link: "/dashboard/data/general-ward" },
    { id: "private-ward", name: "Store", link: "/dashboard/data/private-ward" },
    { id: "supervisor", name: "Quality Assurance Control", link: "/dashboard/data/supervisor" },
    { id: "reception", name: "Customer Service", link: "/dashboard/data/reception" },
    { id: "marketing", name: "Brand Marketing", link: "/dashboard/data/marketing" },
    { id: "nicu", name: "Data Analytics", link: "/dashboard/data/nicu" },
    { id: "hdu", name: "Process Excellence PMO", link: "/dashboard/data/hdu" },
    { id: "icu", name: "Sales", link: "/dashboard/data/icu" },
    { id: "crm", name: "Supply Chain Coordination", link: "/dashboard/data/crm" },
    { id: "ea", name: "Performance Marketing", link: "/dashboard/data/ea" },
    { id: "telecaller", name: "Human Resources", link: "/dashboard/data/telecaller" },



    { id: "aushman", name: "Sales-GT", link: "/dashboard/data/aushman" },
    { id: "mod", name: "Sales-PDS", link: "/dashboard/data/mod" },
    { id: "pharmacy", name: "Sales-GEM", link: "/dashboard/data/pharmacy" },




    // ✅ ADD ALL THE MISSING PAGES:
    // { id: "nurshing-staff", name: "Nursing Staff", link: "/dashboard/data/nurshing-staff" },
    // { id: "nurshing-incharge", name: "Nursing Incharge", link: "/dashboard/data/nurshing-incharge" },
    // { id: "ot-staff", name: "OT Staff", link: "/dashboard/data/ot-staff" },
    // { id: "casualty", name: "Casualty", link: "/dashboard/data/casualty" },
    // { id: "icn", name: "ICN", link: "/dashboard/data/icn" },
    // { id: "storekeeper", name: "Storekeeper", link: "/dashboard/data/storekeeper" },
    // { id: "nurshing-superintendent", name: "Nursing Superintendent", link: "/dashboard/data/nurshing-superintendent" },
    // { id: "sr-incharge", name: "Sr Incharge", link: "/dashboard/data/sr-incharge" },
    // { id: "bsky", name: "BSKY", link: "/dashboard/data/bsky" },
    // { id: "usg", name: "USG", link: "/dashboard/data/usg" },
    // { id: "x-ray", name: "X-Ray", link: "/dashboard/data/x-ray" },
  ]

  // Determine which departments to show in the submenu
  // const getAccessibleDepartments = () => {
  //   if (userRole === "admin") {
  //     // Admin sees all departments
  //     return dataCategories
  //   } else {
  //     // Regular users see only their own department plus admin (if needed)
  //     return dataCategories.filter(cat => 
  //       cat.id === username || 
  //       cat.id.toLowerCase() === username.toLowerCase()
  //     )
  //   }
  // }

  // Update the routes array based on user role
  const routes = [
    {
      href: "/dashboard/admin",
      label: "Dashboard",
      icon: Database,
      active: location.pathname === "/dashboard/admin",
      showFor: ["admin", "user"] // Show for both roles
    },
    // {
    //   href: "/dashboard/quick-task",
    //   label: "Quick Task Checklist",
    //   icon: Zap,
    //   active: location.pathname === "/dashboard/quick-task",
    //   showFor: ["admin"],
    // },
    {
      href: "/dashboard/assign-task",
      label: "Assign Task",
      icon: CheckSquare,
      active: location.pathname === "/dashboard/assign-task",
      showFor: ["admin"] // Only show for admin
    },
    {
      href: "/dashboard/task-update",
      label: "Task Update",
      icon: Edit,
      active: location.pathname === "/dashboard/task-update",
      showFor: ["admin"] // Only show for admin
    },
    {
      href: "/dashboard/delegation",
      label: "Delegation",
      icon: ClipboardList,
      active: location.pathname === "/dashboard/delegation",
      showFor: ["admin", "user"] // Only show for admin
    },
    // {
    //   href: "/dashboard/approvalpending",
    //   label: "Approval Pending",
    //   icon: ClipboardList,
    //   active: location.pathname === "/dashboard/delegation",
    //   showFor: ["admin"] // Only show for admin
    // },
    {
      href: "/dashboard/calender",
      label: "Calendar",
      icon: Calendar,
      active: location.pathname === "/dashboard/calendar",
      showFor: ["admin", "user"],
    },
    {
      href: "/dashboard/license",
      label: "License",
      icon: KeyRound,
      active: location.pathname === "/dashboard/license",
      showFor: ["admin", "user"],
    },
    {
      href: "/dashboard/traning",
      label: "Training Video",
      icon: Video,
      active: location.pathname === "/dashboard/traning",
      showFor: ["admin", "user"],
    },
    {
      href: "#",
      label: "Data",
      icon: Database,
      active: location.pathname.includes("/dashboard/data"),
      submenu: true,
      showFor: ["admin", "user"] // Show for both roles
    },
  ]

  // Modify getAccessibleDepartments to show all departments
  // const getAccessibleDepartments = () => {
  //   // Both admin and users see all departments
  //   return dataCategories
  // }
  const getAccessibleDepartments = () => {
    const userRole = sessionStorage.getItem('role') || 'user'
    const userPage = (sessionStorage.getItem('page') || '').toLowerCase().trim()

    console.log('User Page from session:', userPage) // DEBUG

    // If user has 'all' access, show all categories
    if (userPage === 'all') {
      return dataCategories
    }

    // If user has specific page access, filter to show only those pages
    if (userPage) {
      // Split by comma to handle multiple pages
      const allowedPages = userPage.split(',').map(p => p.trim().toLowerCase())
      console.log('Allowed Pages:', allowedPages) // DEBUG

      const filteredCategories = dataCategories.filter(cat => {
        const categoryName = cat.name.toLowerCase().trim()

        // Check if category name matches any of the allowed pages
        return allowedPages.some(page => {
          // Normalize both strings by removing special characters and extra spaces
          const normalizedPage = page.replace(/[&_\-\/]/g, ' ').replace(/\s+/g, ' ').trim()
          const normalizedCategory = categoryName.replace(/[&_\-\/]/g, ' ').replace(/\s+/g, ' ').trim()

          // Check for exact match or partial match
          return normalizedCategory === normalizedPage ||
            normalizedCategory.includes(normalizedPage) ||
            normalizedPage.includes(normalizedCategory)
        })
      })

      console.log('Filtered Categories:', filteredCategories) // DEBUG
      return filteredCategories
    }

    // If no page specified, show all (fallback)
    return dataCategories
  }

  // Filter routes based on user role
  const getAccessibleRoutes = () => {
    const userRole = sessionStorage.getItem('role') || 'user'
    return routes.filter(route =>
      route.showFor.includes(userRole)
    )
  }

  // Check if the current path is a data category page
  const isDataPage = location.pathname.includes("/dashboard/data/")

  // If it's a data page, expand the submenu by default
  useEffect(() => {
    if (isDataPage && !isDataSubmenuOpen) {
      setIsDataSubmenuOpen(true)
    }
  }, [isDataPage, isDataSubmenuOpen])

  // Get accessible routes and departments
  const accessibleRoutes = getAccessibleRoutes()
  const accessibleDepartments = getAccessibleDepartments()

  return (
    <div className={`flex h-screen overflow-hidden bg-gradient-to-br from-blue-50 to-purple-50`}>
      {/* Sidebar for desktop */}
      <aside className="hidden w-64 flex-shrink-0 border-r border-blue-200 bg-white md:flex md:flex-col">
        <div className="flex h-14 items-center border-b border-blue-200 px-4 bg-gradient-to-r from-blue-100 to-purple-100">
          <Link to="/dashboard/admin" className="flex items-center gap-2 font-semibold text-blue-700">
            <button class="bg-red-600 text-white px-6 py-3 text-lg font-semibold rounded-xl">
                  Zoff
                </button>
            <span>Checklist & Delegation</span>
          </Link>
        </div>
        <nav className="flex-1 overflow-y-auto p-2">
          <ul className="space-y-1">
            {accessibleRoutes.map((route) => (
              <li key={route.label}>
                {route.submenu ? (
                  <div>
                    <button
                      onClick={() => setIsDataSubmenuOpen(!isDataSubmenuOpen)}
                      className={`flex w-full items-center justify-between gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${route.active
                          ? "bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700"
                          : "text-gray-700 hover:bg-blue-50"
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        <route.icon className={`h-4 w-4 ${route.active ? "text-blue-600" : ""}`} />
                        {route.label}
                      </div>
                      {isDataSubmenuOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </button>
                    {isDataSubmenuOpen && (
                      <ul className="mt-1 ml-6 space-y-1 border-l border-blue-100 pl-2">
                        {accessibleDepartments.map((category) => (
                          <li key={category.id}>
                            <Link
                              to={category.link || `/dashboard/data/${category.id}`}
                              className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors ${location.pathname === (category.link || `/dashboard/data/${category.id}`)
                                  ? "bg-blue-50 text-blue-700 font-medium"
                                  : "text-gray-600 hover:bg-blue-50 hover:text-blue-700 "
                                }`}
                              onClick={() => setIsMobileMenuOpen(false)}
                            >
                              {category.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ) : (
                  <Link
                    to={route.href}
                    className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${route.active
                        ? "bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700"
                        : "text-gray-700 hover:bg-blue-50"
                      }`}
                  >
                    <route.icon className={`h-4 w-4 ${route.active ? "text-blue-600" : ""}`} />
                    {route.label}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </nav>
        <div className="border-t border-blue-200 p-4 bg-gradient-to-r from-blue-50 to-purple-50 ">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                <span className="text-sm font-medium text-white">{username ? username.charAt(0).toUpperCase() : 'U'}</span>
              </div>
              <div>
                <p className="text-sm font-medium text-blue-700">
                  {username || "User"} {userRole === "admin" ? "(Admin)" : ""}
                </p>
                <p className="text-xs text-blue-600">
                  {username ? `${username.toLowerCase()}@example.com` : "user@example.com"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {toggleDarkMode && (
                <button
                  onClick={toggleDarkMode}
                  className="text-blue-700 hover:text-blue-900 p-1 rounded-full hover:bg-blue-100"
                >
                  {darkMode ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                    </svg>
                  )}
                  <span className="sr-only">{darkMode ? "Light mode" : "Dark mode"}</span>
                </button>
              )}
              <button
                onClick={handleLogout}
                className="text-blue-700 hover:text-blue-900 p-1 rounded-full hover:bg-blue-100"
              >
                <LogOut className="h-4 w-4" />
                <span className="sr-only">Log out</span>
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile menu button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="md:hidden absolute left-4 top-3 z-50 text-blue-700 p-2 rounded-md hover:bg-blue-100"
      >
        <Menu className="h-5 w-5" />
        <span className="sr-only">Toggle menu</span>
      </button>

      {/* Mobile sidebar */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="fixed inset-0 bg-black/20" onClick={() => setIsMobileMenuOpen(false)}></div>
          <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-lg flex flex-col">
           <div className="flex h-14 items-center border-b border-blue-200 px-4 bg-gradient-to-r from-blue-100 to-purple-100">
  <Link
    to="/dashboard/admin"
    className="relative flex items-center gap-2 font-semibold text-blue-700"
    onClick={() => setIsMobileMenuOpen(false)}
  >

    {/* ZOFF – ONLY this moves */}
    <button className="bg-red-600 text-white px-6 py-3 text-lg font-semibold rounded-xl relative left-8">
      Zoff
    </button>

    {/* Text stays EXACT same place */}
    <span className="ml-8">Checklist & Delegation</span>

  </Link>
</div>

            <nav className="flex-1 overflow-y-auto p-2 bg-white" style={{ maxHeight: 'calc(100vh - 14rem)' }}>
              <ul className="space-y-1">
                {accessibleRoutes.map((route) => (
                  <li key={route.label}>
                    {route.submenu ? (
                      <div>
                        <button
                          onClick={() => setIsDataSubmenuOpen(!isDataSubmenuOpen)}
                          className={`flex w-full items-center justify-between gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${route.active
                              ? "bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700"
                              : "text-gray-700 hover:bg-blue-50"
                            }`}
                        >
                          <div className="flex items-center gap-3">
                            <route.icon className={`h-4 w-4 ${route.active ? "text-blue-600" : ""}`} />
                            {route.label}
                          </div>
                          {isDataSubmenuOpen ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </button>
                        {isDataSubmenuOpen && (
                          <ul className="mt-1 ml-6 space-y-1 border-l border-blue-100 pl-2">
                            {accessibleDepartments.map((category) => (
                              <li key={category.id}>
                                <Link
                                  to={category.link || `/dashboard/data/${category.id}`}
                                  className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors ${location.pathname === (category.link || `/dashboard/data/${category.id}`)
                                      ? "bg-blue-50 text-blue-700 font-medium"
                                      : "text-gray-600 hover:bg-blue-50 hover:text-blue-700"
                                    }`}
                                  onClick={() => setIsMobileMenuOpen(false)}
                                >
                                  {category.name}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ) : (
                      <Link
                        to={route.href}
                        className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${route.active
                            ? "bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700"
                            : "text-gray-700 hover:bg-blue-50"
                          }`}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <route.icon className={`h-4 w-4 ${route.active ? "text-blue-600" : ""}`} />
                        {route.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </nav>
            <div className="border-t border-blue-200 p-4 bg-gradient-to-r from-blue-50 to-purple-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                    <span className="text-sm font-medium text-white">{username ? username.charAt(0).toUpperCase() : 'U'}</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-blue-700">
                      {username || "User"} {userRole === "admin" ? "(Admin)" : ""}
                    </p>
                    <p className="text-xs text-blue-600">
                      {username ? `${username.toLowerCase()}@example.com` : "user@example.com"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {toggleDarkMode && (
                    <button
                      onClick={toggleDarkMode}
                      className="text-blue-700 hover:text-blue-900 p-1 rounded-full hover:bg-blue-100"
                    >
                      {darkMode ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646A9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                        </svg>
                      )}
                      <span className="sr-only">{darkMode ? "Light mode" : "Dark mode"}</span>
                    </button>
                  )}
                  <button
                    onClick={handleLogout}
                    className="text-blue-700 hover:text-blue-900 p-1 rounded-full hover:bg-blue-100 "
                  >
                    <LogOut className="h-4 w-4" />
                    <span className="sr-only">Log out</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-14 items-center justify-between border-b border-blue-200 bg-white px-4 md:px-6">
          <div></div>
          <div className="flex flex-col gap-1">
            {headerAnimatedText && (
              <p className="text-lg md:text-xl font-['Poppins',_'Segoe_UI',_sans-serif] tracking-wide">
                <span className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 animate-gradient">
                  {headerAnimatedText}
                </span>
                <span className="inline-block animate-bounce ml-2 text-yellow-500">👋</span>
              </p>
            )}
          </div>

        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-gradient-to-br from-blue-50 to-purple-50">
          {children}
          <div className="md:ml-64 ml-0 fixed left-0 right-0 bottom-0 py-1 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-center text-sm shadow-md z-10">

            <a href="https://www.botivate.in/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline"
            >
              Powered by-<span className="font-semibold">Botivate</span>
            </a>
          </div>
        </main>
      </div>

    </div>
  )
}