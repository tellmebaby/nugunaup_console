"use client";

import Image from 'next/image';
import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import { useWidgets } from '../../context/WidgetContext';

export default function Header() {
  const [isWidgetMenuOpen, setIsWidgetMenuOpen] = useState(false);
  const { widgets, toggleWidget } = useWidgets();
  
  // Create ref for the widget menu
  const widgetMenuRef = useRef<HTMLDivElement>(null);
  const widgetButtonRef = useRef<HTMLButtonElement>(null);

  // Handle outside clicks
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      // Check if click is outside both menu and its button
      if (
        widgetMenuRef.current && 
        !widgetMenuRef.current.contains(event.target as Node) &&
        widgetButtonRef.current &&
        !widgetButtonRef.current.contains(event.target as Node)
      ) {
        setIsWidgetMenuOpen(false);
      }
    }

    // Add event listener
    document.addEventListener('mousedown', handleClickOutside);
    
    // Clean up the event listener
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isWidgetMenuOpen]);

  return (
    <div className="w-full bg-white shadow-sm">
      <header className="flex flex-col md:flex-row justify-between items-center p-4 gap-4 w-full max-w-[1312px] mx-auto">
        {/* Left section */}
        <div className="flex flex-row items-center p-0 gap-2.5 w-full md:w-[330px] h-20">
          {/* Logo */}
          <div className="flex flex-col justify-center items-center p-[15px] w-20 h-20">
            <Link href="/">
              <div className="flex items-center">
                <Image
                  src="/logo.png"
                  alt="Logo"
                  width={50}
                  height={50}
                  className="w-[50px] h-[50px]"
                />
              </div>
            </Link>
          </div>

          {/* Search */}
          <div className="flex flex-row justify-center items-center py-5 px-2.5 w-60 h-20">
            <div className="flex flex-row justify-center items-center p-2.5 w-[54px] h-10 bg-[#E8E7E7] rounded-l-[10px]">
              <Image
                src="/icons/lens.png"
                alt="Search Icon"
                width={20}
                height={20}
                className="w-5 h-5"
              />
            </div>
            <div className="flex flex-row items-center p-0 w-[166px] h-10 bg-[#E8E7E7] rounded-r-[10px]">
              <input
                type="text"
                placeholder="Search.."
                className="w-full h-full bg-transparent px-3 font-[42dot Sans] text-[15px] text-[#BDBDBD] focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Right section */}
        <div className="flex flex-row justify-center md:justify-end items-center py-5 px-0 gap-2.5 w-full md:w-auto">
          {/* Widget Menu */}
          <div className="relative">
            <button
              ref={widgetButtonRef}
              onClick={() => setIsWidgetMenuOpen(!isWidgetMenuOpen)}
              className="flex flex-row justify-between items-center p-2.5 gap-2.5 w-[120px] h-10 rounded-[10px]"
            >
              <div className="flex flex-row justify-end items-center p-0 w-[77px] h-5 mx-auto">
                <span className="font-[42dot Sans] font-normal text-[15px] flex items-center text-center text-black">
                  WIDGET
                </span>
              </div>
              <div className="flex flex-row justify-center items-center py-[5px] px-[6px] w-[23px] h-5 mx-auto">
                <span className="w-[17px] h-3.5 font-[42dot Sans] font-normal text-xs flex items-center text-center text-black">
                  ▼
                </span>
              </div>
            </button>
            
            {isWidgetMenuOpen && (
              <div 
                ref={widgetMenuRef} 
                className="absolute right-0 z-10 w-64 py-2 mt-2 bg-white rounded-md shadow-lg"
              >
                <div className="px-4 py-2 font-medium border-b">Widget Settings</div>
                {widgets.map(widget => (
                  <div key={widget.id} className="flex items-center justify-between px-4 py-2 hover:bg-gray-100">
                    <label htmlFor={widget.id} className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        id={widget.id}
                        checked={widget.isVisible}
                        onChange={() => toggleWidget(widget.id)}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">{widget.name}</span>
                    </label>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Setting Button */}
          <button className="box-border flex flex-row items-start p-2.5 gap-2.5 w-10 h-10 border border-[#B9B9B9] rounded-[10px] focus:outline-none hover:bg-gray-100 transition-colors">
            <svg
              className="w-5 h-5 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </button>

          {/* Alarm Button */}
          <button className="box-border flex flex-row items-start p-2.5 gap-2.5 w-10 h-10 border border-[#B9B9B9] rounded-[10px] focus:outline-none hover:bg-gray-100 transition-colors">
            <svg
              className="w-5 h-5 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
          </button>

          {/* User ID Button */}
          <Link href="/admin">
            <div className="box-border flex flex-row items-start p-2.5 gap-2.5 w-[100px] h-10 border border-[#B9B9B9] rounded-[10px]">
              <span className="w-20 h-5 font-[42dot Sans] font-normal text-[15px] text-center text-black">
                admin
              </span>
            </div>
          </Link>
        </div>
      </header>
    </div>
  );
}