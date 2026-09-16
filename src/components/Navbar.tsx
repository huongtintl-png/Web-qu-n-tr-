import React, { useState } from 'react';
import {
  GraduationCap,
  LayoutDashboard,
  Users,
  Settings,
  Calendar,
  Menu,
  X,
  UserCheck,
  ChevronDown,
} from 'lucide-react';
import { NavigationTab, ClassConfig } from '../types';

interface NavbarProps {
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;
  config: ClassConfig;
  onUpdateAcademicYear: (year: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  config,
  onUpdateAcademicYear,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [yearDropdownOpen, setYearDropdownOpen] = useState(false);

  const academicYears = [
    'Năm học 2025–2026',
    'Năm học 2026–2027',
    'Năm học 2027–2028',
    'Năm học 2028–2029',
  ];

  const handleNavClick = (tab: NavigationTab) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo & App Title */}
          <div
            id="brand-logo-container"
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-3 cursor-pointer select-none group"
          >
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-white/15 backdrop-blur-sm border border-white/25 flex items-center justify-center shadow-inner group-hover:bg-white/25 transition-all">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-lg sm:text-xl font-bold tracking-tight text-white flex items-center gap-2">
                <span>GIÁO VIÊN CHỦ NHIỆM</span>
                <span className="hidden md:inline-block px-2 py-0.5 text-xs font-semibold bg-white/20 rounded-full border border-white/30 text-blue-50">
                  {config.className}
                </span>
              </div>
              <p className="text-xs text-blue-100/90 font-medium line-clamp-1 hidden sm:block">
                {config.schoolName} • GVCN: {config.teacherName}
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1.5" aria-label="Điều hướng chính">
            <button
              id="nav-btn-home"
              onClick={() => handleNavClick('home')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                activeTab === 'home'
                  ? 'bg-white text-blue-800 shadow-sm'
                  : 'text-white/90 hover:text-white hover:bg-white/10'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Trang chủ</span>
            </button>

            <button
              id="nav-btn-students"
              onClick={() => handleNavClick('students')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                activeTab === 'students'
                  ? 'bg-white text-blue-800 shadow-sm'
                  : 'text-white/90 hover:text-white hover:bg-white/10'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Danh sách học sinh</span>
            </button>

            <button
              id="nav-btn-config"
              onClick={() => handleNavClick('config')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                activeTab === 'config'
                  ? 'bg-white text-blue-800 shadow-sm'
                  : 'text-white/90 hover:text-white hover:bg-white/10'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>Cấu hình năm học</span>
            </button>
          </nav>

          {/* Right Area: Academic Year Selector & Teacher Avatar */}
          <div className="hidden sm:flex items-center gap-3">
            {/* Year Selector Dropdown */}
            <div className="relative">
              <button
                id="btn-year-selector"
                onClick={() => setYearDropdownOpen(!yearDropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/20 border border-white/25 text-xs sm:text-sm font-medium text-white transition-colors"
                aria-expanded={yearDropdownOpen}
              >
                <Calendar className="w-4 h-4 text-blue-200" />
                <span>{config.academicYear}</span>
                <ChevronDown className="w-3.5 h-3.5 opacity-80" />
              </button>

              {yearDropdownOpen && (
                <div
                  id="year-dropdown-menu"
                  className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-blue-100 py-1.5 text-slate-800 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                >
                  <div className="px-3 py-1 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Chọn năm học
                  </div>
                  {academicYears.map((year) => (
                    <button
                      key={year}
                      onClick={() => {
                        onUpdateAcademicYear(year);
                        setYearDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3.5 py-2 text-xs sm:text-sm font-medium flex items-center justify-between hover:bg-blue-50 transition-colors ${
                        config.academicYear === year ? 'text-blue-600 font-bold bg-blue-50/60' : 'text-slate-700'
                      }`}
                    >
                      <span>{year}</span>
                      {config.academicYear === year && (
                        <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Teacher Badge */}
            <div
              id="teacher-profile-badge"
              className="flex items-center gap-2.5 pl-3 border-l border-white/20"
            >
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-amber-400/90 text-blue-950 font-bold flex items-center justify-center text-xs shadow-sm ring-2 ring-white/30">
                TH
              </div>
              <div className="hidden xl:block text-left">
                <p className="text-xs font-semibold text-white leading-tight">{config.teacherName}</p>
                <p className="text-[11px] text-blue-200">GVCN {config.className}</p>
              </div>
            </div>
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="flex items-center gap-2 lg:hidden">
            <button
              id="btn-mobile-menu-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-white hover:bg-white/15 focus:outline-none"
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div id="mobile-navigation-drawer" className="lg:hidden bg-blue-800/95 border-t border-white/10 px-4 pt-3 pb-5 space-y-2">
          <div className="p-2 mb-2 bg-white/10 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-blue-100">
              <Calendar className="w-4 h-4 text-blue-200" />
              <span>{config.academicYear}</span>
            </div>
            <span className="text-xs font-bold bg-white text-blue-900 px-2 py-0.5 rounded-md">
              {config.className}
            </span>
          </div>

          <button
            id="mobile-nav-home"
            onClick={() => handleNavClick('home')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium ${
              activeTab === 'home' ? 'bg-white text-blue-800 font-bold' : 'text-white hover:bg-white/10'
            }`}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span>Trang chủ</span>
          </button>

          <button
            id="mobile-nav-students"
            onClick={() => handleNavClick('students')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium ${
              activeTab === 'students' ? 'bg-white text-blue-800 font-bold' : 'text-white hover:bg-white/10'
            }`}
          >
            <Users className="w-5 h-5" />
            <span>Danh sách học sinh</span>
          </button>

          <button
            id="mobile-nav-config"
            onClick={() => handleNavClick('config')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium ${
              activeTab === 'config' ? 'bg-white text-blue-800 font-bold' : 'text-white hover:bg-white/10'
            }`}
          >
            <Settings className="w-5 h-5" />
            <span>Cấu hình năm học</span>
          </button>

          <div className="pt-2 border-t border-white/15 flex items-center gap-3 px-2">
            <div className="w-8 h-8 rounded-full bg-amber-400 text-blue-950 font-bold flex items-center justify-center text-xs">
              TH
            </div>
            <div className="text-left text-xs">
              <div className="font-semibold text-white">{config.teacherName}</div>
              <div className="text-blue-200">{config.schoolName}</div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
