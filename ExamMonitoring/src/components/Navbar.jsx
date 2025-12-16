import { Component } from "react";
import { Link, NavLink } from "react-router-dom";

class Navbar extends Component {
    state={
        clicked: false
    }
    handleClick = () => {
        this.setState({clicked: !this.state.clicked})
    }
    render() 
    {
        return (
        <>
            <nav className="flex items-center justify-between bg-[#1b2430] py-5 px-20 shadow-[0_5px_15px_rgba(0,0,0,0.06)]">
                <a href="index.html">
                    <svg id="logo-15" width="49" height="48" viewBox="0 0 49 48" fill="none" xmlns="http://www.w3.org/2000/svg"> <path d="M24.5 12.75C24.5 18.9632 19.4632 24 13.25 24H2V12.75C2 6.53679 7.03679 1.5 13.25 1.5C19.4632 1.5 24.5 6.53679 24.5 12.75Z" className="ccustom" fill="#17CF97"></path> <path d="M24.5 35.25C24.5 29.0368 29.5368 24 35.75 24H47V35.25C47 41.4632 41.9632 46.5 35.75 46.5C29.5368 46.5 24.5 41.4632 24.5 35.25Z" className="ccustom" fill="#17CF97"></path> <path d="M2 35.25C2 41.4632 7.03679 46.5 13.25 46.5H24.5V35.25C24.5 29.0368 19.4632 24 13.25 24C7.03679 24 2 29.0368 2 35.25Z" className="ccustom" fill="#17CF97"></path> <path d="M47 12.75C47 6.53679 41.9632 1.5 35.75 1.5H24.5V12.75C24.5 18.9632 29.5368 24 35.75 24C41.9632 24 47 18.9632 47 12.75Z" className="ccustom" fill="#17CF97"></path> </svg>
                </a>
                <div>
                    <ul className={this.state.clicked 
                            ? "flex flex-col items-start justify-start fixed top-[90px] right-0 w-[300px] h-screen bg-[#1b2430] z-50 p-8 shadow-lg transition-all duration-300" 
                            : "hidden md:flex items-center justify-center"}>
                        <li className="list-none px-5 py-4 md:py-0 relative"><NavLink to="/" className="no-underline text-[1.3rem] font-semibold text-white transition duration-300 ease-in-out hover:text-[#17cf97] hover:after:content-[''] 
                    hover:after:absolute hover:after:w-[30%] hover:after:h-[2px] hover:after:bg-[#17cf97] hover:after:bottom-[-4px] hover:after:left-[20px]">Home</NavLink></li>
                        <li className="list-none px-5 py-4 md:py-0 relative"><NavLink to="/exam-clock" className="no-underline text-[1.3rem] font-semibold text-white transition duration-300 ease-in-out hover:text-[#17cf97] hover:after:content-[''] 
                    hover:after:absolute hover:after:w-[30%] hover:after:h-[2px] hover:after:bg-[#17cf97] hover:after:bottom-[-4px] hover:after:left-[20px]">Exam Clock</NavLink></li>
                        <li className="list-none px-5 py-4 md:py-0 relative"><NavLink to="/attendance" className="no-underline text-[1.3rem] font-semibold text-white transition duration-300 ease-in-out hover:text-[#17cf97] hover:after:content-[''] 
                    hover:after:absolute hover:after:w-[30%] hover:after:h-[2px] hover:after:bg-[#17cf97] hover:after:bottom-[-4px] hover:after:left-[20px]">Attendance Sheet</NavLink></li>
                        <li className="list-none px-5 py-4 md:py-0 relative"><NavLink to="/report" className="no-underline text-[1.3rem] font-semibold text-white transition duration-300 ease-in-out hover:text-[#17cf97] hover:after:content-[''] 
                    hover:after:absolute hover:after:w-[30%] hover:after:h-[2px] hover:after:bg-[#17cf97] hover:after:bottom-[-4px] hover:after:left-[20px]">Report</NavLink></li>
                        <li className="list-none px-5 py-4 md:py-0 relative"><NavLink to="/procedures" className="no-underline text-[1.3rem] font-semibold text-white transition duration-300 ease-in-out hover:text-[#17cf97] hover:after:content-[''] 
                    hover:after:absolute hover:after:w-[30%] hover:after:h-[2px] hover:after:bg-[#17cf97] hover:after:bottom-[-4px] hover:after:left-[20px]">Procedures</NavLink></li>
                        <li className="list-none px-5 py-4 md:py-0 relative"><NavLink to="/exam-bot" className="no-underline text-[1.3rem] font-semibold text-white transition duration-300 ease-in-out hover:text-[#17cf97] hover:after:content-[''] 
                    hover:after:absolute hover:after:w-[30%] hover:after:h-[2px] hover:after:bg-[#17cf97] hover:after:bottom-[-4px] hover:after:left-[20px]">Exam Bot</NavLink></li>
                    </ul>
                </div>

                <div id="mobile" className="text-white flex items-center text-white md:hidden" onClick={this.handleClick}>
                    <i id="bar" className={this.state.clicked ? 'fas fa-times' : 'fas fa-bars'}></i>
                </div>
            </nav>
        </>
    );
    }
}
export default Navbar;