'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const Navbar = () => {
    const [clicked, setClicked] = useState(false);
    const pathname = usePathname(); 

    // change the state of clicked when the button is clicked
    const handleClick = () => {
        setClicked(!clicked);
    };

    // give the style for a button (link) in the navbar
    const getLinkClass = (path: string) => {
        const baseClass = "text-[1.3rem] font-semibold text-white transition duration-300 ease-in-out hover:text-[#17cf97] relative";
        const hoverClass = "after:content-[''] after:absolute after:w-0 after:h-[2px] after:bg-[#17cf97] after:bottom-[-4px] after:left-0 hover:after:w-full";
        return `${baseClass} ${hoverClass}`;
    };

    return (
        <nav className="flex items-center justify-between bg-[#1b2430] py-5 px-5 md:px-20 relative z-50">
            <Link href="/">
                <svg id="logo-15" width="49" height="48" viewBox="0 0 49 48" fill="none" xmlns="http://www.w3.org/2000/svg"> 
                        <path d="M24.5 12.75C24.5 18.9632 19.4632 24 13.25 24H2V12.75C2 6.53679 7.03679 1.5 13.25 1.5C19.4632 1.5 24.5 6.53679 24.5 12.75Z" fill="#17CF97"></path> 
                        <path d="M24.5 35.25C24.5 29.0368 29.5368 24 35.75 24H47V35.25C47 41.4632 41.9632 46.5 35.75 46.5C29.5368 46.5 24.5 41.4632 24.5 35.25Z" fill="#17CF97"></path> 
                        <path d="M2 35.25C2 41.4632 7.03679 46.5 13.25 46.5H24.5V35.25C24.5 29.0368 19.4632 24 13.25 24C7.03679 24 2 29.0368 2 35.25Z" fill="#17CF97"></path> 
                        <path d="M47 12.75C47 6.53679 41.9632 1.5 35.75 1.5H24.5V12.75C24.5 18.9632 29.5368 24 35.75 24C41.9632 24 47 18.9632 47 12.75Z" fill="#17CF97"></path> 
                    </svg>
            </Link>
            
             {/* for big screens (such as computer) */}
            <div>
                <ul className="hidden md:flex items-center gap-8 list-none">
                    <li><Link href="/" className={getLinkClass('/home')}>בית</Link></li>
                    <li><Link href="/exam-clock" className={getLinkClass('/exam-clock')}>שעון בחינה</Link></li>
                    <li><Link href="/attendance" className={getLinkClass('/attendance')}>נוכחות</Link></li>
                    <li><Link href="/report" className={getLinkClass('/report')}>דיווח</Link></li>
                    <li><Link href="/procedures" className={getLinkClass('/procedures')}>נהלים</Link></li>
                    <li><Link href="/exam-bot" className={getLinkClass('/exam-bot')}>בוט בחינות</Link></li>
                </ul>
            </div>

            <div className="md:hidden text-white text-2xl cursor-pointer" onClick={handleClick}>
                {clicked ? '✕' : '☰'} 
            </div>

            {/* for small screens (such as mobile) */}
            <div className={`${clicked ? "flex" : "hidden"} md:hidden flex-col absolute top-full right-0 w-full bg-[#1b2430] p-6 shadow-lg border-t border-gray-700`}>
                 <Link href="/" className={`${getLinkClass('/')} py-2 block`} onClick={() => setClicked(false)}>בית</Link>
                 <Link href="/exam-clock" className={`${getLinkClass('/exam-clock')} py-2 block`} onClick={() => setClicked(false)}>שעון בחינה</Link>
                 <Link href="/attendance" className={`${getLinkClass('/attendance')} py-2 block`} onClick={() => setClicked(false)}>נוכחות</Link>
                 <Link href="/report" className={`${getLinkClass('/report')} py-2 block`} onClick={() => setClicked(false)}>דיווח</Link>
                 <Link href="/procedures" className={`${getLinkClass('/procedures')} py-2 block`} onClick={() => setClicked(false)}>נהלים</Link>
                 <Link href="/exam-bot" className={`${getLinkClass('/exam-bot')} py-2 block`} onClick={() => setClicked(false)}>בוט בחינות</Link>
            </div>
        </nav>
    );
};

export default Navbar;